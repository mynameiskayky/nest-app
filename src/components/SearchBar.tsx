import React, { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchBar() {
  const { searchTerm, filters, updateSearchTerm, updateFilters, categories } =
    useTransactionContext();
  const debouncedUpdateSearchTerm = useDebounce(updateSearchTerm, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedUpdateSearchTerm(e.target.value);
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
      updateFilters({
        category:
          value === "all_categories" || value === "unassigned" ? null : value,
      });
    },
    [updateFilters]
  );

  const commonStyles = useMemo(
    () =>
      "h-10 bg-[#121214] border-[#323238] text-white placeholder-[#7C7C8A] rounded-md focus:ring-2 focus:ring-[#00A868] focus:border-transparent",
    []
  );

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="flex-grow">
        <Input
          className={commonStyles}
          placeholder="Busque por transações"
          defaultValue={searchTerm}
          onChange={handleInputChange}
          aria-label="Buscar transações"
        />
      </div>
      <div className="flex space-x-4">
        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className={`w-full sm:w-[120px] ${commonStyles}`}>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-[#202024] border-[#323238] text-white">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={
            filters.category === null
              ? "unassigned"
              : filters.category === undefined
              ? "all_categories"
              : filters.category
          }
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className={`w-full sm:w-[120px] ${commonStyles}`}>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-[#202024] border-[#323238] text-white max-h-60 overflow-y-auto">
            <SelectItem value="all_categories">Todas</SelectItem>
            <SelectItem value="unassigned">Sem categoria</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
