import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
  }
  return transporter;
};

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendMail = async (options: MailOptions): Promise<boolean> => {
  const transport = getTransporter();
  if (!transport) {
    if (env.nodeEnv === 'development') {
      console.log(`[mail:dev] To: ${options.to}\nSubject: ${options.subject}\n${options.text}`);
    }
    return false;
  }
  try {
    await transport.sendMail({
      from: env.mailFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};
