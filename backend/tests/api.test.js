const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Import app
const User = require('../data/users/users');

// Aumentar timeout para conexão DB
jest.setTimeout(30000);

describe('Backend Integration Tests', () => {
    let userToken;
    let trainerToken;
    let adminToken;
    let userId;
    let trainerId;

    // Cleanup antes e depois
    beforeAll(async () => {
        // Esperar um pouco para garantir conexão (mongoose buffers, mas por via das dúvidas)
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Limpar DB de testes
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

    describe('Auth Endpoints', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'testuser@gym.com',
                    password: 'password123',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('auth', true);
            // No token expected on register
        });

        it('should login with created user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'testuser@gym.com', // Backend expects 'name' (searches in email or name)
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.auth).toBe(true);
            userToken = res.body.token; // Refresh token just in case
        });

        it('should fail login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testuser@gym.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
        });

        it('should register a trainer', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Trainer',
                    email: 'trainer@gym.com',
                    password: 'password123',
                    role: { name: 'Trainer', scope: ['trainer'] }
                });

            expect(res.statusCode).toEqual(200);

            // Login to get token
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'trainer@gym.com', // Backend expects 'name'
                    password: 'password123'
                });
            expect(loginRes.statusCode).toEqual(200);
            trainerToken = loginRes.body.token;
        });
    });

    describe('User Endpoints', () => {
        it('should get own profile', async () => {
            const res = await request(app)
                .get('/api/users/perfil')
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.user).toHaveProperty('email', 'testuser@gym.com');
            userId = res.body.user._id;
        });

        it('should fail getting profile without token', async () => {
            const res = await request(app)
                .get('/api/users/perfil');
            // Middleware might return 401 or 403 or 500 w/ error
            // Checking middleware/token.js behaviour if easy, or expect 401/403/500
            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('Workouts Endpoints', () => {
        // Precisa do ID do cliente e trainer
        // Vamos usar userId e o token do trainer

        it('should create a workout plan (Trainer Only)', async () => {
            // Primeiro precisamos do ID do user. Já temos userId.
            const res = await request(app)
                .post('/api/workouts/plans')
                .set('x-access-token', trainerToken)
                .send({
                    clientId: userId,
                    name: 'Hypertrophy Plan',
                    goal: 'Build Muscle',
                    weeklyFrequency: 3
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.plan).toHaveProperty('name', 'Hypertrophy Plan');
        });

        it('should get my plan (Client)', async () => {
            const res = await request(app)
                .get('/api/workouts/plans/my-plan')
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('plan');
            if (res.body.plan) {
                expect(res.body.plan.name).toBe('Hypertrophy Plan');
            }
        });
    });
});
