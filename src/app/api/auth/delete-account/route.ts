import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Deletar o usuário
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ message: "Conta deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return NextResponse.json(
      { error: "Erro ao deletar conta" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
