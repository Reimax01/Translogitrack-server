const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para enviar correo de recuperación
const enviarEmailRecuperacion = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"TransLogiTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de contraseña',
    html: `
      <h1>Recuperación de contraseña</h1>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Correo de recuperación enviado a ${email}`);
  } catch (error) {
    logger.error(`Error al enviar correo a ${email}: ${error.message}`);
    throw new Error('Error al enviar el correo de recuperación');
  }
};

// Función para enviar notificaciones de pedidos
const enviarNotificacionPedido = async (email, pedido) => {
  const mailOptions = {
    from: `"TransLogiTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Actualización de tu pedido #${pedido.id_pedido}`,
    html: `
      <h1>Estado de tu pedido</h1>
      <p>El estado de tu pedido #${pedido.id_pedido} ha cambiado a <strong>${pedido.estado}</strong>.</p>
      ${pedido.estado === 'En tránsito' ? 
        `<p>Puedes seguir el envío en tiempo real en nuestra plataforma.</p>` : ''}
      ${pedido.estado === 'Entregado' ? 
        `<p>¡Tu pedido ha sido entregado con éxito!</p>` : ''}
      <p>Gracias por confiar en TransLogiTrack.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Notificación de pedido enviada a ${email}`);
  } catch (error) {
    logger.error(`Error al enviar notificación a ${email}: ${error.message}`);
  }
};

module.exports = {
  enviarEmailRecuperacion,
  enviarNotificacionPedido
};