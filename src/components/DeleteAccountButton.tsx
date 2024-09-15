import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita."
      )
    ) {
      setIsDeleting(true);
      try {
        const response = await fetch("/api/auth/delete-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          await signOut({ callbackUrl: "/" });
        } else {
          const data = await response.json();
          alert(data.error || "Erro ao deletar conta");
        }
      } catch (error) {
        console.error("Erro ao deletar conta:", error);
        alert("Ocorreu um erro ao tentar deletar a conta");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
      onClick={handleDeleteAccount}
      disabled={isDeleting}
    >
      {isDeleting ? "Deletando..." : "Deletar Conta"}
    </Button>
  );
}
