const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para mensagens de chat entre trainer e cliente
const ChatMessageSchema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: false }, // Opcional se houver imagem
  image: { type: String, required: false }, // URL da imagem
  read: { type: Boolean, default: false },
  isAlert: { type: Boolean, default: false }, // para alertas de treinos faltosos
  relatedWorkout: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutCompletion' }, // referência ao treino que falhou
  createdAt: { type: Date, default: Date.now }
});

// Índice para queries eficientes
ChatMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage;
