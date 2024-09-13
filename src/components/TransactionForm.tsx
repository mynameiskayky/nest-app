import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFormData } from "@/types/transactions";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { useCompletion } from "ai/react";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  category: z.string().min(1, "A categoria é obrigatória"),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "A data é obrigatória"),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: TransactionFormData;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { categories } = useTransactionContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      amount: 0,
      category: "",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const { complete } = useCompletion({
    api: "/api/ai-categorize",
  });

  const handleAIProcessing = async () => {
    setIsProcessing(true);
    const title = form.getValues("title");
    const amount = form.getValues("amount");

    try {
      const result =
        (await complete(
          `Categorize a seguinte transação: Título: ${title}, Valor: ${amount}`
        )) || "{}";
      const aiSuggestion = JSON.parse(result);

      form.setValue("category", aiSuggestion.category ?? "");
      form.setValue("type", aiSuggestion.type);

      // Tratar o título se necessário
      if (aiSuggestion.treatedTitle) {
        form.setValue("title", aiSuggestion.treatedTitle);
      }
    } catch (error) {
      console.error("Erro ao processar com IA:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          onClick={handleAIProcessing}
          disabled={isProcessing}
          className="w-full mb-4"
        >
          {isProcessing ? "Processando..." : "Processar com IA"}
        </Button>

        <Button type="submit" className="w-full">
          {initialData ? "Atualizar" : "Adicionar"} Transação
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;
