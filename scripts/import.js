require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const csvParser = require('csv-parser');

admin.initializeApp({
    credential: admin.credential.cert( {
        type: process.env.FIREBASE_KEY_TYPE,
        project_id: process.env.FIREBASE_KEY_PROJECT_ID,
        private_key_id: process.env.FIREBASE_KEY_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_KEY_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_KEY_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_KEY_CLIENT_ID,
        auth_uri: process.env.FIREBASE_KEY_AUTH_URI,
        token_uri: process.env.FIREBASE_KEY_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_KEY_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_KEY_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_KEY_UNIVERSE_DOMAIN,
    } )
});

// Get a Firestore reference
const db = admin.firestore();

// Function to import CSV data into a Firestore collection
async function importCSVToFirestore(collectionName, filePath, keyHeader) {
    try {
        const data = [];

        // Read CSV file and transform to JSON
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', async () => {
                if (data.length === 0) {
                    console.log('No data found in CSV.');
                    return;
                }

                const headerKeys = Object.keys(data[0]);

                // Create or get the Firestore collection
                const collectionRef = db.collection(collectionName);

                // Import JSON data into the collection
                for (const row of data) {
                    // Exclude rows with marketGroupID as "0", "None", or empty
                    if (collectionName === 'invTypes' && ['0', 'None', ''].includes(row.marketGroupID)) {
                        continue;
                    }

                    const documentData = {};
                    headerKeys.forEach(key => {
                        if (key === keyHeader || key !== 'description') {
                            documentData[key] = row[key];
                        }
                    });

                    // Use the specified keyHeader value as the document ID
                    await collectionRef.doc(documentData[keyHeader]).set(documentData);
                    console.log('Document added:', documentData);
                }

                console.log('Data imported successfully.');
            });
    } catch (error) {
        console.error('Error importing data:', error);
    }
}

// Usage: node importFirestoreCSV.js collectionName filePath keyHeader
const collectionName = process.argv[2];
const filePath = process.argv[3];
const keyHeader = process.argv[4]; // Header column name to use as the document key

if (!collectionName || !filePath || !keyHeader) {
    console.log('Usage: node importFirestoreCSV.js collectionName filePath keyHeader');
} else {
    importCSVToFirestore(collectionName, filePath, keyHeader);
}