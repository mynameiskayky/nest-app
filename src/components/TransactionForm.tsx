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
import {
  Loader2,
  DollarSign,
  Calendar,
  Tag,
  Type,
  Plus,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  category: z.string().optional(),
  type: z.enum(["income", "expense"]),
  date: z.date({
    required_error: "A data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<TransactionFormData> | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { categories, addCategory } = useTransactionContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          amount: initialData.amount || 0,
          category: initialData.category || "",
          type: initialData.type || "expense",
          date: initialData.date ? new Date(initialData.date) : new Date(),
        }
      : {
          title: "",
          amount: 0,
          category: "",
          type: "expense",
          date: new Date(),
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

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      form.setValue("category", newCategory.trim());
      setNewCategory("");
      setIsAddingNewCategory(false);
    }
  };

  const inputClassName =
    "w-full pl-10 border border-neutral-400 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-neutral-500 transition-colors";
  const selectClassName =
    "w-full border border-neutral-400 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-neutral-500 transition-colors";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Título</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      className={inputClassName}
                      placeholder="Título da transação"
                    />
                    <Tag
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className={inputClassName}
                      />
                      <DollarSign
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
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
                    defaultValue={field.value || "expense"}
                  >
                    <FormControl>
                      <SelectTrigger className={selectClassName}>
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
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Categoria</FormLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`${selectClassName} flex-grow`}
                        >
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingNewCategory(true)}
                      className="whitespace-nowrap hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </div>
                  {isAddingNewCategory && (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nova categoria"
                        className={`${inputClassName} flex-grow`}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddNewCategory}
                        className="hover:bg-green-600 transition-colors"
                      >
                        Adicionar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingNewCategory(false)}
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-medium">Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border border-gray-300 hover:border-gray-400 transition-colors",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            onClick={handleAIProcessing}
            disabled={isProcessing}
            className="flex-1 bg-neutral-700 hover:bg-neutral-800 text-white transition-colors"
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
            className="flex-1 bg-green-500 hover:bg-green-600 text-white transition-colors"
          >
            {initialData ? "Atualizar" : "Adicionar"} Transação
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
