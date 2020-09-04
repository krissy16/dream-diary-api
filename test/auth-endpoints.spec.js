const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Auth Endpoints', () => {
    let db; 

    const { testUsers } = helpers.makeDreamsFixtures();

    
    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/auth/login`, () => {
        beforeEach('insert users', () => {
           return helpers.seedUserTable(db, testUsers);
        })
        it('adds a new user to the database', () => {
            const loginUser = testUsers[1];
            return supertest(app)
                .post('/api/auth/login')
                .send(loginUser)
                .expect(201)
                .expect(res => {
                    expect(res.authToken)
                });
        })
    })
})