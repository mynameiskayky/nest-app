import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useTransactionContext } from "@/contexts/TransactionContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchBar() {
  const { searchTerm, filters, updateSearchTerm, updateFilters, categories } =
    useTransactionContext();
  const debouncedUpdateSearchTerm = useDebounce(
    (term: string) => updateSearchTerm(term),
    500
  ) as unknown as (term: string) => void;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTerm = e.target.value;
      debouncedUpdateSearchTerm(newTerm);
    },
    [debouncedUpdateSearchTerm]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      updateFilters({ type: value as "income" | "expense" | "all" });
    },
    [updateFilters]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateFilters({ category: value === "all" ? "" : value });
    },
    [updateFilters]
  );

  const commonStyles =
    "h-10 bg-[#121214] border-[#323238] text-white placeholder-[#7C7C8A] rounded-md";

  return (
    <div className="flex gap-2">
      <Input
        className={`flex-grow ${commonStyles}`}
        placeholder="Busque por transações"
        defaultValue={searchTerm}
        onChange={handleInputChange}
      />
      <Select value={filters.type} onValueChange={handleTypeChange}>
        <SelectTrigger className={`w-[220px] ${commonStyles}`}>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent className="bg-[#202024] border-[#323238] text-white">
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.category || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className={`w-[220px] ${commonStyles}`}>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent className="bg-[#202024] border-[#323238] text-white">
          <SelectItem value="all">Por Categoria</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
