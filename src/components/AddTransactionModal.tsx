import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import TransactionForm from "./TransactionForm";
import { Transaction, TransactionFormData } from "@/types/transactions";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useToast } from "@/hooks/use-toast";
import { useTransactionContext } from "@/contexts/TransactionContext";

const AddTransactionModal: React.FC<{ buttonText?: string }> = ({
  buttonText = "Nova transação",
}) => {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { addTransaction, updateTransaction } = useTransactionContext();
  const [editingTransaction, setEditingTransaction] =
    React.useState<Transaction | null>(null);

  const handleSubmit = async (transactionData: TransactionFormData) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
          variant: "default",
        });
      } else {
        await addTransaction(transactionData);
        toast({
          title: "Transação adicionada",
          description: "A nova transação foi adicionada com sucesso.",
          variant: "default",
        });
      }
      setOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      toast({
        title: "Erro na operação",
        description: "Não foi possível processar a transação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-full px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm font-medium">
          <PlusIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>{buttonText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`
        p-0 
        ${isMobile ? "w-full h-full max-h-[100dvh]" : "w-[90vw] max-w-md"}
      `}
      >
        <div className={`${isMobile ? "h-full flex flex-col" : ""}`}>
          <div className={`p-6 ${isMobile ? "flex-grow overflow-y-auto" : ""}`}>
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              {editingTransaction ? "Editar Transação" : "Nova Transação"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500 mb-6">
              Preencha os detalhes da sua{" "}
              {editingTransaction ? "transação existente" : "nova transação"}{" "}
              abaixo.
            </DialogDescription>
            <TransactionForm
              onSubmit={handleSubmit}
              initialData={editingTransaction}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
