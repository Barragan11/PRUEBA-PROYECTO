// back/server.js
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

// ===== Rutas =====
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");      // admin: ver usuarios
const statsRoutes = require("./routes/statsRoutes");    // admin: gráficas / reportes
const contactRoutes = require("./routes/contactRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");

// ===== Middlewares globales =====
app.use(cors({
  origin: [
    "https://astro-motors-uaa2025.netlify.app",
    "http://localhost:5501"
  ],
  credentials: true,
}));

app.use(express.json());

// 🔹 Servir carpeta de imágenes del back
app.use("/images", express.static(path.join(__dirname, "images")));

// ===== Rutas API =====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);

// 👇 IMPORTANTE: ruta de admin stats
app.use("/api/admin/stats", statsRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API Astro Motors funcionando 🚀" });
});

// ===== Middleware de errores =====
app.use(errorHandler);

// ===== Levantar servidor =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});

