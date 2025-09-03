// books.E2E.js

// Aumenta el timeout global a 90 segundos
jest.setTimeout(90000);

const request = require('supertest');
const { MongoClient } = require('mongodb');
const createApp = require('../src/app');
const { config } = require('../src/config');

const DB_NAME = config.dbName;
const MONGO_URI = config.dbUrl;

describe('Test for books', () => {
    let app = null;
    let server = null;
    let database = null;
    let client = null;

    beforeAll(async () => {
        app = createApp();
        server = app.listen(3002);

        client = new MongoClient(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Retry de conexión a MongoDB
        let connected = false;
        let attempts = 0;
        while (!connected && attempts < 5) {
            try {
                await client.connect();
                connected = true;
            } catch (err) {
                attempts++;
                console.log(`Mongo not ready yet, retry ${attempts}/5`);
                await new Promise(res => setTimeout(res, 5000)); // espera 5s
            }
        }

        if (!connected) {
            throw new Error('MongoDB did not connect after retries');
        }

        database = client.db(DB_NAME);
    });

    afterAll(async () => {
        if (server) await server.close();
        if (client) await client.close();
    });

    describe('test for [GET] /api/v1/books', () => {
        test('should return a list of books', async () => {
            // Arrange: semilla de datos
            const seedData = await database.collection('books').insertMany([
                { name: 'Book1', year: 1998, author: 'Kamil' },
                { name: 'Book2', year: 2020, author: 'Kamil' },
            ]);

            // Act & Assert
            return request(app)
                .get('/api/v1/books')
                .expect(200)
                .then(({ body }) => {
                    console.log(body);
                    expect(body.length).toEqual(seedData.insertedCount);
                });
        });
    });
});
