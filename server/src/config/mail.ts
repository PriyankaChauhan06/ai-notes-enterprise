import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
});
