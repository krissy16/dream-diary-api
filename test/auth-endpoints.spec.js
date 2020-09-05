const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Auth Endpoints', () => {
    let db; 
    let authToken;

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

    beforeEach('register user', () => {
        return supertest(app)
        .post('/api/users')
        .send(testUsers[0])
        .then(res=>{
            supertest(app)
            .post('/api/auth/login')
            .send(testUsers[0])
            .then(res=> {
               authToken = res.body.authToken;
            })
        })
    })

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/auth/login`, () => {
        /*beforeEach('insert users', () => {
           return helpers.seedUserTable(db, testUsers);
        })*/
        it('adds a new user to the database', () => {
            const loginUser = testUsers[0];
            return supertest(app)
                .post('/api/auth/login')
                .send(loginUser)
                .expect(200)
                .expect(res => {
                    expect(res.authToken)
                });
        });
        it('gets user with authToken', () => {
            
            return supertest(app)
                .get('/api/auth/')
                .expect(200)
                .set({Authorization: `Bearer ${authToken}`})
                .expect(200)
                .expect(res => {
                    expect(res.body.email,testUsers[0].email);   
                });
        });
    })
})