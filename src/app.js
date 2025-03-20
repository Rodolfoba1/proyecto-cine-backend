const express = require("express");
const authRoutes = require("./routes/authRoutes");
const verificarToken = require("./middlewares/authMiddleware");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/usuarios", authRoutes);

module.exports = app;
