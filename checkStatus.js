const https = require('https');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const sites = [];

fs.createReadStream(path.join(__dirname, 'data', 'sites.csv'))
    .pipe(csv())
    .on('data', (row) => {
        sites.push(row.url);
    })
    .on('end', () => {
        console.log(`Loaded ${sites.length} sites from sites.csv`);
        checkSites(sites);
    });

function checkSites(sites) {
    let failedSites = [];

    sites.forEach(site => {
        https.get(site, (res) => {
            if (res.statusCode !== 200) {
                failedSites.push(site);
                console.error(`Site ${site} failed with status code ${res.statusCode}`);
            }
        }).on('error', (e) => {
            failedSites.push(site);
            console.error(`Site ${site} failed with error: ${e.message}`);
        });
    });

    if (failedSites.length > 0) {
        console.log(`The following sites failed: ${failedSites.join(', ')}`);
        const output = {
            failed_sites: failedSites.join('\n')
        };
        console.log(JSON.stringify(output));
    } else {
        console.log('All sites passed');
    }
}