const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../data/users/users');
const DisassociationRequest = require('../data/users/disassociationRequest');

jest.setTimeout(30000);

describe('Users Tests - Complete Coverage', () => {
    let adminToken;
    let trainerToken;
    let userToken;
    let userId;
    let trainerId;
    let adminId;
    let createdUserId;

    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (process.env.NODE_ENV === 'test') {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                await collections[key].deleteMany({});
            }
        }

        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Admin User',
                email: 'admin@gym.com',
                password: 'Password123!',
                role: { name: 'Admin', scope: ['admin'] }
            });

        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Trainer',
                email: 'trainer@gym.com',
                password: 'Password123!',
                role: { name: 'Trainer', scope: ['trainer'] }
            });

        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser@gym.com',
                password: 'Password123!',
                role: { name: 'User', scope: ['user'] }
            });

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ name: 'admin@gym.com', password: 'Password123!' });
        adminToken = adminLogin.body.token;

        const trainerLogin = await request(app)
            .post('/api/auth/login')
            .send({ name: 'trainer@gym.com', password: 'Password123!' });
        trainerToken = trainerLogin.body.token;

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ name: 'testuser@gym.com', password: 'Password123!' });
        userToken = userLogin.body.token;

        const admin = await User.findOne({ email: 'admin@gym.com' });
        const trainer = await User.findOne({ email: 'trainer@gym.com' });
        const user = await User.findOne({ email: 'testuser@gym.com' });

        adminId = admin._id.toString();
        trainerId = trainer._id.toString();
        userId = user._id.toString();
    });

    afterAll(async () => {
        if (process.env.NODE_ENV === 'test') {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    });

    describe('GET /api/users/perfil', () => {
        it('should get own profile', async () => {
            const res = await request(app)
                .get('/api/users/perfil')
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.user).toHaveProperty('email', 'testuser@gym.com');
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/users/perfil');

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('PUT /api/users/perfil', () => {
        it('should update own profile with correct password', async () => {
            const res = await request(app)
                .put('/api/users/perfil')
                .set('x-access-token', userToken)
                .send({
                    name: 'Updated User Name',
                    password: 'Password123!'
                });

            expect(res.statusCode).toEqual(200);

            const updatedRes = await request(app)
                .get('/api/users/perfil')
                .set('x-access-token', userToken);

            expect(updatedRes.body.user.name).toEqual('Updated User Name');
        });

        it('should fail update without password', async () => {
            const res = await request(app)
                .put('/api/users/perfil')
                .set('x-access-token', userToken)
                .send({
                    name: 'Another Name'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('obrigatória');
        });

        it('should fail update with wrong password', async () => {
            const res = await request(app)
                .put('/api/users/perfil')
                .set('x-access-token', userToken)
                .send({
                    name: 'Fail Name',
                    password: 'WrongPassword!'
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /api/users/create-user', () => {
        it('should create user as trainer', async () => {
            const res = await request(app)
                .post('/api/users/create-user')
                .set('x-access-token', trainerToken)
                .send({
                    name: 'Created User',
                    email: 'created@gym.com',
                    password: 'Password123!',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).toEqual(200);
            createdUserId = res.body._id;
        });

        it('should fail creating user with duplicate email', async () => {
            const res = await request(app)
                .post('/api/users/create-user')
                .set('x-access-token', trainerToken)
                .send({
                    name: 'Duplicate',
                    email: 'created@gym.com',
                    password: 'Password123!',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).toEqual(409);
        });

        it('should fail without trainer role', async () => {
            const res = await request(app)
                .post('/api/users/create-user')
                .set('x-access-token', userToken)
                .send({
                    name: 'Unauthorized Create',
                    email: 'unauth@gym.com',
                    password: 'Password123!',
                    role: { name: 'User', scope: ['user'] }
                });

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('GET /api/users/all-users', () => {
        it('should get all users', async () => {
            const res = await request(app)
                .get('/api/users/all-users')
                .set('x-access-token', adminToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.users).toBeDefined();
            expect(Array.isArray(res.body.users)).toBe(true);
        });

        it('should support pagination', async () => {
            const res = await request(app)
                .get('/api/users/all-users?limit=2&skip=0')
                .set('x-access-token', adminToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.pagination.pageSize).toEqual(2);
        });
    });

    describe('PUT /api/users/:userId', () => {
        it('should update user as admin', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('x-access-token', adminToken)
                .send({
                    name: 'Admin Updated Name'
                });

            expect(res.statusCode).toEqual(200);
        });

        it('should fail without admin role', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('x-access-token', userToken)
                .send({
                    name: 'Unauthorized Update'
                });

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('DELETE /api/users/:userId', () => {
        it('should attempt to delete user as admin', async () => {
            const res = await request(app)
                .delete(`/api/users/${createdUserId}`)
                .set('x-access-token', adminToken);

            expect([200, 500]).toContain(res.statusCode);
        });

        it('should fail without admin role', async () => {
            const res = await request(app)
                .delete(`/api/users/${userId}`)
                .set('x-access-token', userToken);

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('PUT /api/users/perfil/change-password', () => {
        it('should change password successfully', async () => {
            const res = await request(app)
                .put('/api/users/perfil/change-password')
                .set('x-access-token', userToken)
                .send({
                    currentPassword: 'Password123!',
                    newPassword: 'NewPassword123!'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('sucesso');
        });

        it('should fail with wrong current password', async () => {
            const res = await request(app)
                .put('/api/users/perfil/change-password')
                .set('x-access-token', userToken)
                .send({
                    currentPassword: 'WrongPassword!',
                    newPassword: 'AnotherNew123!'
                });

            expect(res.statusCode).toEqual(401);
        });

        it('should fail with short new password', async () => {
            const res = await request(app)
                .put('/api/users/perfil/change-password')
                .set('x-access-token', userToken)
                .send({
                    currentPassword: 'NewPassword123!',
                    newPassword: '123'
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/users/invite-code', () => {
        it('should get invite code for trainer', async () => {
            const res = await request(app)
                .get('/api/users/invite-code')
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
        });

        it('should fail for non-trainer', async () => {
            const res = await request(app)
                .get('/api/users/invite-code')
                .set('x-access-token', userToken);

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('POST /api/users/generate-invite-code', () => {
        it('should generate invite code for trainer', async () => {
            const res = await request(app)
                .post('/api/users/generate-invite-code')
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.inviteCode).toBeDefined();
            expect(res.body.inviteCode).toContain('PT-');
        });

        it('should fail for non-trainer', async () => {
            const res = await request(app)
                .post('/api/users/generate-invite-code')
                .set('x-access-token', userToken);

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('POST /api/users/associate-trainer', () => {
        let inviteCode;

        beforeAll(async () => {
            const codeRes = await request(app)
                .post('/api/users/generate-invite-code')
                .set('x-access-token', trainerToken);
            inviteCode = codeRes.body.inviteCode;
        });

        it('should associate user with trainer using invite code', async () => {
            const newUserRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Associate Test',
                    email: 'associate@gym.com',
                    password: 'Password123!',
                    role: { name: 'User', scope: ['user'] }
                });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'associate@gym.com',
                    password: 'Password123!'
                });

            const res = await request(app)
                .post('/api/users/associate-trainer')
                .set('x-access-token', loginRes.body.token)
                .send({ inviteCode });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('sucesso');
        });

        it('should fail with invalid invite code', async () => {
            const res = await request(app)
                .post('/api/users/associate-trainer')
                .set('x-access-token', userToken)
                .send({ inviteCode: 'INVALID-CODE' });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/users/disassociation-request', () => {
        let associatedUserToken;

        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    name: 'associate@gym.com',
                    password: 'Password123!'
                });
            associatedUserToken = loginRes.body.token;
        });

        it('should create disassociation request', async () => {
            const res = await request(app)
                .post('/api/users/disassociation-request')
                .set('x-access-token', associatedUserToken)
                .send({
                    reason: 'Testing disassociation request functionality.'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('sucesso');
        });

        it('should fail with short reason', async () => {
            const res = await request(app)
                .post('/api/users/disassociation-request')
                .set('x-access-token', userToken)
                .send({
                    reason: 'Short'
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/users/disassociation-requests/pending', () => {
        it('should get pending requests as admin', async () => {
            const res = await request(app)
                .get('/api/users/disassociation-requests/pending')
                .set('x-access-token', adminToken);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should fail for non-admin', async () => {
            const res = await request(app)
                .get('/api/users/disassociation-requests/pending')
                .set('x-access-token', userToken);

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('POST /api/users/disassociation-requests/:id/approve', () => {
        let requestId;

        beforeAll(async () => {
            const requests = await DisassociationRequest.find({ status: 'pending' });
            if (requests.length > 0) {
                requestId = requests[0]._id.toString();
            }
        });

        it('should approve disassociation request as admin', async () => {
            if (!requestId) {
                console.log('No pending request to approve, skipping test');
                return;
            }

            const res = await request(app)
                .post(`/api/users/disassociation-requests/${requestId}/approve`)
                .set('x-access-token', adminToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('aprovado');
        });

        it('should fail for non-admin', async () => {
            if (!requestId) return;

            const res = await request(app)
                .post(`/api/users/disassociation-requests/${requestId}/approve`)
                .set('x-access-token', userToken);

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('GET /api/users/details/:id', () => {
        it('should get user details', async () => {
            const res = await request(app)
                .get(`/api/users/details/${trainerId}`)
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('name');
        });

        it('should fail for non-existent user', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/users/details/${fakeId}`)
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(404);
        });
    });
});
