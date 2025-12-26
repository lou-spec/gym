const express = require('express');
const { WorkoutPlan, WorkoutSession, WorkoutCompletion } = require('../data/workouts');
const validateToken = require('../middleware/token');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
});

function WorkoutsAPI(io) {
  const api = express.Router();
  api.use(validateToken);

  // ===== WORKOUT PLANS =====

  // Criar plano de treino para um cliente
  /**
   * @swagger
   * /workouts/plans:
   *   post:
   *     summary: Create a workout plan
   *     tags: [Workouts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               clientId:
   *                 type: string
   *               name:
   *                 type: string
   *               weeklyFrequency:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Plan created
   */
  api.post('/plans', async (req, res) => {
    try {
      const trainerId = req.userId;
      const { clientId, weeklyFrequency, startDate, endDate, name, goal } = req.body;

      const plan = new WorkoutPlan({
        trainer: trainerId,
        client: clientId,
        weeklyFrequency: weeklyFrequency || 3,
        name: name,
        goal: goal,
        startDate: startDate || Date.now(),
        endDate: endDate
      });

      await plan.save();
      res.status(201).json({ success: true, plan });
    } catch (error) {
      console.error('Error creating workout plan:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Listar planos de treino do trainer
  /**
   * @swagger
   * /workouts/plans/trainer:
   *   get:
   *     summary: Get trainer's plans
   *     tags: [Workouts]
   *     responses:
   *       200:
   *         description: List of plans
   */
  api.get('/plans/trainer', async (req, res) => {
    try {
      const trainerId = req.userId;
      const plans = await WorkoutPlan.find({ trainer: trainerId, active: true })
        .populate('client', 'name email')
        .sort({ createdAt: -1 });

      res.json({ plans });
    } catch (error) {
      console.error('Error fetching trainer plans:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obter plano de treino do cliente (quem chama é o cliente)
  /**
   * @swagger
   * /workouts/plans/my-plan:
   *   get:
   *     summary: Get client's current plan
   *     tags: [Workouts]
   *     responses:
   *       200:
   *         description: Current plan and sessions
   */
  api.get('/plans/my-plan', async (req, res) => {
    try {
      const clientId = req.userId;
      const plan = await WorkoutPlan.findOne({ client: clientId, active: true })
        .populate('trainer', 'name email profileImage');

      if (!plan) {
        return res.json({ plan: null });
      }

      // Buscar todas as sessões deste plano
      const sessions = await WorkoutSession.find({ workoutPlan: plan._id });

      res.json({ plan, sessions });
    } catch (error) {
      console.error('Error fetching client plan:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Atualizar plano de treino (Genérico)
  /**
   * @swagger
   * /workouts/plans/{planId}:
   *   put:
   *     summary: Update a workout plan
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               goal:
   *                 type: string
   *               active:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Plan updated
   */
  api.put('/plans/:planId', async (req, res) => {
    try {
      const { name, goal, active, weeklyFrequency, notes } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (goal !== undefined) updateData.goal = goal;
      if (active !== undefined) updateData.active = active;
      if (weeklyFrequency !== undefined) updateData.weeklyFrequency = weeklyFrequency;
      if (notes !== undefined) updateData.notes = notes;

      const plan = await WorkoutPlan.findByIdAndUpdate(
        req.params.planId,
        updateData,
        { new: true }
      );

      if (!plan) return res.status(404).json({ error: 'Plan not found' });

      res.json({ success: true, plan });
    } catch (error) {
      console.error('Error updating plan:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Ativar/Finalizar plano de treino (disponibilizar ao cliente)
  /**
   * @swagger
   * /workouts/plans/{planId}/activate:
   *   put:
   *     summary: Activate a workout plan
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Plan activated
   */
  api.put('/plans/:planId/activate', async (req, res) => {
    try {
      const plan = await WorkoutPlan.findByIdAndUpdate(
        req.params.planId,
        { active: true },
        { new: true }
      ).populate('client', 'name email').populate('trainer', 'name profileImage');

      const sessions = await WorkoutSession.find({ workoutPlan: plan._id });

      io.sockets.emit('workout_plan_updated', {
        clientId: plan.client._id.toString(),
        plan,
        sessions
      });

      res.json({ success: true, plan });
    } catch (error) {
      console.error('Error activating plan:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Desativar plano de treino
  /**
   * @swagger
   * /workouts/plans/{planId}/deactivate:
   *   put:
   *     summary: Deactivate a workout plan
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Plan deactivated
   */
  api.put('/plans/:planId/deactivate', async (req, res) => {
    try {
      const plan = await WorkoutPlan.findByIdAndUpdate(
        req.params.planId,
        { active: false },
        { new: true }
      );
      res.json({ success: true, plan });
    } catch (error) {
      console.error('Error deactivating plan:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obter histórico de planos de um cliente
  /**
   * @swagger
   * /workouts/plans/history/{clientId}:
   *   get:
   *     summary: Get workout plan history for a client
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: clientId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of past plans
   */
  api.get('/plans/history/:clientId', async (req, res) => {
    try {
      const { clientId } = req.params;
      const plans = await WorkoutPlan.find({
        client: clientId,
        active: false // Apenas planos inativos/passados
      })
        .sort({ createdAt: -1 }); // Mais recentes primeiro

      res.json({ plans });
    } catch (error) {
      console.error('Error fetching plan history:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Apagar plano de treino permanentemente
  /**
   * @swagger
   * /workouts/plans/{planId}:
   *   delete:
   *     summary: Delete a workout plan
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Plan deleted
   */
  api.delete('/plans/:planId', async (req, res) => {
    try {
      const { planId } = req.params;

      // 1. Apagar sessÃµes associadas
      await WorkoutSession.deleteMany({ workoutPlan: planId });

      // 2. Apagar o plano
      const plan = await WorkoutPlan.findByIdAndDelete(planId);

      if (!plan) return res.status(404).json({ error: 'Plane not found' });

      res.json({ success: true, message: 'Plano e sessões apagados.' });
    } catch (error) {
      console.error('Error deleting plan:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===== WORKOUT SESSIONS =====

  // Criar ou atualizar sessão de treino
  /**
   * @swagger
   * /workouts/sessions:
   *   post:
   *     summary: Create or update a workout session
   *     tags: [Workouts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               workoutPlanId:
   *                 type: string
   *               dayOfWeek:
   *                 type: integer
   *               exercises:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       201:
   *         description: Session saved
   */
  api.post('/sessions', async (req, res) => {
    try {
      const { workoutPlanId, dayOfWeek, startTime, endTime, exercises } = req.body;

      // Validar exercícios (máximo 10)
      if (exercises && exercises.length > 10) {
        return res.status(400).json({ error: 'Máximo de 10 exercícios por sessão' });
      }

      // Verificar se já existe sessão para este dia
      let session = await WorkoutSession.findOne({
        workoutPlan: workoutPlanId,
        dayOfWeek
      });

      if (session) {
        // Atualizar
        session.startTime = startTime;
        session.endTime = endTime;
        session.exercises = exercises;
        session.updatedAt = Date.now();
        await session.save();
      } else {
        // Criar nova
        session = new WorkoutSession({
          workoutPlan: workoutPlanId,
          dayOfWeek,
          startTime,
          endTime,
          exercises
        });
        await session.save();
      }

      res.status(201).json({ success: true, session });
    } catch (error) {
      console.error('Error saving workout session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Listar sessões de um plano
  /**
   * @swagger
   * /workouts/sessions/{planId}:
   *   get:
   *     summary: Get sessions for a plan
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of sessions
   */
  api.get('/sessions/:planId', async (req, res) => {
    try {
      const sessions = await WorkoutSession.find({ workoutPlan: req.params.planId })
        .sort({ dayOfWeek: 1 });
      res.json({ sessions });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Deletar sessão
  /**
   * @swagger
   * /workouts/sessions/{sessionId}:
   *   delete:
   *     summary: Delete a workout session
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Session deleted
   */
  api.delete('/sessions/:sessionId', async (req, res) => {
    try {
      await WorkoutSession.findByIdAndDelete(req.params.sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===== WORKOUT COMPLETIONS =====

  // Registrar cumprimento de treino
  /**
   * @swagger
   * /workouts/completions:
   *   post:
   *     summary: Register workout completion
   *     tags: [Workouts]
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               workoutSessionId:
   *                 type: string
   *               completed:
   *                 type: boolean
   *               proofImage:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Completion registered
   */
  api.post('/completions', upload.single('proofImage'), async (req, res) => {
    try {
      const Users = require('../data/users/users');
      const clientId = req.userId;
      const { workoutSessionId, date, reason, notes } = req.body;
      // Handle boolean conversion from FormData (multipart sends strings)
      const completed = req.body.completed === 'true' || req.body.completed === true;
      let proofUrl = req.body.proof || '';

      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'workout_proofs',
              resource_type: 'image',
              transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        proofUrl = uploadResult.secure_url;
      }

      let completion = await WorkoutCompletion.findOne({
        workoutSession: workoutSessionId,
        client: clientId,
        date: new Date(date)
      });

      if (completion) {
        completion.completed = completed;
        completion.reason = reason;
        completion.proof = proofUrl;
        completion.notes = notes;
        await completion.save();
      } else {
        completion = new WorkoutCompletion({
          workoutSession: workoutSessionId,
          client: clientId,
          date: new Date(date),
          completed,
          reason,
          proof: proofUrl,
          notes
        });
        await completion.save();
      }

      // Se o treino não foi completado, enviar notificação ao trainer
      if (!completed) {
        console.log('Workout missed. Fetching session details for notification...');
        const session = await WorkoutSession.findById(workoutSessionId).populate('workoutPlan');
        if (session && session.workoutPlan) {
          const trainerId = session.workoutPlan.trainer;
          const client = await Users.findById(clientId);

          console.log(`Emitting workout-missed to trainer: ${trainerId}`);

          // Emitir socket event
          io.emit('workout-missed', {
            trainerId: trainerId.toString(),
            clientId: clientId.toString(),
            clientName: client ? client.name : 'Unknown',
            date: date,
            reason: reason,
            sessionId: workoutSessionId
          });
        } else {
          console.log('Session or Plan not found for notification');
        }
      }

      res.status(201).json({ success: true, completion });
    } catch (error) {
      console.error('Error saving completion:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obter completions de um cliente
  /**
   * @swagger
   * /workouts/completions/client/{clientId}:
   *   get:
   *     summary: Get completions for a client (filtered by date)
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: clientId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: List of completions
   */
  api.get('/completions/client/:clientId', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let query = { client: req.params.clientId };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const completions = await WorkoutCompletion.find(query)
        .populate('workoutSession')
        .sort({ date: -1 });

      res.json({ completions });
    } catch (error) {
      console.error('Error fetching completions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Estatísticas de treinos completados (para dashboard)
  /**
   * @swagger
   * /workouts/stats/client/{clientId}:
   *   get:
   *     summary: Get client workout stats
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: clientId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [week, month]
   *     responses:
   *       200:
   *         description: Stats data
   */
  api.get('/stats/client/:clientId', async (req, res) => {
    try {
      const { period } = req.query; // 'week' ou 'month'
      const clientId = req.params.clientId;

      const now = new Date();
      let startDate;

      if (period === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const completions = await WorkoutCompletion.find({
        client: clientId,
        date: { $gte: startDate }
      });

      const total = completions.length;
      const completed = completions.filter(c => c.completed).length;
      const missed = completions.filter(c => !c.completed).length;

      // Agrupar por semana
      const byWeek = {};
      completions.forEach(c => {
        const week = getWeekNumber(c.date);
        if (!byWeek[week]) byWeek[week] = { completed: 0, total: 0 };
        byWeek[week].total++;
        if (c.completed) byWeek[week].completed++;
      });

      res.json({
        total,
        completed,
        missed,
        completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0,
        byWeek
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /workouts/absences/{clientId}:
   *   get:
   *     summary: Get absences/missed workouts for a client
   *     tags: [Workouts]
   *     parameters:
   *       - in: path
   *         name: clientId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of absences
   */
  api.get('/absences/:clientId', async (req, res) => {
    try {
      const absences = await WorkoutCompletion.find({
        client: req.params.clientId,
        completed: false
      })
        .populate('workoutSession')
        .sort({ date: -1 });

      res.json({ absences });
    } catch (error) {
      console.error('Error fetching absences:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return api;
}

// Helper para obter número da semana
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

module.exports = WorkoutsAPI;
