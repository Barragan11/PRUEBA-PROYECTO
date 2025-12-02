require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

// ==== Crear app ANTES de usar app.use ====
const app = express();

// ==== CORS ====
app.use(cors({
  origin: [
    "https://astro-motors-uaa2025.netlify.app",
    "http://localhost:5501",
  ],
  credentials: true,
}));

app.use(express.json());

// ==== RUTAS ====
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const statsRoutes = require("./routes/statsRoutes");
const contactRoutes = require("./routes/contactRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");

// ==== SERVIR IMÁGENES ====
app.use("/images", express.static(path.join(__dirname, "images")));

// ==== ENDPOINTS ====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/stats", statsRoutes);

// ==== RUTA DE PRUEBA ====
app.get("/", (req, res) => {
  res.json({ message: "API Astro Motors funcionando 🚀" });
});

// ==== MANEJO DE ERRORES ====
app.use(errorHandler);

// ==== INICIAR SERVIDOR ====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

