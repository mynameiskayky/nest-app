import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/useIsMobile";
import TransactionForm from "./TransactionForm";
import { TransactionFormData } from "@/types/transactions";

type EditTransactionFormProps = {
  transaction: TransactionFormData & { id: string };
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
};

export default function EditTransactionForm({
  transaction,
  onSubmit,
  onCancel,
}: EditTransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-0">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-white text-xl">
          Editar Transação
        </DialogTitle>
        <DialogDescription className="text-[#C4C4CC]">
          Edite os detalhes da transação.
        </DialogDescription>
      </DialogHeader>
      <div className={`p-6 ${isMobile ? "flex-grow overflow-y-auto" : ""}`}>
        <TransactionForm onSubmit={handleSubmit} initialData={transaction} />
      </div>
      <DialogFooter
        className={isMobile ? "flex-col space-y-2 mt-auto p-6" : "p-6"}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className={`
            bg-[#323238] text-white hover:bg-[#29292E]
            ${isMobile ? "w-full py-3 text-base" : ""}
          `}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="transaction-form"
          className={`
            bg-[#00875F] hover:bg-[#015F43] text-white
            ${isMobile ? "w-full py-3 text-base" : ""}
          `}
          disabled={isLoading}
        >
          {isLoading ? "Atualizando..." : "Atualizar transação"}
        </Button>
      </DialogFooter>
    </div>
  );
}
