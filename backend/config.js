const config = {
    db: process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/gym_test' : 'mongodb://localhost:27017/gym',
    secret: 'a-string-secret-at-least-256-bits-long',
    expiresPassword: 86400, // expires in 24hours
    saltRounds: 10
}

module.exports = config;