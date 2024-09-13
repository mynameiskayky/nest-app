import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type EditTransactionFormProps = {
  transaction: {
    id: string;
    title: string;
    amount: number;
    category: string;
    type: string;
  };
  onSubmit: (
    id: string,
    title: string,
    amount: number,
    category: string,
    type: string
  ) => void;
  onCancel: () => void;
};

export default function EditTransactionForm({
  transaction,
  onSubmit,
  onCancel,
}: EditTransactionFormProps) {
  const [editedTransaction, setEditedTransaction] = useState(transaction);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTransaction),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar transação");
      }

      const updatedTransaction = await response.json();
      onSubmit(
        updatedTransaction.id,
        updatedTransaction.title,
        updatedTransaction.amount,
        updatedTransaction.category,
        updatedTransaction.type
      );
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-white">Editar Transação</DialogTitle>
        <DialogDescription className="text-[#C4C4CC]">
          Edite os detalhes da transação.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-white">
              Título
            </Label>
            <Input
              id="title"
              className="col-span-3 bg-[#121214] border-[#323238] text-white"
              value={editedTransaction.title}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right text-white">
              Valor
            </Label>
            <Input
              id="amount"
              type="number"
              className="col-span-3 bg-[#121214] border-[#323238] text-white"
              value={editedTransaction.amount}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  amount: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right text-white">
              Categoria
            </Label>
            <Input
              id="category"
              className="col-span-3 bg-[#121214] border-[#323238] text-white"
              value={editedTransaction.category}
              onChange={(e) =>
                setEditedTransaction({
                  ...editedTransaction,
                  category: e.target.value,
                })
              }
            />
          </div>
          <RadioGroup
            value={editedTransaction.type}
            onValueChange={(value) =>
              setEditedTransaction({ ...editedTransaction, type: value })
            }
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="text-white">
                Receita
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="text-white">
                Despesa
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-[#323238] text-white hover:bg-[#29292E]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#00875F] hover:bg-[#015F43] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Atualizando..." : "Atualizar transação"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
