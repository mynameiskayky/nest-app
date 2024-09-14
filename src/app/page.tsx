"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "@/components/TransactionForm";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import SearchBar from "@/components/SearchBar";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Transaction, TransactionFormData } from "@/types/transactions";
import { useSwipeable } from "react-swipeable";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CSVImport from "@/components/CSVImport";

// Registrar o plugin ScrollTrigger
const isBrowser = typeof window !== "undefined";
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DTMoney() {
  const {
    filteredTransactions,
    deleteTransaction,
    updateTransaction,
    addTransaction,
  } = useTransactionContext();
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

  const handleSubmitTransaction = useCallback(
    async (transactionData: TransactionFormData) => {
      try {
        if (editingTransaction) {
          await updateTransaction(editingTransaction.id, transactionData);
          toast({
            title: "Transação atualizada",
            description: "A transação foi atualizada com sucesso.",
            variant: "default",
          });
        } else {
          await addTransaction(transactionData);
          toast({
            title: "Transação adicionada",
            description: "A nova transação foi adicionada com sucesso.",
            variant: "default",
          });
        }
        setIsDialogOpen(false);
        setEditingTransaction(null);
      } catch (error) {
        toast({
          title: "Erro na operação",
          description:
            "Não foi possível processar a transação. Tente novamente.",
          variant: "destructive",
        });
      }
    },
    [editingTransaction, updateTransaction, addTransaction, toast]
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] text-[#F5F5F7] p-4 sm:p-6 md:p-8 font-sans">
      <Header>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00A868] hover:bg-[#008C56] text-white rounded-full px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm font-medium">
                <PlusIcon
                  className="mr-2 h-3 w-3 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />
                <span>Nova transação</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2C2C2E] border-[#3A3A3C] rounded-2xl w-[90vw] max-w-md">
              <TransactionForm
                onSubmit={handleSubmitTransaction}
                initialData={editingTransaction}
              />
            </DialogContent>
          </Dialog>
        </div>
      </Header>

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
          <CSVImport />
        </header>
        {filteredTransactions.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton
                key={index}
                className="h-20 sm:h-24 w-full bg-[#3A3A3C] rounded-xl"
              />
            ))}
          </div>
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
