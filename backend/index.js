require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const config = require("./config");
const socketIo = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./router");
const Users = require("./data/users");

// Detect Render and use its assigned PORT. Bind to 0.0.0.0 on Render.
const isRender = "RENDER" in process.env;
const hostname = isRender ? "0.0.0.0" : "127.0.0.1";
const port = process.env.PORT || 3000;

mongoose.set("strictQuery", true);
const mongoUrl =
  process.env.MONGO_URL || process.env.MONGODB_URI || config.db;
mongoose
  .connect(mongoUrl)
  .then(async () => {
    console.log("Connection successful!");

    try {
      const UserModel = require("./data/users/users");

      const existingAdmin = await UserModel.findOne({ email: "admin@gym.com" });
      if (!existingAdmin) {
        console.log("Creating admin user (name: admin, password: admin)...");
        await Users.create({
          name: "admin",
          password: "admin",
          email: "admin@gym.com",
          address: "Gym Address",
          country: "Portugal",
          role: {
            name: "Admin",
            scope: ["admin"]
          }
        });
        console.log("Admin user created successfully!");
      } else {
        console.log("Admin user already exists, skipping creation.");
      }



      const existingTrainer = await UserModel.findOne({ email: "trainer@gym.com" });
      if (!existingTrainer) {
        console.log("Creating trainer user (name: treinador, password: treinador)...");
        await Users.create({
          name: "treinador",
          password: "treinador",
          email: "trainer@gym.com",
          address: "User Address",
          country: "Portugal",
          role: {
            name: "Trainer",
            scope: ["trainer"]
          }
        });
        console.log("Trainer user created successfully!");
      } else {
        console.log("Trainer user already exists, skipping creation.");
      }
    } catch (err) {
      console.log("User setup error:", err.message || err);
    }
  })
  .catch((err) => console.error(err));

const app = express();
// Trust Render/Vercel proxies so secure cookies work behind HTTPS
app.set('trust proxy', 1);
const server = http.Server(app);

// Allowed origins for CORS in both HTTP and Socket.IO
const customFrontendUrl = process.env.FRONTEND_URL || "";
const allowedOrigins = [
  customFrontendUrl || "https://gym-pwa-three.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});


// HTTP CORS with allowlist. Accept requests without origin (e.g., curl).
const normalizeOrigin = (origin) => (origin || "").replace(/\/$/, "");
const isAllowedOrigin = (origin) => {
  const o = normalizeOrigin(origin);
  return o && allowedOrigins.map(normalizeOrigin).includes(o);
};

// Use a delegate to avoid throwing 500 on disallowed origins
const corsOptionsDelegate = function (req, callback) {
  const originHeader = req.header('Origin');
  const allow = !originHeader || isAllowedOrigin(originHeader);
  const options = allow
    ? {
      origin: true, // reflect the request origin
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200,
    }
    : { origin: false };
  callback(null, options);
};
app.use(cors(corsOptionsDelegate));
app.options("*", cors(corsOptionsDelegate));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());


const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./server/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api', router.init(io));


io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

if (require.main === module) {
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
  });
}

module.exports = app;
