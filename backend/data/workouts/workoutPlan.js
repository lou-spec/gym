const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WorkoutPlanSchema = new Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weeklyFrequency: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7], default: 3 },
  name: { type: String },
  goal: { type: String },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }, 
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WorkoutPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const WorkoutPlan = mongoose.model('WorkoutPlan', WorkoutPlanSchema);

module.exports = WorkoutPlan;
