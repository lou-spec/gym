const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatMessageSchema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: false }, 
  image: { type: String, required: false }, 
  read: { type: Boolean, default: false },
  isAlert: { type: Boolean, default: false }, 
  relatedWorkout: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutCompletion' }, 
  createdAt: { type: Date, default: Date.now }
});


ChatMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage;
