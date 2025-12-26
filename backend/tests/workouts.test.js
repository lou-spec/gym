const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../data/users/users');
const { WorkoutPlan, WorkoutSession } = require('../data/workouts');

jest.setTimeout(30000);

describe('Workouts Tests - Complete Coverage', () => {
    let trainerToken;
    let userToken;
    let trainerId;
    let userId;
    let planId;
    let sessionId;

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
                name: 'Workout Trainer',
                email: 'wtrainer@gym.com',
                password: 'Password123!',
                role: { name: 'Trainer', scope: ['trainer'] }
            });

        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Workout User',
                email: 'wuser@gym.com',
                password: 'Password123!',
                role: { name: 'User', scope: ['user'] }
            });

        const trainerLogin = await request(app)
            .post('/api/auth/login')
            .send({ name: 'wtrainer@gym.com', password: 'Password123!' });
        trainerToken = trainerLogin.body.token;

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ name: 'wuser@gym.com', password: 'Password123!' });
        userToken = userLogin.body.token;

        const trainer = await User.findOne({ email: 'wtrainer@gym.com' });
        const user = await User.findOne({ email: 'wuser@gym.com' });

        trainerId = trainer._id.toString();
        userId = user._id.toString();
    });

    afterAll(async () => {
        if (process.env.NODE_ENV === 'test') {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    });

    describe('POST /api/workouts/plans', () => {
        it('should create a workout plan as trainer', async () => {
            const res = await request(app)
                .post('/api/workouts/plans')
                .set('x-access-token', trainerToken)
                .send({
                    clientId: userId,
                    name: 'Strength Training',
                    goal: 'Build muscle',
                    weeklyFrequency: 3
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.plan).toHaveProperty('name', 'Strength Training');
            planId = res.body.plan._id;
        });

        it('should fail creating plan without token', async () => {
            const res = await request(app)
                .post('/api/workouts/plans')
                .send({
                    clientId: userId,
                    name: 'Test Plan',
                    weeklyFrequency: 2
                });

            expect(res.statusCode).not.toEqual(201);
        });
    });

    describe('GET /api/workouts/plans/my-plan', () => {
        it('should get client workout plan', async () => {
            const res = await request(app)
                .get('/api/workouts/plans/my-plan')
                .set('x-access-token', userToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('plan');
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/workouts/plans/my-plan');

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('GET /api/workouts/plans/trainer', () => {
        it('should get trainer plans', async () => {
            const res = await request(app)
                .get('/api/workouts/plans/trainer')
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('plans');
            expect(Array.isArray(res.body.plans)).toBe(true);
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/workouts/plans/trainer');

            expect(res.statusCode).not.toEqual(200);
        });
    });

    describe('PUT /api/workouts/plans/:planId', () => {
        it('should update workout plan', async () => {
            const res = await request(app)
                .put(`/api/workouts/plans/${planId}`)
                .set('x-access-token', trainerToken)
                .send({
                    name: 'Advanced Strength',
                    goal: 'Increase power'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.plan.name).toEqual('Advanced Strength');
        });

        it('should return 404 for non-existent plan', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/workouts/plans/${fakeId}`)
                .set('x-access-token', trainerToken)
                .send({ name: 'Test' });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/workouts/plans/:planId/activate', () => {
        it('should activate workout plan', async () => {
            const res = await request(app)
                .put(`/api/workouts/plans/${planId}/activate`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.plan.active).toBe(true);
        });
    });

    describe('PUT /api/workouts/plans/:planId/deactivate', () => {
        it('should deactivate workout plan', async () => {
            const res = await request(app)
                .put(`/api/workouts/plans/${planId}/deactivate`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.plan.active).toBe(false);
        });
    });

    describe('POST /api/workouts/sessions', () => {
        it('should create workout session', async () => {
            const res = await request(app)
                .post('/api/workouts/sessions')
                .set('x-access-token', trainerToken)
                .send({
                    workoutPlanId: planId,
                    dayOfWeek: 'Monday',
                    startTime: '09:00',
                    endTime: '10:00',
                    exercises: [
                        { name: 'Bench Press', sets: 3, reps: '10', order: 1 },
                        { name: 'Squats', sets: 4, reps: '8', order: 2 }
                    ]
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.session).toHaveProperty('dayOfWeek', 'Monday');
            sessionId = res.body.session._id;
        });

        it('should fail with more than 10 exercises', async () => {
            const exercises = Array(11).fill(null).map((_, i) => ({ name: 'Exercise', sets: 3, reps: '10', order: i + 1 }));
            const res = await request(app)
                .post('/api/workouts/sessions')
                .set('x-access-token', trainerToken)
                .send({
                    workoutPlanId: planId,
                    dayOfWeek: 'Tuesday',
                    startTime: '10:00',
                    endTime: '11:00',
                    exercises
                });

            expect(res.statusCode).toEqual(400);
        });

        it('should update existing session for same day', async () => {
            const res = await request(app)
                .post('/api/workouts/sessions')
                .set('x-access-token', trainerToken)
                .send({
                    workoutPlanId: planId,
                    dayOfWeek: 'Monday',
                    startTime: '09:00',
                    endTime: '10:00',
                    exercises: [{ name: 'Deadlift', sets: 5, reps: '5', order: 1 }]
                });

            expect(res.statusCode).toEqual(201);
        });
    });

    describe('GET /api/workouts/sessions/:planId', () => {
        it('should get workout sessions for plan', async () => {
            const res = await request(app)
                .get(`/api/workouts/sessions/${planId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('sessions');
            expect(Array.isArray(res.body.sessions)).toBe(true);
        });
    });

    describe('POST /api/workouts/completions', () => {
        it('should register workout completion', async () => {
            const res = await request(app)
                .post('/api/workouts/completions')
                .set('x-access-token', userToken)
                .send({
                    workoutSessionId: sessionId,
                    date: new Date().toISOString(),
                    completed: true,
                    notes: 'Great workout!'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.completion.completed).toBe(true);
        });

        it('should register missed workout', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const res = await request(app)
                .post('/api/workouts/completions')
                .set('x-access-token', userToken)
                .send({
                    workoutSessionId: sessionId,
                    date: tomorrow.toISOString(),
                    completed: false,
                    reason: 'Feeling sick'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.completion.completed).toBe(false);
        });

        it('should update existing completion', async () => {
            const res = await request(app)
                .post('/api/workouts/completions')
                .set('x-access-token', userToken)
                .send({
                    workoutSessionId: sessionId,
                    date: new Date().toISOString(),
                    completed: true,
                    notes: 'Updated notes'
                });

            expect(res.statusCode).toEqual(201);
        });
    });

    describe('GET /api/workouts/completions/client/:clientId', () => {
        it('should get client completions', async () => {
            const res = await request(app)
                .get(`/api/workouts/completions/client/${userId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('completions');
            expect(Array.isArray(res.body.completions)).toBe(true);
        });

        it('should support date filtering', async () => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            const res = await request(app)
                .get(`/api/workouts/completions/client/${userId}?startDate=${startDate.toISOString()}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
        });
    });

    describe('GET /api/workouts/stats/client/:clientId', () => {
        it('should get weekly stats', async () => {
            const res = await request(app)
                .get(`/api/workouts/stats/client/${userId}?period=week`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('completed');
            expect(res.body).toHaveProperty('missed');
        });

        it('should get monthly stats', async () => {
            const res = await request(app)
                .get(`/api/workouts/stats/client/${userId}?period=month`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('completionRate');
        });
    });

    describe('GET /api/workouts/absences/:clientId', () => {
        it('should get client absences', async () => {
            const res = await request(app)
                .get(`/api/workouts/absences/${userId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('absences');
            expect(Array.isArray(res.body.absences)).toBe(true);
        });
    });

    describe('DELETE /api/workouts/sessions/:sessionId', () => {
        it('should delete workout session', async () => {
            const res = await request(app)
                .delete(`/api/workouts/sessions/${sessionId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
        });
    });

    describe('DELETE /api/workouts/plans/:planId', () => {
        it('should delete workout plan', async () => {
            const res = await request(app)
                .delete(`/api/workouts/plans/${planId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 404 for non-existent plan', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/workouts/plans/${fakeId}`)
                .set('x-access-token', trainerToken);

            expect(res.statusCode).toEqual(404);
        });
    });
});
