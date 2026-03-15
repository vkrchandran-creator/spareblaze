const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Tata_logo.svg/320px-Tata_logo.svg.png';
const dest = 'd:/Ram/spareblaze.com/images/tata.png';

const file = fs.createWriteStream(dest);
https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close();
        console.log('Tata logo downloaded successfully to ' + dest);
    });
}).on('error', function (err) {
    fs.unlink(dest);
    console.error('Error downloading Tata logo: ' + err.message);
});
