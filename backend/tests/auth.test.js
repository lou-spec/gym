const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../data/users/users');
const crypto = require('crypto');

jest.setTimeout(30000);

describe('Auth Tests - Complete Coverage', () => {
    let userToken;
    let userId;
    let resetToken;

    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (process.env.NODE_ENV === 'test') {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                await collections[key].deleteMany({});
            }
        }
    });

    afterAll(async () => {
        if (process.env.NODE_ENV === 'test') {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Auth Test User',
                    email: 'authtest@gym.com',
                    password: 'Password123!',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('auth', true);
            expect(res.body.message).toContain('sucesso');
        });

        it('should reject registration with duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'authtest@gym.com',
                    password: 'Password123!',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('email já está registado');
        });

        it('should reject registration with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Invalid Email User',
                    email: 'invalidemail',
                    password: 'Password123!',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Email inválido');
        });

        it('should reject registration with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Short Pass User',
                    email: 'shortpass@gym.com',
                    password: '123',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('pelo menos 6 caracteres');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'authtest@gym.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.auth).toBe(true);
            expect(res.body).toHaveProperty('token');
            userToken = res.body.token;

            const user = await User.findOne({ email: 'authtest@gym.com' });
            userId = user._id;
        });

        it('should fail login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'authtest@gym.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
        });

        it('should fail login with non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'nonexistent@gym.com',
                    password: 'anypassword'
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should send password reset email for valid email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'authtest@gym.com' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('Email de recuperação enviado');

            const user = await User.findOne({ email: 'authtest@gym.com' });
            expect(user.resetPasswordToken).toBeDefined();
            expect(user.resetPasswordExpiry).toBeDefined();
        });

        it('should return 404 for non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@gym.com' });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain('Email não encontrado');
        });

        it('should return 400 for missing email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Email é obrigatório');
        });
    });

    describe('POST /api/auth/reset-password/:token', () => {
        beforeAll(async () => {
            resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
            const resetTokenExpiry = Date.now() + 3600000;

            await User.findOneAndUpdate(
                { email: 'authtest@gym.com' },
                {
                    resetPasswordToken: resetTokenHash,
                    resetPasswordExpiry: resetTokenExpiry
                }
            );
        });

        it('should reset password with valid token', async () => {
            const res = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({
                    password: 'NewPassword123!',
                    confirmPassword: 'NewPassword123!'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('Password redefinida com sucesso');
        });

        it('should fail with mismatched passwords', async () => {
            const newToken = crypto.randomBytes(32).toString('hex');
            const newTokenHash = crypto.createHash('sha256').update(newToken).digest('hex');

            await User.findOneAndUpdate(
                { email: 'authtest@gym.com' },
                {
                    resetPasswordToken: newTokenHash,
                    resetPasswordExpiry: Date.now() + 3600000
                }
            );

            const res = await request(app)
                .post(`/api/auth/reset-password/${newToken}`)
                .send({
                    password: 'NewPassword456!',
                    confirmPassword: 'DifferentPassword!'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('não coincidem');
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password/invalidtoken123')
                .send({
                    password: 'NewPassword789!',
                    confirmPassword: 'NewPassword789!'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('inválido ou expirado');
        });
    });

    describe('GET /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const res = await request(app)
                .get('/api/auth/logout')
                .set('Cookie', `token=${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('logout', true);
        });
    });

    describe('GET /api/auth/me', () => {
        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'authtest@gym.com',
                    password: 'NewPassword123!'
                });
            userToken = loginRes.body.token;
        });

        it('should return user info with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(202);
            expect(res.body.auth).toBe(true);
            expect(res.body).toHaveProperty('decoded');
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.statusCode).not.toEqual(202);
        });
    });
});
