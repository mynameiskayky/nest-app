import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogFooter } from "@/components/ui/dialog";

type TransactionFormProps = {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Transaction | null;
};

export default function TransactionForm({
  onSubmit,
  initialData,
}: TransactionFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [amount, setAmount] = useState(initialData?.amount.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [type, setType] = useState<"income" | "expense">(
    initialData?.type || "income"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      amount: parseFloat(amount),
      category,
      type,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? "Editar transação" : "Nova transação"}
      </h2>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right text-white">
            Título
          </Label>
          <Input
            id="title"
            className="col-span-3 bg-[#121214] border-[#323238] text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right text-white">
            Valor
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            className="col-span-3 bg-[#121214] border-[#323238] text-white"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right text-white">
            Categoria
          </Label>
          <Input
            id="category"
            className="col-span-3 bg-[#121214] border-[#323238] text-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <RadioGroup
          value={type}
          onValueChange={(value: "income" | "expense") => setType(value)}
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
        <Button type="submit" className="w-full mt-4" disabled={false}>
          {initialData ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
