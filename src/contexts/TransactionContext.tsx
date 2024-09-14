"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Transaction, TransactionFormData } from "@/types/transactions";

export type TransactionContextType = {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  categories: string[];
  addTransaction: (transaction: TransactionFormData) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: TransactionFormData
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: FilterOptions) => void;
  addCategory: (category: string) => void;
  updateFilters: (newFilters: Partial<FilterOptions>) => void;
  searchTerm: string;
  filters: FilterOptions;
  updateSearchTerm: (term: string) => void;
};

interface FilterOptions {
  type: "all" | "income" | "expense";
  category: string | null;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    category: "",
  });
  const [categories, setCategories] = useState<string[]>([]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);

      // Extrair categorias únicas das transações
      const uniqueCategories = Array.from(
        new Set(data.map((t: Transaction) => t.category))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Falha ao adicionar transação: ${
            errorData.error || response.statusText
          }`
        );
      }
      await fetchTransactions();
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      throw error; // Re-throw the error to be caught in the CSVImport component
    }
  };

  const updateTransaction = async (
    id: string,
    transaction: Partial<Transaction>
  ) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Falha ao atualizar transação");
      await fetchTransactions();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir transação");
      await fetchTransactions();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
    }
  };

  const refreshTransactions = useCallback(fetchTransactions, []);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch = transaction.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        filters.type === "all" || transaction.type === filters.type;
      const matchesCategory =
        !filters.category || transaction.category === filters.category;
      return matchesSearch && matchesType && matchesCategory;
    });
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filters]);

  const deleteAllTransactions = async () => {
    try {
      const response = await fetch("/api/transactions", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Falha ao excluir todas as transações");
      }
      setTransactions([]);
      setFilteredTransactions([]);
    } catch (error) {
      console.error("Erro ao excluir todas as transações:", error);
      throw error;
    }
  };

  const addCategory = (category: string) => {
    setCategories((prevCategories) => {
      if (!prevCategories.includes(category)) {
        return [...prevCategories, category];
      }
      return prevCategories;
    });
  };

  const contextValue: TransactionContextType = {
    transactions,
    filteredTransactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setSearchTerm,
    setFilters,
    addCategory,
    updateFilters,
    searchTerm,
    filters,
    updateSearchTerm,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};
