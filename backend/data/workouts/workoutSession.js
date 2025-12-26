const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WorkoutSessionSchema = new Schema({
  workoutPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    img: { type: String },
    instructions: { type: String },
    videoLink: { type: String },
    order: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});



WorkoutSessionSchema.pre('save', function (next) {
  if (this.exercises.length > 10) {
    return next(new Error('Máximo de 10 exercícios por sessão'));
  }

  if (this.exercises.length > 1) {
    const times = this.exercises.map(ex => {
      const timeStr = ex.time || this.startTime;
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + (m || 0);
    }).filter(t => t > 0);

    if (times.length > 1) {
      const min = Math.min(...times);
      const max = Math.max(...times);
      const diff = max - min;

      if (diff >= 300) {
        return next(new Error('Sessão excede janela de 5 horas'));
      }
    }
  }

  this.updatedAt = Date.now();
  next();
});

const WorkoutSession = mongoose.model('WorkoutSession', WorkoutSessionSchema);

module.exports = WorkoutSession;
