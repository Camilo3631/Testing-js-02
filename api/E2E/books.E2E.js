// books.E2E.js

// Aumenta el timeout global a 120 segundos (más seguro en CI)
jest.setTimeout(120000);

const request = require('supertest');
const { MongoClient } = require('mongodb');
const createApp = require('../src/app');
const { config } = require('../src/config');

const DB_NAME = config.dbName;
const MONGO_URI = config.dbUrl;

describe('Test for books', () => {
    let app = null;
    let database = null;
    let client = null;

    // Helper: espera a que MongoDB esté listo
    const waitForMongo = async () => {
        let connected = false;
        let attempts = 0;
        while (!connected && attempts < 15) { // hasta 15 intentos
            try {
                client = new MongoClient(MONGO_URI);
                await client.connect();
                connected = true;
            } catch (err) {
                attempts++;
                console.log(`Mongo not ready yet, retry ${attempts}/15`);
                await new Promise(res => setTimeout(res, 5000)); // espera 5s
            }
        }
        if (!connected) {
            throw new Error('MongoDB did not connect after retries');
        }
        database = client.db(DB_NAME);
    };

    beforeAll(async () => {
        app = createApp();
        await waitForMongo();
    });

    afterAll(async () => {
        if (client) await client.close();
    });

    // Limpieza después de cada test
    afterEach(async () => {
        await database.collection('books').deleteMany({});
    });

    describe('test for [GET] /api/v1/books', () => {
        test('should return a list of books', async () => {
            // Arrange: semilla de datos
            const seedData = await database.collection('books').insertMany([
                { name: 'Book1', year: 1998, author: 'Kamil' },
                { name: 'Book2', year: 2020, author: 'Kamil' },
            ]);

            // Act & Assert
            const res = await request(app)
                .get('/api/v1/books')
                .expect(200);

            expect(res.body.length).toEqual(seedData.insertedCount);
        });
    });
});
