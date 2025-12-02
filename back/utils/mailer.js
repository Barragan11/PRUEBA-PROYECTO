// back/utils/mailer.js
require("dotenv").config();
const { generateOrderPdfBuffer } = require("./pdfReceipt");
const path = require("path");
const fs = require("fs");

// ========================================================
// 🔥 BREVO API CONFIG (sin nodemailer, sin SMTP)
// ========================================================
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

async function brevoSend({ to, subject, html, attachments = [] }) {
  const payload = {
    sender: {
      name: "Astro Motors",
      email: process.env.SMTP_USER,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  // soporta adjuntos PDF o imágenes
  if (attachments.length > 0) {
    payload.attachment = attachments.map((file) => ({
      name: file.filename,
      content: file.content.toString("base64"),
    }));
  }

  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Brevo API error:", err);
    throw new Error("Brevo API Error");
  }

  console.log("📨 Correo Brevo enviado correctamente");
}

// ========================================================
// 1. ENVÍO DE ORDEN CON PDF
// ========================================================
async function sendOrderEmail({ to, nombre, order, totals, items }) {
  const pdfBuffer = await generateOrderPdfBuffer({
    order,
    items,
    totals,
    customerName: nombre,
  });

  const html = `
    <h2>Gracias por tu compra, ${nombre}</h2>
    <p>Adjuntamos tu nota de compra #${order.id}</p>
  `;

  await brevoSend({
    to,
    subject: `Nota de compra #${order.id} - Astro Motors`,
    html,
    attachments: [
      {
        filename: `nota-compra-${order.id}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

// ========================================================
// 2. AUTO RESPUESTA DE CONTACTO
// ========================================================
async function sendContactAutoReply({ to, nombre, mensajeUsuario }) {
  const html = `
    <h2>Hola ${nombre}</h2>
    <p>Gracias por contactarnos. En breve responderemos tu mensaje.</p>
    <p><strong>Tu mensaje:</strong></p>
    <p>${mensajeUsuario}</p>
  `;

  await brevoSend({
    to,
    subject: "Gracias por contactarnos - Astro Motors",
    html,
  });
}

// ========================================================
// 3. CORREO DE BIENVENIDA CON CUPÓN
// ========================================================
async function sendWelcomeEmail({ to, nombre, cuponCodigo = "ASTRO10" }) {
  const html = `
    <h2>Bienvenido ${nombre}</h2>
    <p>Gracias por unirte a Astro Motors.</p>
    <p>Tu cupón especial es:</p>
    <h1>${cuponCodigo}</h1>
  `;

  await brevoSend({
    to,
    subject: "¡Bienvenido a Astro Motors!",
    html,
  });
}

// ========================================================
// 4. RESET PASSWORD
// ========================================================
async function sendPasswordResetEmail({ to, nombre, token }) {
  const baseUrl = process.env.FRONT_BASE_URL;
  const resetUrl = `${baseUrl}/reset-password.html?token=${token}`;

  const html = `
    <h2>Hola ${nombre}</h2>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

  await brevoSend({
    to,
    subject: "Restablecer contraseña - Astro Motors",
    html,
  });
}
console.log("BREVO_API_KEY (Render):", process.env.BREVO_API_KEY ? "CARGADA" : "VACÍA");

module.exports = {
  sendOrderEmail,
  sendContactAutoReply,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};

