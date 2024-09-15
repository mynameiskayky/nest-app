import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

function generateVerificationEmailHTML(
  name: string,
  verificationToken: string
) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifique sua conta - Nest Cash</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #00875F;
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
          color: #333333;
        }
        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .verification-code {
          background-color: #f0f0f0;
          border: 2px dashed #00875F;
          border-radius: 8px;
          font-size: 32px;
          font-weight: bold;
          color: #00875F;
          text-align: center;
          padding: 20px;
          margin: 30px 0;
          letter-spacing: 5px;
        }
        .footer {
          background-color: #f9f9f9;
          color: #666666;
          text-align: center;
          padding: 20px;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          background-color: #00875F;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nest Cash</h1>
        </div>
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <p>Bem-vindo ao Nest Cash. Para completar seu cadastro, use o código de verificação abaixo:</p>
          <div class="verification-code">${verificationToken}</div>
          <p>Este código é válido por 30 minutos. Se você não solicitou esta verificação, por favor ignore este e-mail.</p>
          <p>Obrigado por escolher o Nest Cash para gerenciar suas finanças!</p>
          <a href="#" class="button">Visite Nosso Site</a>
        </div>
        <div class="footer">
          <p>&copy; 2023 Nest Cash. Todos os direitos reservados.</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomInt(100000, 999999).toString();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
      },
    });

    const emailHtml = generateVerificationEmailHTML(name, verificationToken);

    await resend.emails.send({
      from: "Nest Cash <onboarding@resend.dev>",
      to: email,
      subject: "Verifique sua conta - Nest Cash",
      html: emailHtml,
    });

    return NextResponse.json(
      {
        message: "Verifique seu e-mail para completar o registro",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
