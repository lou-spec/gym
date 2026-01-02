const bodyParser = require("body-parser");
const express = require("express");
const Users = require("../data/users");
const cookieParser = require('cookie-parser');
const VerifyToken = require('../middleware/token');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const config = require("../config");


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER || 'lentonobrega2016@gmail.com',
    pass: process.env.EMAIL_PASS || 'ttimczqpomnivhda'
  }
});

function AuthRouter() {
  let router = express.Router();
  router.use(require('cookie-parser')());
  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));


  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
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
   *                 properties:
   *                   name:
   *                     type: string
   *                   scope:
   *                     type: array
   *                     items:
   *                       type: string
   *     responses:
   *       200:
   *         description: User created successfully
   *       400:
   *         description: Invalid input
   */
  router.route("/register").post(async function (req, res, next) {
    const body = req.body;
    let { role, name, email, password, birthDate, address, country, inviteCode } = body;

    if (!name || !email || !password) {
      return res.status(400).send({ auth: false, message: 'Nome, email e password são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({ auth: false, message: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).send({ auth: false, message: 'Password deve ter pelo menos 6 caracteres' });
    }

    const existingUser = await Users.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).send({ auth: false, message: 'Este email já está registado' });
    }

    const existingName = await Users.findUserByName(name);
    if (existingName) {
      return res.status(400).send({ auth: false, message: 'Este nome já está em uso' });
    }

    if (!role) {
      role = { name: 'User', scope: ['user'] };
    }

    let trainerId = null;
    if (inviteCode) {
      const User = require('../data/users/users');
      const trainer = await User.findOne({ inviteCode: inviteCode });
      if (!trainer) {
        return res.status(400).send({ auth: false, message: 'Código de convite inválido' });
      }
      trainerId = trainer._id;
    }

    const userData = {
      name,
      email,
      password,
      birthDate: birthDate || null,
      address,
      country,
      role,
      trainer: trainerId,
      createdBy: trainerId
    };

    Users.create(userData)
      .then((result) => {
        res.status(200).send({ auth: true, message: 'Conta criada com sucesso!' });
      })
      .catch((err) => {
        console.error('Register error:', err);
        res.status(500).send({ auth: false, message: 'Erro ao criar conta' });
      });
  });

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login 
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Username or Email
   *               password:
   *                 type: string
   *               rememberMe:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Login failed
   */
  router.route("/login").post(function (req, res, next) {
    let body = req.body;
    let rememberMe = body.rememberMe;

    return Users.findUser(body)
      .then((user) => {
        return Users.createToken(user);
      })
      .then((response) => {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          path: '/',
        };

        if (rememberMe) {
          cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
        }

        res.cookie("token", response.token, cookieOptions);
        res.status(200);
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(401);
        res.send({ auth: false, message: typeof err === 'string' ? err : "Login failed" });
      });
  });

  /**
   * @swagger
   * /auth/login-qr:
   *   post:
   *     summary: Login via QR Code
   *     description: Authenticates a user using their user ID from a QR code scan. Returns a JWT token in a cookie.
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 description: The MongoDB ObjectId of the user
   *                 example: "694deefea683fab73553f57d"
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 auth:
   *                   type: boolean
   *                   example: true
   *                 token:
   *                   type: string
   *                   description: JWT token
   *       400:
   *         description: User ID is required
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 auth:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "ID do utilizador é obrigatório"
   *       401:
   *         description: User not found or login failed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 auth:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Utilizador não encontrado"
   */
  router.route("/login-qr").post(async function (req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).send({ auth: false, message: 'ID do utilizador é obrigatório' });
      }

      const user = await Users.findUserById(userId);

      if (!user) {
        return res.status(401).send({ auth: false, message: 'Utilizador não encontrado' });
      }

      const response = Users.createToken(user);

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
      };

      res.cookie("token", response.token, cookieOptions);
      res.status(200).send(response);
    } catch (err) {
      console.error('QR Login error:', err);
      if (err === 'User not found' || err.message === 'User not found') {
        res.status(401).send({ auth: false, message: 'Utilizador não encontrado' });
      } else {
        res.status(401).send({ auth: false, message: 'Login QR falhou' });
      }
    }
  });

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Request password reset email
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Email sent
   *       404:
   *         description: Email not found
   */
  router.route("/forgot-password").post(async function (req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ auth: false, message: 'Email é obrigatório' });
    }

    try {
      const user = await Users.findUserByEmail(email);
      if (!user) {
        return res.status(404).send({ auth: false, message: 'Email não encontrado' });
      }


      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpiry = Date.now() + 3600000; 


      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpiry = resetTokenExpiry;
      await user.save();


      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'lentonobrega2016@gmail.com',

        to: email,
        subject: 'Recuperação de Password - Gym',
        html: `
        <h2>Recuperação de Password</h2>
        <p>Recebeste este email porque pediste para recuperar a tua password.</p>
        <p>Clica no link abaixo para redefinir a tua password:</p>
        <a href="${resetUrl}" style="background-color: #0d0c22; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Redefinir Password
        </a>
        <p>Se não pediste isto, ignora este email.</p>
        <p><strong>Nota:</strong> Este link expira em 1 hora.</p>
      `
      };

      await transporter.sendMail(mailOptions);


      res.status(200).send({
        auth: true,
        message: 'Email de recuperação enviado com sucesso! Verifica a tua caixa de correio.'
      });

    } catch (err) {
      console.error(err);
      res.status(500).send({
        auth: false,
        message: 'Erro ao enviar email de recuperação'
      });
    }
  });

  /**
   * @swagger
   * /auth/reset-password/{token}:
   *   post:
   *     summary: Reset password
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password reset successful
   *       400:
   *         description: Invalid token or passwords do not match
   */
  router.route("/reset-password/:token").post(async function (req, res) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      if (!password || !confirmPassword || password !== confirmPassword) {
        return res.status(400)
          .send({ auth: false, message: "Passwords não coincidem ou inválidas" });
      }

      const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const user = await Users.findUserByResetToken(resetTokenHash);

      if (!user || user.resetPasswordExpiry < Date.now()) {
        return res.status(400)
          .send({ auth: false, message: "Token inválido ou expirado" });
      }


      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return res.status(400).send({ auth: false, message: "A nova password deve ser diferente da atual." });
      }


      const hashedPassword = await bcrypt.hash(password, config.saltRounds);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();

      return res.status(200)
        .send({ auth: true, message: "Password redefinida com sucesso!" });
    } catch (err) {
      console.error(err);
      return res.status(500)
        .send({ auth: false, message: "Erro ao redefinir password" });
    }
  });

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Logout successful
   */
  router.route("/logout").post(function (req, res, next) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };

    res.clearCookie("token", cookieOptions);
    res.status(200);
    res.send({ logout: true });
  });

  router.route("/me").get(VerifyToken, function (req, res, next) {
    try {
      res.status(202).send({ auth: true, decoded: req.roleUser });
    } catch (err) {
      res.status(500).send(err);
      next();
    }
  });

  return router;
}

module.exports = AuthRouter;