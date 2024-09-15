import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId, otp } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.verificationToken !== otp) {
      return NextResponse.json({ message: "Código inválido" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    return NextResponse.json(
      { message: "E-mail verificado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao verificar e-mail:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
