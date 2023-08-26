const fs = require('fs');
const csvParser = require('csv-parser');
const path = require('path');

// Usage: node exportCSVToJsonKeyed.js inputFilePath keyHeader [columnsToExport]
const inputFilePath = process.argv[2];
const keyHeader = process.argv[3];
const columnsToExport = process.argv[4] ? process.argv[4].split(',') : null;

if (!inputFilePath || !keyHeader) {
    console.log('Usage: node exportCSVToJsonKeyed.js inputFilePath keyHeader [columnsToExport]');
} else {
    const inputDir = path.dirname(inputFilePath);
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(inputDir, `${inputFileName}.json`);

    const exportedData = {};

    fs.createReadStream(inputFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            const key = row[keyHeader];
            if (row.marketGroupID !== '' && row.marketGroupID !== 'None') {
                exportedData[key] = {};
                if (columnsToExport) {
                    columnsToExport.forEach(header => {
                        exportedData[key][header] = row[header] || '';
                    });
                } else {
                    Object.keys(row).forEach(header => {
                        if (header !== keyHeader) {
                            exportedData[key][header] = row[header];
                        }
                    });
                }
            }
        })
        .on('end', () => {
            fs.writeFileSync(outputFilePath, JSON.stringify(exportedData));
            console.log(`Data exported to: ${outputFilePath}`);
        });
}
