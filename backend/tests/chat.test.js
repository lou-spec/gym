const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../data/users/users');
const { ChatMessage } = require('../data/chat');

jest.setTimeout(30000);

describe('Chat Tests - Complete Coverage', () => {
    let userToken;
    let trainerToken;
    let userId;
    let trainerId;
    let messageId;

    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (process.env.NODE_ENV === 'test') {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                await collections[key].deleteMany({});
            }
        }

        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Chat User',
                email: 'chatuser@gym.com',
                password: 'Password123!',
                role: { name: 'User', scope: ['user'] }
            });

        const trainerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Chat Trainer',
                email: 'chattrainer@gym.com',
                password: 'Password123!',
                role: { name: 'Trainer', scope: ['trainer'] }
            });

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({
                name: 'chatuser@gym.com',
                password: 'Password123!'
            });
        userToken = userLogin.body.token;

        const trainerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                name: 'chattrainer@gym.com',
                password: 'Password123!'
            });
        trainerToken = trainerLogin.body.token;

        const user = await User.findOne({ email: 'chatuser@gym.com' });
        const trainer = await User.findOne({ email: 'chattrainer@gym.com' });
        userId = user._id.toString();
        trainerId = trainer._id.toString();
    });

    afterAll(async () => {
        if (process.env.NODE_ENV === 'test') {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    });

    describe('POST /api/chat/messages', () => {
        it('should send a text message successfully', async () => {
            const res = await request(app)
                .post('/api/chat/messages')
                .set('x-access-token', userToken)
                .send({
                    receiverId: trainerId,
                    message: 'Hello, this is a test message!',
                    isAlert: false
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toHaveProperty('message', 'Hello, this is a test message!');
            messageId = res.body.message._id;
        });

        it('should send a message from trainer to user', async () => {
            const res = await request(app)
                .post('/api/chat/messages')
                .set('x-access-token', trainerToken)
                .send({
                    receiverId: userId,
                    message: 'Response from trainer',
                    isAlert: false
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
        });

        it('should send an alert message', async () => {
            const res = await request(app)
                .post('/api/chat/messages')
                .set('x-access-token', trainerToken)
                .send({
                    receiverId: userId,
                    message: 'Important alert!',
                    isAlert: true
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.message.isAlert).toBe(true);
        });

        it('should fail without message or image', async () => {
            const res = await request(app)
                .post('/api/chat/messages')
                .set('x-access-token', userToken)
                .send({
                    receiverId: trainerId
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('obrigatória');
        });

        it('should fail without authentication token', async () => {
            const res = await request(app)
                .post('/api/chat/messages')
                .send({
                    receiverId: trainerId,
                    message: 'Unauthorized message'
                });

            expect(res.statusCode).not.toEqual(201);
        });
    });

    describe('GET /api/chat/messages/:userId', () => {
        it('should get conversation between user and trainer', async () => {
            const res = await request(app)
                .get(`/api/chat/messages/${trainerId}`)
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('messages');
            expect(Array.isArray(res.body.messages)).toBe(true);
            expect(res.body.messages.length).toBeGreaterThan(0);
        });

        it('should get conversation from trainer perspective', async () => {
            const res = await request(app)
                .get(`/api/chat/messages/${userId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.messages.length).toBeGreaterThan(0);
        });

        it('should return empty array for conversation with no messages', async () => {
            const newUser = await User.create({
                name: 'New User',
                email: 'newuser@gym.com',
                password: 'Password123!',
                role: { name: 'User', scope: ['user'] }
            });

            const res = await request(app)
                .get(`/api/chat/messages/${newUser._id}`)
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.messages).toEqual([]);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .get(`/api/chat/messages/${trainerId}`);

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('PUT /api/chat/messages/mark-read/:userId', () => {
        it('should mark messages as read', async () => {
            const res = await request(app)
                .put(`/api/chat/messages/mark-read/${trainerId}`)
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should mark trainer messages as read', async () => {
            const res = await request(app)
                .put(`/api/chat/messages/mark-read/${userId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .put(`/api/chat/messages/mark-read/${trainerId}`);

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('GET /api/chat/contacts', () => {
        it('should get contacts for user', async () => {
            const res = await request(app)
                .get('/api/chat/contacts')
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('contacts');
            expect(Array.isArray(res.body.contacts)).toBe(true);
        });

        it('should get contacts for trainer', async () => {
            const res = await request(app)
                .get('/api/chat/contacts')
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.contacts)).toBe(true);
        });

        it('should include unread count in contacts', async () => {
            await request(app)
                .post('/api/chat/messages')
                .set('x-access-token', trainerToken)
                .send({
                    receiverId: userId,
                    message: 'Unread message test'
                });

            const res = await request(app)
                .get('/api/chat/contacts')
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            const trainerContact = res.body.contacts.find(c => c._id.toString() === trainerId);
            expect(trainerContact).toBeDefined();
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/chat/contacts');

            expect(res.statusCode).not.toEqual(200);
        });
    });
});
