import transporter from '../config/mailer.js';
import { APP_NAME } from '../config/constants.js';

export const EmailService = {
  sendResetPasswordEmail: async (email: string, token: string, host: string) => {
    const resetUrl = `https://${host}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"${APP_NAME}" <no-reply@kuronabot.com>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur ${APP_NAME}.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#d4a373;color:white;text-decoration:none;border-radius:5px;">Réinitialiser mon mot de passe</a>
        <p>Si vous n'avez pas demandé cela, vous pouvez ignorer cet email.</p>
        <p>Ce lien expirera dans 1 heure.</p>
      `
    };

    try {
      if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
        console.log(`Email de réinitialisation envoyé à ${email}`);
      } else {
        console.log('--- EMAIL SIMULÉ (SMTP non configuré) ---');
        console.log(`Destinataire: ${email}`);
        console.log(`Lien: ${resetUrl}`);
        console.log('------------------------------------------');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation.');
    }
  }
};
