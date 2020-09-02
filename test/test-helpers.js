const AuthService = require('../src/auth/auth-service')

function makeUsersArray(){
    return [
        {
            id: 1,
            email: 'testuser1@email.com',
            password: 'password'
        },
        {
            id: 2,
            email: 'testuser2@email.com',
            password: 'password'
        },
        {
            id: 3,
            email: 'testuser3@email.com',
            password: 'password'
        }
    ]
}

function makeDreamsArray(users){
    return [
        {
            id: 1,
            title: 'Sample Dream 1',
            content: 'sample context',
            date_created: '2029-01-22T16:28:32.615Z',
            notes: 'note one, two, three',
            archived: false,
            user_id: users[0].id
        },
        {
            id: 2,
            title: 'Sample Dream 2',
            content: 'sample context',
            date_created: '2029-01-22T16:28:32.615Z',
            notes: 'note one, two, three',
            archived: false,
            user_id: users[0].id
        },
        {
            id: 3,
            title: 'Sample Dream 3',
            content: 'sample context',
            date_created: '2029-01-22T16:28:32.615Z',
            notes: 'note one, two, three',
            archived: false,
            user_id: users[1].id
        },
        {
            id: 4,
            title: 'Sample Dream 4',
            content: 'sample context',
            date_created: '2029-01-22T16:28:32.615Z',
            notes: 'note one, two, three',
            archived: false,
            user_id: users[2].id
        }
    ]
}

function makeExpectedDream(users, dream){
    const user = users
        .find(user => user.id === dream.user_id)
    
    return{
        id: dream.id,
        title: dream.title,
        content: dream.content,
        date_created: dream.date_created,
        notes: dream.notes,
        archived: dream.archived,
        user_id: dream.user_id
    }
}

function makeMaliciousDream(user){
    const maliciousDream = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,    
        date_created: new Date().toISOString(),
        user_id: user.id,
        notes: 'malicious notes list, muahahaha',
        archived: false
    }
    const expectedDream = {
        ...makeExpectedDream([user], maliciousDream),
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,    
    }
    return {
        maliciousDream,
        expectedDream,
    }
}

function makeDreamsFixtures(){
    const testUsers = makeUsersArray()
    const testDreams = makeDreamsArray(testUsers)
    return { testUsers, testDreams}
}

function cleanTables(db){
    return db.raw(
        `TRUNCATE
            dreams,
            users
            RESTART IDENTITY CASCADE`
    )
}

function seedUserTable(db, users){
    return db
        .into('users')
        .insert(users)
}

function seedDreamsTables(db, users, dreams){
    return db
        .into('users')
        .insert(users)
        .then(() => 
            db  
                .into('dreams')
                .insert(dreams)
        )
}

function seedMaliciousDream(db, user, dream){
    return db
        .into('users')
        .insert([user])
        .then(() => 
            db
                .into('dreams')
                .insert([dream])
        )
}

function makeAuthToken(){  
    const dbUser = makeUsersArray()[1]
    const sub = dbUser.email
    const payload = { user_id: dbUser.id }

    return AuthService.createJwt(sub, payload)
}

module.exports = {
    makeUsersArray,
    makeDreamsArray,
    makeExpectedDream,
    makeMaliciousDream,
    makeDreamsFixtures,
    makeAuthToken,
    cleanTables,
    seedUserTable,
    seedDreamsTables,
    seedMaliciousDream
}