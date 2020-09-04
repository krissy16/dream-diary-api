const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Dreams Endpoints', () => {
  let db;

  const {
    testUsers,
    testDreams,
  } = helpers.makeDreamsFixtures();

  const authToken = helpers.makeAuthToken();

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


  describe(`GET /api/dreams`, () => {
    context(`Given no dreams`, () => {
      beforeEach('insert users', () => 
        helpers.seedUserTable(
          db,
          testUsers
        )
      )
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/dreams')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200, []);
      })
    })

    context('Given there are dreams in the database', () => {
      beforeEach('insert dreams', () => 
        helpers.seedDreamsTables(
          db,
          testUsers,
          testDreams,
        )
      )

      it('responds with 200 and all of the things', () => {
        const expectedDreams = testDreams.map(dream => 
          helpers.makeExpectedDream(
            testUsers,
            dream
          )
        );
        return supertest(app)
            .get('/api/dreams')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
            //.expect(200, expectedDreams)
      })
    })

    context(`Given an XSS attack dream`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const { maliciousDream, expectedDream } = helpers.makeMaliciousDream(testUser);

      beforeEach('insert malicious dream', () => {
        helpers.seedMaliciousDream(
          db,
          testUser,
          maliciousDream,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/dreams')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedDream.title)
            expect(res.body[0].content).to.eql(expectedDream.content)
          });
      })
    })
  })

  describe(`POST /api/dreams`, () => {
    beforeEach('insert users', () => 
      helpers.seedUserTable(
        db,
        testUsers
      )
    )

    it('adds a new dream to the databse', () => {
      const newDream = {
        title: 'Test title',
        content: 'test content',
        user_id: 1
      };
      return supertest(app)
        .post('/api/dreams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newDream)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newDream.title)
          expect(res.body.content).to.eql(newDream.content)
        })
        .then(res =>
          supertest(app)
            .get(`/api/dreams/${res.body.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(res.body)
        )
    });
  })

  describe(`GET /api/dreams/:dream_id`, () => {
    context(`Given no dreams`, () => {
      beforeEach('insert users', () => 
        helpers.seedUserTable(
          db,
          testUsers
        )
      )

      it(`responds with 404`, () => {
        const dreamId = 123456;
        return supertest(app)
          .get(`/api/dreams/${dreamId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404, { error: {message: `Dream doesn't exist`} });
      })
    })

    context('Given there are dreams in the database', () => {
      beforeEach('insert dreams', () => 
        helpers.seedDreamsTables(
          db,
          testUsers,
          testDreams
        )
      )

      it('responds with 200 and the specified dream', () => {
        const dreamId = 2;
        const expectedDream = helpers.makeExpectedDream(
          testUsers,
          testDreams[dreamId - 1],
        );

        return supertest(app)
          .get(`/api/dreams/${dreamId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200, expectedDream);
      })
    })

    context.skip(`Given an XSS attack dream`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const { maliciousDream, expectedDream } = helpers.makeMaliciousDream(testUser);

      beforeEach('insert malicious dream', () => {
        return helpers.seedMaliciousDream(
          db,
          testUser,
          maliciousDream,
        );
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/dreams/${maliciousDream.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedDream.title)
            expect(res.body[0].content).to.eql(expectedDream.content)
          });
      })
    })
  })

  describe(`PATCH /api/dreams/:dream_id`, () => {
    beforeEach('insert dreams', () => 
        helpers.seedDreamsTables(
          db,
          testUsers,
          testDreams
        )
      )

    it('edits dream in the databse', () => {
      const editedDream = {
        id: 1,
        title: 'Test title edited',
        content: 'test content'
      };
      return supertest(app)
        .patch(`/api/dreams/${editedDream.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(editedDream)
        .expect(204)
        .then(res =>
          supertest(app)
            .get(`/api/dreams/${editedDream.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(res.body.id).to.eql(editedDream.id)
        );
    })
  })

  describe(`GET /api/dreams/byUserId/:user_id`, () => {
    context('Given there are dreams in the database for this user', () => {
      beforeEach('insert dreams', () => 
        helpers.seedDreamsTables(
          db,
          testUsers,
          testDreams
        )
      )

      it('responds with 200 and the specified dreams', () => {
        const userId = 2;
        const expectedDream = helpers.makeExpectedDream(
          testUsers,
          testDreams[2],
        );

        return supertest(app)
          .get(`/api/dreams/byUserId/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200, [expectedDream]);
      })
    })
  })
})