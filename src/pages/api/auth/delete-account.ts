import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    // Deletar o usuário e todas as suas informações relacionadas
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    res.status(200).json({ message: "Conta deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    res.status(500).json({ error: "Erro ao deletar conta" });
  }
}
