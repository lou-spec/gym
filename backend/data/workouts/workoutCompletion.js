const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WorkoutCompletionSchema = new Schema({
  workoutSession: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutSession', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, 
  completed: { type: Boolean, required: true },
  reason: { type: String }, 
  proof: { type: String }, 
  notes: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});


WorkoutCompletionSchema.index({ workoutSession: 1, client: 1, date: 1 }, { unique: true });

const WorkoutCompletion = mongoose.model('WorkoutCompletion', WorkoutCompletionSchema);

module.exports = WorkoutCompletion;
