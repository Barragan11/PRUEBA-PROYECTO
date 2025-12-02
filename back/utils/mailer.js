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
<div style="background:#0d0d0f; padding:32px; font-family:Arial, sans-serif;">
  <table width="100%" style="max-width:620px; margin:auto; background:#111114; padding:24px; border-radius:14px; color:#fff;">
    <tr>
      <td style="text-align:center;">
        <h1 style="margin:0; font-size:22px; letter-spacing:0.12em; text-transform:uppercase;">ASTRO MOTORS</h1>
        <p style="color:#bbb; margin-top:6px;">"Conquista la carretera, llega más lejos"</p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:22px;">
        <h2 style="margin:0; font-size:20px; color:#ff5c33;">Gracias por tu compra 🚗</h2>
        <p style="font-size:15px; line-height:1.7;">
          Hola <strong>${nombre}</strong>, tu compra se registró exitosamente.
        </p>

        <p style="font-size:15px; line-height:1.7;">
          Adjuntamos tu <strong>nota de compra #${order.id}</strong> con todos los detalles:
        </p>

        <ul style="font-size:14px; line-height:1.7; color:#ddd;">
          <li>Productos adquiridos</li>
          <li>Subtotal, impuestos y envío</li>
          <li>Cupón aplicado (si corresponde)</li>
          <li>Total general</li>
        </ul>

        <div style="margin-top:22px; padding:18px; background:#1a1a1d; border-radius:10px; font-size:14px;">
          <strong>📄 El archivo PDF se encuentra adjunto a este correo.</strong>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding-top:26px; text-align:center; font-size:12px; color:#777;">
        Astro Motors · Proyecto académico · ${new Date().getFullYear()}
      </td>
    </tr>
  </table>
</div>
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
<div style="background:#0d0d0f; padding:32px; font-family:Arial, sans-serif;">
  <table width="100%" style="max-width:600px; margin:auto; background:#111114; padding:24px; border-radius:14px; color:#fff;">
    
    <tr>
      <td style="text-align:center;">
        <h1 style="margin:0; font-size:22px; letter-spacing:0.12em;">ASTRO MOTORS</h1>
        <p style="color:#bbb; margin-top:6px;">"Conquista la carretera, llega más lejos"</p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px;">
        <h2 style="margin:0; font-size:19px;">Gracias por contactarnos</h2>

        <p style="font-size:15px; line-height:1.7;">
          Hola <strong>${nombre}</strong>, recibimos tu mensaje y nuestro equipo te responderá pronto.
        </p>

        <div style="margin-top:18px; padding:14px; background:#1b1b1d; border-radius:10px;">
          <p style="font-size:14px; margin:0; color:#ccc;">
            <strong>Tu mensaje:</strong><br><br>
            ${mensajeUsuario}
          </p>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding-top:26px; text-align:center; font-size:12px; color:#777;">
        Astro Motors · Proyecto académico · ${new Date().getFullYear()}
      </td>
    </tr>

  </table>
</div>
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
<div style="background:#0d0d0f; padding:32px; font-family:Arial;">
  <table width="100%" style="max-width:600px; margin:auto; background:#111114; padding:24px; border-radius:14px; color:#fff;">

    <tr>
      <td style="text-align:center;">
        <h1 style="font-size:22px; margin:0; letter-spacing:0.12em;">ASTRO MOTORS</h1>
        <p style="color:#bbb; margin-top:6px;">"Conquista la carretera, llega más lejos"</p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:24px;">
        <h2 style="margin:0; font-size:20px;">🎉 Bienvenido, ${nombre}</h2>

        <p style="font-size:15px; line-height:1.7;">
          Gracias por registrarte en <strong>Astro Motors</strong>. Aquí está tu cupón especial:
        </p>

        <div style="margin-top:18px; background:linear-gradient(135deg,#ff4444,#ff8800); padding:18px 20px; border-radius:14px; text-align:center; color:#fff;">
          <p style="margin:0; font-size:13px; letter-spacing:0.15em; text-transform:uppercase;">Cupón de bienvenida</p>
          <h1 style="margin:10px 0 0; font-size:28px; letter-spacing:0.25em;">${cuponCodigo}</h1>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding-top:26px; text-align:center; font-size:12px; color:#777;">
        Astro Motors · Proyecto académico · ${new Date().getFullYear()}
      </td>
    </tr>

  </table>
</div>
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
<div style="background:#0d0d0f; padding:32px; font-family:Arial;">
  <table width="100%" style="max-width:600px; margin:auto; background:#111114; padding:24px; border-radius:14px; color:#fff;">

    <tr>
      <td style="text-align:center;">
        <h1 style="font-size:22px; margin:0; letter-spacing:0.12em;">ASTRO MOTORS</h1>
        <p style="color:#bbb; margin-top:6px;">"Conquista la carretera, llega más lejos"</p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:22px;">
        <h2 style="margin:0; font-size:20px;">Restablecer contraseña</h2>

        <p style="font-size:15px; line-height:1.7;">
          Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer tu contraseña.
        </p>

        <div style="text-align:center; margin:28px 0;">
          <a href="${resetUrl}" 
             style="display:inline-block; padding:14px 28px; background:linear-gradient(135deg,#ff4444,#ff8800);
                    color:#fff; border-radius:999px; font-weight:bold; text-decoration:none;">
            Restablecer contraseña
          </a>
        </div>

        <p style="font-size:13px; color:#999;">
          Si el botón no funciona, copia y pega este enlace:<br><br>
          <span style="word-break:break-all;">${resetUrl}</span>
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:26px; text-align:center; font-size:12px; color:#777;">
        Astro Motors · Proyecto académico · ${new Date().getFullYear()}
      </td>
    </tr>

  </table>
</div>
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


