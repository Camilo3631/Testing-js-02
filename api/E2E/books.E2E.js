// books.E2E.js

jest.setTimeout(180000); // 3 minutos, más seguro en CI

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

    // ------------------------------
    // Helper: espera a que MongoDB esté listo
    // ------------------------------
    const waitForMongo = async () => {
        let connected = false;
        let attempts = 0;
        const maxAttempts = 30; // hasta 30 intentos
        const waitTime = 5000;  // 5s cada intento => hasta 150s

        while (!connected && attempts < maxAttempts) {
            try {
                client = new MongoClient(MONGO_URI);
                await client.connect();
                connected = true;
            } catch (err) {
                attempts++;
                console.log(`Mongo not ready yet, retry ${attempts}/${maxAttempts}`);
                await new Promise(res => setTimeout(res, waitTime));
            }
        }

        if (!connected) {
            throw new Error('MongoDB did not connect after retries');
        }

        database = client.db(DB_NAME);
    };

    // ------------------------------
    // Setup antes de los tests
    // ------------------------------
    beforeAll(async () => {
        app = createApp();       // Supertest puede usar directamente app
        await waitForMongo();    // espera a MongoDB
    });

    afterAll(async () => {
        if (client) await client.close();
    });

    // ------------------------------
    // Limpieza después de cada test
    // ------------------------------
    afterEach(async () => {
        if (database) {
            await database.collection('books').deleteMany({});
        }
    });

    // ------------------------------
    // Tests
    // ------------------------------
    describe('GET /api/v1/books', () => {
        test('should return a list of books', async () => {
            if (!database) throw new Error('Database not initialized');

            // Arrange: semilla de datos
            const seedData = await database.collection('books').insertMany([
                { name: 'Book1', year: 1998, author: 'Kamil' },
                { name: 'Book2', year: 2020, author: 'Kamil' },
            ]);

            // Act
            const res = await request(app)
                .get('/api/v1/books')
                .expect(200);

            // Assert
            expect(res.body.length).toEqual(seedData.insertedCount);
        });
    });
});
