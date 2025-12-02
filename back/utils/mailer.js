// back/utils/mailer.js
const axios = require("axios");

// === CONFIG EmailJS ===
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_WELCOME = process.env.EMAILJS_TEMPLATE_WELCOME;
const EMAILJS_TEMPLATE_CONTACT = process.env.EMAILJS_TEMPLATE_CONTACT;
const EMAILJS_TEMPLATE_RESET = process.env.EMAILJS_TEMPLATE_RESET;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

async function sendEmailJS(templateId, data) {
  const url = "https://api.emailjs.com/api/v1.0/email/send";

  try {
    const response = await axios.post(url, {
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: data
    });

    console.log("📧 EmailJS enviado:", response.status);
  } catch (error) {
    console.error("❌ Error EmailJS:", error.response?.data || error.message);
    throw error;
  }
}

// =============================
//      📩 BIENVENIDA
// =============================
async function sendWelcomeEmail({ to, nombre, cuponCodigo = "ASTRO10" }) {
  await sendEmailJS(EMAILJS_TEMPLATE_WELCOME, {
    to_email: to,
    user_name: nombre,
    coupon_code: cuponCodigo
  });
}

// =============================
//   📩 AUTO-RESPUESTA CONTACTO
// =============================
async function sendContactAutoReply({ to, nombre, mensajeUsuario }) {
  await sendEmailJS(EMAILJS_TEMPLATE_CONTACT, {
    to_email: to,
    user_name: nombre,
    user_message: mensajeUsuario
  });
}

// =============================
//   📩 RESTABLECER CONTRASEÑA
// =============================
async function sendPasswordResetEmail({ to, nombre, token }) {
  const resetUrl =
    `${process.env.FRONT_BASE_URL}/reset-password.html?token=${encodeURIComponent(token)}`;

  await sendEmailJS(EMAILJS_TEMPLATE_RESET, {
    to_email: to,
    user_name: nombre,
    reset_link: resetUrl
  });
}

module.exports = {
  sendWelcomeEmail,
  sendContactAutoReply,
  sendPasswordResetEmail
};
