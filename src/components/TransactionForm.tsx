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
import { Loader2, DollarSign, Calendar, Tag, Type } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  category: z.string().min(1, "A categoria é obrigatória"),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "A data é obrigatória"),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<TransactionFormData> | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { categories } = useTransactionContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          amount: initialData.amount || 0,
          category: initialData.category || "",
          type: initialData.type || "expense",
          date: initialData.date || new Date().toISOString().split("T")[0],
        }
      : {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Título</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} className="w-full pl-10 border-white" />
                    <Tag
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Valor</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      className="w-full pl-10 border-white"
                    />
                    <DollarSign
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
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
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Data</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      {...field}
                      className="w-full pl-10 border-white"
                    />
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            onClick={handleAIProcessing}
            disabled={isProcessing}
            className="flex-1 bg-neutral-700 hover:bg-neutral-800 text-white transition-colors duration-200"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Type className="mr-2 h-4 w-4" />
                Processar com IA
              </>
            )}
          </Button>

          <Button
            type="submit"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
          >
            {initialData ? "Atualizar" : "Adicionar"} Transação
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
