const bodyParser = require("body-parser");
const express = require("express");

const Users = require("../data/users");
const scopes = require("../data/users/scopes");
const VerifyToken = require("../middleware/token");
const cookieParser = require("cookie-parser");
const User = require("../data/users/users");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const DisassociationRequest = require("../data/users/disassociationRequest");
const Workout = require("../data/workouts/workoutPlan");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas ficheiros de imagem são permitidos'), false);
    }
  }
});

const UsersRouter = (io) => {
  let router = express.Router();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
  router.use(cookieParser());
  router.use(VerifyToken);

  /**
   * @swagger
   * /users/all-users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: skip
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of users
   */
  router
    .route("/all-users")
    .get(function (req, res, next) {
      const pageLimit = req.query.limit ? parseInt(req.query.limit) : 5;
      const pageSkip = req.query.skip ? parseInt(req.query.skip) : 0;
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder;

      const filter = {};
      if (req.query.createdBy) filter.createdBy = req.query.createdBy;

      if (req.query['role.name']) {
        filter['role.name'] = req.query['role.name'];
      } else {
  
        filter['role.scope'] = { $nin: ['admin'] };
        filter['email'] = { $ne: 'admin@gym.com' }; 
      }

      req.pagination = {
        limit: pageLimit,
        skip: pageSkip,
        sort: sortBy,
        order: sortOrder,
        filter: filter
      };

      Users.findAll(req.pagination)
        .then((result) => {
          const response = {
            auth: true,
            users: result.data,
            pagination: {
              current: Math.floor(pageSkip / pageLimit) + 1,
              pageSize: pageLimit,
              total: result.pagination.total,
              hasMore: result.pagination.hasMore
            },
          };
          res.json(response);
          next();
        })
        .catch((err) => {
          console.log(err.message);
          next();
        });
    })

  /**
   * @swagger
   * /users/create-user:
   *   post:
   *     summary: Create a new user (Trainer/Admin only)
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: object
   *     responses:
   *       200:
   *         description: User created successfully
   *       409:
   *         description: Email already registered
   */
  router
    .route("/create-user")
    .post(Users.autorize([scopes.Trainer]), async function (req, res, next) {
      try {
        console.log("Create user");
        let body = req.body;
        let { role } = body;

        console.log(role);

       
        if (!role || !role.scope) {
          return res.status(400).send({ error: "Missing 'role' or 'role.scope' in request body" });
        }

      
        body.createdBy = req.userId;

       
        const creator = await User.findById(req.userId);
        if (creator && (creator.role.name === 'Personal Trainer' || creator.role.name === 'Trainer')) {
          body.trainer = req.userId;
        }

   
        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
          return res.status(409).send({ error: "Este email já está registado." });
        }

        const user = await Users.create(body);

        io.sockets.emit('admin_notifications', {
          message: 'add new user',
          key: 'User'
        });
        console.log("Created!");
        res.status(200).send(user);
        next();

      } catch (err) {
        console.error('Create user error:', err);
        res.status(500).send({ error: err.message || "Erro ao criar utilizador" });
      }
    });

  router
    .route("/perfil")
    .get(
      Users.autorize([scopes.NonMember, scopes.Member, scopes.User, scopes.Trainer, scopes.Admin]),
      function (req, res, next) {
        console.log("get the perfil of user");
        let userId = req.userId;
        Users.findUserById(userId)
          .then((user) => {
            res.status(200).send({ user: user });
            next();
          })
          .catch((err) => {
            console.log('Perfil', err);
            res.status(500);
            next();
          });
      });

  router
    .route("/perfil")
    .put(
      Users.autorize([scopes.NonMember, scopes.Member, scopes.User, scopes.Trainer, scopes.Admin]),
      async function (req, res, next) {
        console.log("update own perfil");
        let userId = req.userId;
        let body = req.body || {};
        let password = body.password;

        delete body.password;

        if (!password) {
          return res.status(400).send({ error: 'Palavra-passe é obrigatória para confirmar alterações' });
        }

        try {
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).send({ error: 'Utilizador não encontrado' });
          }

          const bcrypt = require('bcryptjs');
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res.status(401).send({ error: 'Palavra-passe incorreta' });
          }

          const updatedUser = await Users.update(userId, body);
          res.status(200).send({ user: updatedUser });
        } catch (err) {
          console.log('Perfil update error', err);
          res.status(500).send({ error: err.toString() });
        }
      }
    );

  router
    .route("/:userId")
    .put(Users.autorize([scopes.Admin]), async function (req, res, next) {
      console.log("update a member by id");
      try {
        let userId = req.params.userId;
        let body = req.body;

        if (body.password) {
          delete body.password;
          console.log('Password update blocked - use password reset endpoint instead');
        }

   
        if (body.role && (body.role.name === 'Trainer' || body.role.name === 'Personal Trainer')) {
          const userToCheck = await User.findById(userId);
          if (userToCheck) {
   
            if (userToCheck.trainer) {
              return res.status(400).send({ error: 'Não é possível promover: O utilizador tem um Personal Trainer associado.' });
            }
        
            if (userToCheck.createdBy) {
              const creator = await User.findById(userToCheck.createdBy);
              if (creator && (creator.role.name === 'Personal Trainer' || creator.role.name === 'Trainer')) {
                return res.status(400).send({ error: 'Não é possível promover: O utilizador está associado ao PT que o criou.' });
              }
            }
          }
        }

        const updatedUser = await Users.update(userId, body);

     
        io.sockets.emit('admin_notifications', {
          message: 'update user',
          key: 'User',
          user: updatedUser
        });

        res.status(200).send(updatedUser);
        next();
      } catch (err) {
        console.log('Update error', err);
        res.status(500).send({ error: err.toString() });
      }
    })
    .delete(Users.autorize([scopes.Admin]), function (req, res, next) {
      console.log("delete user by id");
      let userId = req.params.userId;

      Users.remove(userId)
        .then(() => {
          io.sockets.emit('admin_notifications', {
            message: 'user removed',
            key: 'User'
          });
          res.status(200).send({ message: "User deleted successfully" });
          next();
        })
        .catch((err) => {
          console.log('Delete error:', err);
          res.status(500).send({ error: err.toString() });
        });
    });


  router
    .route("/perfil/upload-photo")
    .post(
      Users.autorize([scopes.NonMember, scopes.Member, scopes.User, scopes.Trainer]),
      upload.single('profileImage'),
      async function (req, res, next) {
        try {
          if (!req.file) {
            return res.status(400).send({ error: 'Nenhum ficheiro enviado' });
          }

          const userId = req.userId;
          const user = await Users.findUserById(userId);

          if (user.profileImage) {
            const publicId = user.profileImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`user_profiles/${publicId}`);
          }

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'user_profiles',
              transformation: [
                { width: 300, height: 300, crop: 'fill', gravity: 'face' },
                { quality: 'auto' }
              ]
            },
            async (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).send({ error: 'Erro ao fazer upload da imagem' });
              }

              try {
                const updatedUser = await Users.update(userId, { profileImage: result.secure_url });
                res.status(200).send({ user: updatedUser, imageUrl: result.secure_url });
              } catch (err) {
                console.error('Database update error:', err);
                res.status(500).send({ error: 'Erro ao atualizar perfil' });
              }
            }
          );

          uploadStream.end(req.file.buffer);
        } catch (error) {
          console.error('Upload error:', error);
          res.status(500).send({ error: error.toString() });
        }
      }
    );

  router
    .route("/perfil/delete-photo")
    .delete(
      Users.autorize([scopes.NonMember, scopes.Member, scopes.User, scopes.Trainer]),
      async function (req, res, next) {
        try {
          const userId = req.userId;
          const user = await Users.findUserById(userId);

          if (!user.profileImage) {
            return res.status(400).send({ error: 'Nenhuma foto de perfil para eliminar' });
          }

          const publicId = user.profileImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`user_profiles/${publicId}`);

          const updatedUser = await Users.update(userId, { profileImage: null });
          res.status(200).send({ user: updatedUser });
        } catch (error) {
          console.error('Delete photo error:', error);
          res.status(500).send({ error: error.toString() });
        }
      }
    );

  router
    .route("/perfil/change-password")
    .put(
      Users.autorize([scopes.NonMember, scopes.Member, scopes.User, scopes.Trainer]),
      async function (req, res, next) {
        try {
          const userId = req.userId;
          const { currentPassword, newPassword } = req.body;

          if (!currentPassword || !newPassword) {
            return res.status(400).send({ error: 'Palavra-passe atual e nova são obrigatórias' });
          }

          if (newPassword.length < 6) {
            return res.status(400).send({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres' });
          }

          const user = await Users.findUserById(userId);
          const bcrypt = require('bcryptjs');
          const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

          if (!isPasswordValid) {
            return res.status(401).send({ error: 'Palavra-passe atual incorreta' });
          }

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword, salt);
          await user.save();

          res.status(200).send({ message: 'Palavra-passe alterada com sucesso' });
        } catch (error) {
          console.error('Change password error:', error);
          res.status(500).send({ error: error.toString() });
        }
      }
    );

  /**
   * @swagger
   * /users/invite-code:
   *   get:
   *     summary: Get trainer invite code
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Invite code returned successfully
   *       404:
   *         description: User not found
   */
  router.route("/invite-code").get(
    Users.autorize([scopes.Trainer]),
    async function (req, res) {
      try {
        const user = await User.findById(req.userId);
        if (!user) {
          return res.status(404).send({ error: 'Utilizador não encontrado' });
        }
        res.status(200).send({ inviteCode: user.inviteCode || null });
      } catch (error) {
        console.error('Get invite code error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/generate-invite-code:
   *   post:
   *     summary: Generate a new invite code for trainer
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Invite code generated
   */
  router.route("/generate-invite-code").post(
    Users.autorize([scopes.Trainer]),
    async function (req, res) {
      try {
        const user = await User.findById(req.userId);
        if (!user) {
          return res.status(404).send({ error: 'Utilizador não encontrado' });
        }

        const namePart = user.name.split(' ')[0].toUpperCase().substring(0, 6);
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const inviteCode = `PT-${namePart}-${randomPart}`;

        user.inviteCode = inviteCode;
        await user.save();

        res.status(200).send({ inviteCode });
      } catch (error) {
        console.error('Generate invite code error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/associate-trainer:
   *   post:
   *     summary: Associate user with a trainer using invite code
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               inviteCode:
   *                 type: string
   *     responses:
   *       200:
   *         description: Association successful
   *       400:
   *         description: Invalid code or already associated
   */
  router.route("/associate-trainer").post(
    Users.autorize([scopes.User]),
    async function (req, res) {
      try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
          return res.status(400).send({ error: 'Código de convite é obrigatório' });
        }

        const trainer = await User.findOne({ inviteCode: inviteCode });
        if (!trainer) {
          return res.status(400).send({ error: 'Código de convite inválido' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
          return res.status(404).send({ error: 'Utilizador não encontrado' });
        }

        if (user.trainer) {
          return res.status(400).send({ error: 'Já estás associado a um Personal Trainer' });
        }

        user.trainer = trainer._id;
        user.createdBy = trainer._id;
        await user.save();

        res.status(200).send({
          message: 'Associado com sucesso!',
          trainer: { name: trainer.name, email: trainer.email }
        });
      } catch (error) {
        console.error('Associate trainer error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/disassociation-request:
   *   post:
   *     summary: Request disassociation from trainer
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Request submitted
   */
  router.route("/disassociation-request").post(
    Users.autorize([scopes.User]),
    async function (req, res) {
      try {
        const { reason } = req.body;

        if (!reason || reason.trim().length < 10) {
          return res.status(400).send({ error: 'A razão deve ter pelo menos 10 caracteres' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
          return res.status(404).send({ error: 'Utilizador não encontrado' });
        }

        let trainerId = user.trainer;

   
        if (!trainerId && user.createdBy) {
          const creator = await User.findById(user.createdBy);
          if (creator && (creator.role.name === 'Personal Trainer' || creator.role.name === 'Trainer')) {
            trainerId = user.createdBy;
          }
        }

        if (!trainerId) {
          return res.status(400).send({ error: 'Não estás associado a nenhum Personal Trainer' });
        }

        const existingRequest = await DisassociationRequest.findOne({
          user: req.userId,
          status: 'pending'
        });

        if (existingRequest) {
          return res.status(400).send({ error: 'Já tens um pedido pendente' });
        }

        const request = new DisassociationRequest({
          user: req.userId,
          trainer: trainerId,
          reason: reason
        });

        await request.save();

        res.status(200).send({ message: 'Pedido enviado com sucesso. Aguarda aprovação do administrador.' });
      } catch (error) {
        console.error('Disassociation Request error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/disassociation-requests/pending:
   *   get:
   *     summary: Get all pending disassociation requests (Admin)
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: List of pending requests
   */
  router.route("/disassociation-requests/pending").get(
    Users.autorize([scopes.Admin]),
    async function (req, res) {
      try {
        const requests = await DisassociationRequest.find({ status: 'pending' })
          .populate('user', 'name email profileImage')
          .populate('trainer', 'name email');
        res.status(200).send(requests);
      } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/disassociation-requests/{id}/approve:
   *   post:
   *     summary: Approve a disassociation request
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Request approved and user disassociated
   */
  router.route("/disassociation-requests/:id/approve").post(
    Users.autorize([scopes.Admin]),
    async function (req, res) {
      try {
        const requestId = req.params.id;
        const request = await DisassociationRequest.findById(requestId);

        if (!request) {
          return res.status(404).send({ error: 'Pedido não encontrado' });
        }

        if (request.status !== 'pending') {
          return res.status(400).send({ error: 'Pedido já resolvido' });
        }

        const user = await User.findById(request.user);
        if (user) {
          user.trainer = null;
        
          if (user.createdBy && user.createdBy.toString() === request.trainer.toString()) {
            user.createdBy = null;
          }
          await user.save();
        }

       
        await Workout.deleteMany({
          client: request.user,
          personalTrainer: request.trainer
        });

        request.status = 'approved';
        request.resolvedAt = new Date();
        request.resolvedBy = req.userId;
        await request.save();

        res.status(200).send({ message: 'Pedido aprovado e utilizador desassociado' });
      } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/disassociation-requests/{id}/reject:
   *   post:
   *     summary: Reject a disassociation request
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Request rejected
   */
  router.route("/disassociation-requests/:id/reject").post(
    Users.autorize([scopes.Admin]),
    async function (req, res) {
      try {
        const requestId = req.params.id;
        const request = await DisassociationRequest.findById(requestId);

        if (!request) {
          return res.status(404).send({ error: 'Pedido não encontrado' });
        }

        if (request.status !== 'pending') {
          return res.status(400).send({ error: 'Pedido já resolvido' });
        }

        request.status = 'rejected';
        request.resolvedAt = new Date();
        request.resolvedBy = req.userId;
        await request.save();

        res.status(200).send({ message: 'Pedido rejeitado' });
      } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/disassociation-request/status:
   *   get:
   *     summary: Get status of current user's disassociation request
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Request status
   */
  router.route("/disassociation-request/status").get(
    Users.autorize([scopes.User]),
    async function (req, res) {
      try {
        const request = await DisassociationRequest.findOne({
          user: req.userId,
          status: 'pending'
        });

        res.status(200).send({
          hasPendingRequest: !!request,
          request: request
        });
      } catch (error) {
        console.error('Check request status error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  /**
   * @swagger
   * /users/details/{id}:
   *   get:
   *     summary: Get user public details (for trainer info etc)
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User details
   */
  router.route("/details/:id").get(
    Users.autorize([scopes.User, scopes.Trainer, scopes.Admin]),
    async function (req, res) {
      try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('name email role message profileImage');

        if (!user) {
          return res.status(404).send({ error: 'Utilizador não encontrado' });
        }

        res.status(200).send(user);
      } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).send({ error: error.toString() });
      }
    }
  );

  return router;
};

module.exports = UsersRouter;
