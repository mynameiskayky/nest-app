import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita."
      )
    ) {
      setIsDeleting(true);
      try {
        const response = await fetch("/api/auth/delete-account", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          toast({
            title: "Conta deletada",
            description: "Sua conta foi deletada com sucesso.",
            variant: "default",
          });
          await signOut({ callbackUrl: "/" });
        } else {
          const data = await response.json();
          toast({
            title: "Erro ao deletar conta",
            description: data.error || "Ocorreu um erro ao deletar a conta.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao deletar conta:", error);
        toast({
          title: "Erro ao deletar conta",
          description: "Ocorreu um erro ao tentar deletar a conta.",
          variant: "destructive",
        });
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
