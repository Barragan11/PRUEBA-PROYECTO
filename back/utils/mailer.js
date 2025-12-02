const axios = require("axios");

/**
 * ENVÍA CORREOS USANDO EMAILJS
 * Sirve para: contacto, registro, bienvenida, reset password, compras con PDF
 */
async function sendEmail({ to, name, title, message, pdf_name, pdf_base64 }) {
  try {
    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        to,
        name,
        title,
        message,
        date: new Date().toLocaleDateString("es-MX"),

        // opcionales (solo para compras)
        pdf_name: pdf_name || "",
        pdf_base64: pdf_base64 || ""
      }
    };

    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      payload,
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    console.log("📨 EmailJS enviado:", response.data);
    return true;

  } catch (err) {
    console.error("❌ Error enviando EmailJS:", err.response?.data || err);
    return false;
  }
}

module.exports = { sendEmail };
