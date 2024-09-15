"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { Transaction, TransactionFormData } from "@/types/transactions";
import { useSession, getSession } from "next-auth/react";

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
  fetchTransactions: (forceRefresh?: boolean) => Promise<void>;
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
  const { data: sessionData, status } = useSession();
  const [session, setSession] = useState(sessionData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    category: null,
  });

  useEffect(() => {
    const loadSession = async () => {
      const loadedSession = await getSession();
      setSession(loadedSession);
    };

    if (!session && status !== "loading") {
      loadSession();
    }
  }, [session, status]);

  const lastFetchTime = useRef<number | null>(null);
  const CACHE_DURATION = 60000; // 1 minuto em milissegundos

  const fetchTransactions = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();
      if (
        session?.user?.id &&
        (forceRefresh ||
          !lastFetchTime.current ||
          now - lastFetchTime.current > CACHE_DURATION)
      ) {
        try {
          const response = await fetch("/api/transactions", {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error("Falha ao buscar transações");
          }
          const data = await response.json();
          setTransactions(data);
          setFilteredTransactions(data);

          const uniqueCategories = Array.from(
            new Set(data.map((t: Transaction) => t.category))
          ) as string[];
          setCategories(uniqueCategories);

          lastFetchTime.current = now;
        } catch (error) {
          console.error("Erro ao buscar transações:", error);
        }
      }
    },
    [session]
  );

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt" | "userId">
  ) => {
    const currentSession = await getSession();
    if (!currentSession?.user?.id) {
      console.error("Usuário não autenticado");
      return;
    }
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.accessToken}`,
        },
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
      await fetchTransactions(true);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      throw error;
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
      await fetchTransactions(true);
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
      await fetchTransactions(true);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
    }
  };

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

  const addCategory = useCallback((category: string) => {
    setCategories((prevCategories) => {
      if (!prevCategories.includes(category)) {
        return [...prevCategories, category];
      }
      return prevCategories;
    });
  }, []);

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
    fetchTransactions,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};
