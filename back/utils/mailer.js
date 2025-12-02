const axios = require("axios");
const { generateOrderPdfBuffer } = require("./pdfReceipt");
const path = require("path");

// EmailJS config
const EMAILJS_PUBLIC_KEY = "vKvBNmFa8mt9Iwfu6";
const EMAILJS_SERVICE_ID = "service_empwfzp";
const EMAILJS_TEMPLATE_ID = "template_j6m1rlo";

// Enviar correo usando EmailJS REST API
async function sendEmail(params) {
  try {
    const res = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: params
    });

    console.log("📩 Email enviado:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ EmailJS error:", err.response?.data || err.message);
    throw new Error("Falló el envío del correo.");
  }
}

//
// ----------------------------------------------------
// 1) CORREO DE COMPRA + PDF ADJUNTO
// ----------------------------------------------------
//
async function sendOrderEmail({ to, nombre, order, totals, items }) {

  // Generar PDF
  const pdfBuffer = await generateOrderPdfBuffer({
    order,
    items,
    totals,
    customerName: nombre
  });

  // PDF en BASE64
  const pdfBase64 = pdfBuffer.toString("base64");

  await sendEmail({
    to,
    name: nombre,
    title: `Nota de compra #${order.id}`,
    message: "Gracias por tu compra. Adjuntamos tu nota en PDF.",
    pdf_name: `nota-compra-${order.id}.pdf`,
    pdf_base64: pdfBase64
  });
}

//
// ----------------------------------------------------
// 2) AUTO-RESPUESTA DE CONTACTO
// ----------------------------------------------------
//
async function sendContactAutoReply({ to, nombre, mensajeUsuario }) {
  await sendEmail({
    to,
    name: nombre,
    title: "Gracias por contactarnos",
    message: mensajeUsuario
  });
}

//
// ----------------------------------------------------
// 3) CORREO DE BIENVENIDA CON CUPÓN
// ----------------------------------------------------
//
async function sendWelcomeEmail({ to, nombre, cuponCodigo = "ASTRO10" }) {
  await sendEmail({
    to,
    name: nombre,
    title: "¡Bienvenido a Astro Motors!",
    message: `Gracias por registrarte. Cupón: ${cuponCodigo}`
  });
}

//
// ----------------------------------------------------
// 4) RESTABLECER CONTRASEÑA
// ----------------------------------------------------
//
async function sendPasswordResetEmail({ to, nombre, token }) {
  const baseUrl = process.env.FRONT_BASE_URL || "http://localhost:5501";
  const link = `${baseUrl}/reset-password.html?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to,
    name: nombre,
    title: "Restablecer contraseña",
    message: `Haz clic aquí para cambiar tu contraseña: ${link}`
  });
}

module.exports = {
  sendOrderEmail,
  sendContactAutoReply,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
