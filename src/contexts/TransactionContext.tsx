"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  createdAt: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  searchTerm: string;
  updateSearchTerm: (term: string) => void;
  filters: FilterOptions;
  updateFilters: (newFilters: Partial<FilterOptions>) => void;
  categories: string[];
}

interface FilterOptions {
  type: "all" | "income" | "expense";
  category: string;
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

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
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
      );
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
      if (!response.ok) throw new Error("Falha ao adicionar transação");
      await fetchTransactions();
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
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

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filteredTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,
        searchTerm,
        updateSearchTerm,
        filters,
        updateFilters,
        categories,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
