const config = {
    db: process.env.NODE_ENV === 'mongodb+srv://user-lourenco:K3Sf3mxcB8@cluster0.cahnque.mongodb.net/gym',
    secret: 'a-string-secret-at-least-256-bits-long',
    expiresPassword: 86400, // expires in 24hours
    saltRounds: 10
}

module.exports = config;