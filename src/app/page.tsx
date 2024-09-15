"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import SearchBar from "@/components/SearchBar";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { useToast } from "@/hooks/use-toast";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Transaction } from "@/types/transactions";
import { useSwipeable } from "react-swipeable";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CSVImport from "@/components/CSVImport";
import EmptyTransactionsState from "@/components/EmptyTransactionsState";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddTransactionModal from "@/components/AddTransactionModal";
import LoadingScreen from "@/components/LoadingScreen";
import LoginButton from "@/components/LoginButton";

// Registrar o plugin ScrollTrigger
const isBrowser = typeof window !== "undefined";
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DTMoney() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { filteredTransactions, fetchTransactions, deleteTransaction } =
    useTransactionContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const { toast } = useToast();
  const [swipedTransactionId, setSwipedTransactionId] = useState<string | null>(
    null
  );

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({ isOpen: false, transaction: null });

  const animateTransactions = useCallback(() => {
    if (isBrowser && listRef.current && itemsRef.current.length > 0) {
      gsap.fromTo(
        itemsRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.95,
          rotateX: -10,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          stagger: 0.05,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top bottom-=100",
            end: "bottom top+=100",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    animateTransactions();
  }, [filteredTransactions, animateTransactions]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteTransaction = useCallback((transaction: Transaction) => {
    setConfirmationModal({
      isOpen: true,
      transaction,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (confirmationModal.transaction) {
      try {
        await deleteTransaction(confirmationModal.transaction.id);
        toast({
          title: "Transação excluída",
          description: "A transação foi excluída com sucesso.",
          variant: "default",
        });
        // Animar a remoção do item após a exclusão bem-sucedida
        const item = itemsRef.current.find(
          (el) => el?.dataset.id === confirmationModal.transaction?.id
        );
        if (item) {
          gsap.to(item, {
            height: 0,
            opacity: 0,
            marginBottom: 0,
            duration: 0.3,
            ease: "power2.in",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a transação. Tente novamente.",
          variant: "destructive",
        });
      }
    }
    setConfirmationModal({ isOpen: false, transaction: null });
  }, [confirmationModal.transaction, deleteTransaction, toast]);

  const handleSwipe = useCallback(
    (transaction: Transaction, direction: "left" | "right") => {
      setSwipedTransactionId(transaction.id);

      if (direction === "left") {
        handleDeleteTransaction(transaction);
      } else {
        handleEditTransaction(transaction);
      }

      setTimeout(() => {
        setSwipedTransactionId(null);
      }, 300);
    },
    [handleDeleteTransaction, handleEditTransaction]
  );

  const isMobile = useMediaQuery("(max-width: 768px)");

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const transactionId = (eventData.event.target as HTMLElement).closest(
        "li"
      )?.dataset.id;
      const transaction = filteredTransactions.find(
        (t) => t.id === transactionId
      );
      if (transaction) {
        handleSwipe(transaction, "left");
      }
    },
    onSwipedRight: (eventData) => {
      const transactionId = (eventData.event.target as HTMLElement).closest(
        "li"
      )?.dataset.id;
      const transaction = filteredTransactions.find(
        (t) => t.id === transactionId
      );
      if (transaction) {
        handleSwipe(transaction, "right");
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    if (status === "unauthenticated") {
      setTimeout(() => {
        router.push("/auth");
      }, 600);
    } else if (status === "authenticated") {
      setIsLoading(true);
    }
  }, [status, router]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    if (session) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

  if (status === "loading" || isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] text-[#F5F5F7] p-4 sm:p-6 md:p-8 font-sans">
      <Header />

      <SummaryCards income={income} expenses={expenses} />

      <SearchBar />

      <section className="mt-8 sm:mt-12" aria-labelledby="transactions-title">
        <header className="flex justify-between items-center">
          <h2
            id="transactions-title"
            className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-[#F5F5F7]"
          >
            Transações
          </h2>
          <div className="flex items-center space-x-4">
            <CSVImport />
            <AddTransactionModal
              buttonText="Nova transação"
              buttonType="secondary"
            />
          </div>
        </header>
        {filteredTransactions.length === 0 ? (
          <EmptyTransactionsState />
        ) : (
          <ul ref={listRef} className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <li
                key={transaction.id}
                {...(isMobile ? swipeHandlers : {})}
                data-id={transaction.id}
                className={`bg-[#2C2C2E] p-4 rounded-xl flex flex-col shadow-sm transition-all duration-300 relative overflow-hidden
                  ${isMobile ? "cursor-grab active:cursor-grabbing" : ""}
                  ${
                    swipedTransactionId === transaction.id
                      ? "opacity-50"
                      : "opacity-100"
                  }
                  ${isMobile ? "swipe-indicator" : ""}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-grow">
                    <p className="font-semibold text-base text-[#F5F5F7] truncate max-w-[70%]">
                      {transaction.title}
                    </p>
                    <p className="text-sm text-[#98989D] mt-1">
                      {transaction.category}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-medium ${
                      transaction.type === "income"
                        ? "text-[#00A868]"
                        : "text-[#FF453A]"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <time
                    className="text-xs text-[#98989D]"
                    dateTime={transaction.createdAt}
                  >
                    {new Date(transaction.createdAt).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      }
                    )}
                  </time>
                  {!isMobile && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditTransaction(transaction)}
                        className="bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white text-xs px-3 py-1 rounded-full transition-colors duration-200"
                        size="sm"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteTransaction(transaction)}
                        className="bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white text-xs px-3 py-1 rounded-full transition-colors duration-200"
                        size="sm"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({ isOpen: false, transaction: null })
        }
        onConfirm={handleConfirmDelete}
        title="Excluir transação"
        message="Tem certeza que deseja excluir esta transação?"
      />
    </div>
  );
}

// Função auxiliar para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
