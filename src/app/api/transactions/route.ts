import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

async function getSession(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token;
}

export async function GET(req: NextRequest) {
  const token = await getSession(req);
  if (!token || !token.sub) {
    return NextResponse.json(
      { error: "Não autorizado", token },
      { status: 401 }
    );
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: token.sub,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar transações" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = await getSession(req);
  if (!token || !token.sub) {
    return NextResponse.json(
      { error: "Não autorizado", token },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, amount, category, type } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: "O valor da transação deve ser um número válido" },
        { status: 400 }
      );
    }

    const setCategory = category === "" ? null : category;

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: parsedAmount,
        category: setCategory,
        type,
        userId: token.sub,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, amount, category, type } = body;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        title,
        amount,
        category,
        type,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar transação" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Deletar uma transação específica
      await prisma.transaction.delete({
        where: { id },
      });
      return NextResponse.json({ message: "Transação deletada com sucesso" });
    } else {
      // Deletar todas as transações
      await prisma.transaction.deleteMany({});
      return NextResponse.json({
        message: "Todas as transações foram deletadas com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao deletar transação(ões):", error);
    return NextResponse.json(
      { error: "Erro ao deletar transação(ões)" },
      { status: 500 }
    );
  }
}
