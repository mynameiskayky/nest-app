import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Tente encontrar e deletar o usuário (ou a conta) pelo ID ou critério que você conhece
  const deleteUser = await prisma.user.delete({
    where: {
      id: "cm1397mfo0007131954klksgb", // Substitua pelo ID do usuário que você deseja apagar
    },
  });

  console.log("Usuário deletado:", deleteUser);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
