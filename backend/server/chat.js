const express = require('express');
const { ChatMessage } = require('../data/chat');
const validateToken = require('../middleware/token');
const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'));
    }
  }
});

function ChatAPI(io) {
  const api = express.Router();
  api.use(validateToken);

  // Enviar mensagem (suporta imagem)
  /**
   * @swagger
   * /chat/messages:
   *   post:
   *     summary: Send a chat message
   *     tags: [Chat]
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               receiverId:
   *                 type: string
   *               message:
   *                 type: string
   *               image:
   *                 type: string
   *                 format: binary
   *               isAlert:
   *                 type: boolean
   *               relatedWorkout:
   *                 type: string
   *     responses:
   *       201:
   *         description: Message sent successfully
   *       400:
   *         description: Message or image is required
   */
  api.post('/messages', upload.single('image'), async (req, res) => {
    try {
      const senderId = req.userId;
      const { receiverId, message, isAlert, relatedWorkout } = req.body;
      let imageUrl = null;

      if (req.file) {
        // Construct absolute URL or relative path handled by static middleware
        imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
      }

      if (!message && !imageUrl) {
        return res.status(400).json({ error: 'Mensagem ou imagem é obrigatória.' });
      }

      const chatMessage = new ChatMessage({
        sender: senderId,
        receiver: receiverId,
        message: message || '',
        image: imageUrl,
        isAlert: isAlert === 'true' || isAlert === true || false, // FormData converts booleans to strings
        relatedWorkout: relatedWorkout || null
      });

      await chatMessage.save();

      const populatedMessage = await ChatMessage.findById(chatMessage._id)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

      io.emit('new-message', {
        messageId: chatMessage._id,
        senderId: senderId.toString(),
        receiverId: receiverId.toString(),
        senderName: populatedMessage.sender.name,
        message: chatMessage.message,
        image: chatMessage.image,
        isAlert: chatMessage.isAlert,
        createdAt: chatMessage.createdAt
      });

      res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obter conversas entre dois usuários
  /**
   * @swagger
   * /chat/messages/{userId}:
   *   get:
   *     summary: Get conversation with a user
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of messages
   */
  api.get('/messages/:userId', async (req, res) => {
    try {
      const currentUserId = req.userId;
      const otherUserId = req.params.userId;

      const messages = await ChatMessage.find({
        $or: [
          { sender: currentUserId, receiver: otherUserId },
          { sender: otherUserId, receiver: currentUserId }
        ]
      })
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ createdAt: 1 });

      res.json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Marcar mensagens como lidas
  api.put('/messages/mark-read/:userId', async (req, res) => {
    try {
      const currentUserId = req.userId;
      const otherUserId = req.params.userId;

      await ChatMessage.updateMany(
        { sender: otherUserId, receiver: currentUserId, read: false },
        { read: true }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obter contatos (pessoas com quem tem conversas)
  api.get('/contacts', async (req, res) => {
    try {
      const userId = req.userId;

      // Buscar todas as mensagens onde o usuário participa
      const messages = await ChatMessage.find({
        $or: [{ sender: userId }, { receiver: userId }]
      })
        .populate('sender', 'name email role')
        .populate('receiver', 'name email role')
        .sort({ createdAt: -1 });

      // Extrair usuários únicos
      const contactsMap = new Map();

      messages.forEach(msg => {
        if (!msg.sender || !msg.receiver) return;

        const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
        if (!otherUser || !otherUser._id) return;

        if (!contactsMap.has(otherUser._id.toString())) {
          contactsMap.set(otherUser._id.toString(), {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            role: otherUser.role,
            lastMessage: msg.message,
            lastMessageDate: msg.createdAt,
            unreadCount: 0
          });
        }
      });

      // Contar mensagens não lidas
      for (const [contactId, contact] of contactsMap) {
        const unreadCount = await ChatMessage.countDocuments({
          sender: contactId,
          receiver: userId,
          read: false
        });
        contact.unreadCount = unreadCount;
      }

      const contacts = Array.from(contactsMap.values());

      // Se for Treinador, adicionar também todos os seus clientes, mesmo sem mensagens
      // Precisamos importar o Model de Users
      const { Users } = require('../data/users');
      // Ou usar o serviço se acessível, mas aqui estamos diretos no route handler
      // Vamos tentar importar o Model do Mongoose diretamente se possível ou usar o data layer

      try {
        const User = require('../data/users/users');

        // Obter dados do utilizador atual para saber se é Treinador ou Cliente
        const currentUser = await User.findById(userId);

        if (currentUser) {
          // Lógica para Treinador: buscar seus clientes
          if (currentUser.role.name === 'Trainer' || currentUser.role.scope.includes('trainer')) {
            console.log('Chat debug - fetching clients for trainer:', userId);
            const myClients = await User.find({ createdBy: userId });
            console.log('Chat debug - found clients:', myClients.length);

            myClients.forEach(client => {
              if (!contactsMap.has(client._id.toString())) {
                console.log('Chat debug - adding client:', client.name);
                contacts.push({
                  _id: client._id,
                  name: client.name,
                  email: client.email,
                  role: client.role,
                  lastMessage: 'Nova conversa',
                  lastMessageDate: client.createdAt,
                  unreadCount: 0
                });
              }
            });
          }
          // Lógica para Cliente: buscar seu Treinador
          else if (currentUser.createdBy) {
            console.log('Chat debug - fetching trainer for client:', userId);
            const myTrainer = await User.findById(currentUser.createdBy);

            if (myTrainer) {
              if (!contactsMap.has(myTrainer._id.toString())) {
                console.log('Chat debug - adding trainer:', myTrainer.name);
                contacts.push({
                  _id: myTrainer._id,
                  name: myTrainer.name,
                  email: myTrainer.email,
                  role: myTrainer.role,
                  lastMessage: 'Contactar Treinador',
                  lastMessageDate: null,
                  unreadCount: 0
                });
              }
            }
          }
        }

      } catch (err) {
        console.log("Erro a buscar contactos extra para chat:", err);
      }

      res.json({ contacts });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return api;
}

module.exports = ChatAPI;
