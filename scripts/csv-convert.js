const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');

// Usage: node exportCSVColumns.js inputFilePath headers
const inputFilePath = process.argv[2];
const headersToExport = process.argv[3].split(',');

if (!inputFilePath || !headersToExport) {
    console.log('Usage: node exportCSVColumns.js inputFilePath headers');
} else {
    const inputDir = path.dirname(inputFilePath);
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFileName = `${inputFileName}-converted.csv`;
    const outputFilePath = path.join(inputDir, outputFileName);

    const exportedData = [];

    fs.createReadStream(inputFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            const exportedRow = {};
            headersToExport.forEach(header => {
                exportedRow[header] = row[header] || '';
            });
            exportedData.push(exportedRow);
        })
        .on('end', () => {
            const csvContent = [
                headersToExport.join(','),
                ...exportedData.map(row => headersToExport.map(header => `"${row[header]}"`).join(','))
            ].join('\n');

            fs.writeFileSync(outputFilePath, csvContent);
            console.log(`Data exported to: ${outputFilePath}`);
        });
}
