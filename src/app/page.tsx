"use client";

import { useState, useEffect, useRef } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "@/components/TransactionForm";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import SearchBar from "@/components/SearchBar";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { Skeleton } from "@/components/ui/skeleton";
import gsap from "gsap";
import { Transaction, TransactionFormData } from "@/types/transactions";

export default function DTMoney() {
  const {
    filteredTransactions,
    deleteTransaction,
    updateTransaction,
    addTransaction,
    refreshTransactions, // Adicionando refreshTransactions
  } = useTransactionContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    console.log("Transações filtradas em DTMoney:", filteredTransactions);
  }, [filteredTransactions]);

  useEffect(() => {
    if (listRef.current && listRef.current.children.length > 0) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 1, y: -20 },
        {
          opacity: 0,
          y: 0,
          stagger: 0.03,
          duration: 0.1,
          ease: "power2.in",
          onComplete: () => {
            gsap.to(listRef.current!.children, {
              opacity: 1,
              y: 0,
              stagger: 0.03,
              duration: 0.1,
              ease: "power2.out",
            });
          },
        }
      );
    }
  }, [filteredTransactions]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      await deleteTransaction(id);
    }
  };

  const handleSubmitTransaction = async (
    transactionData: TransactionFormData
  ) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }
    setIsDialogOpen(false);
    setEditingTransaction(null);

    // Atualiza as transações após adicionar ou editar
    await refreshTransactions();
  };

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] text-[#F5F5F7] p-8 font-sans">
      <Header>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00A868] hover:bg-[#008C56] text-white rounded-full px-6 py-3 transition-all duration-300 transform hover:scale-105 text-sm font-medium">
              <PlusIcon className="mr-2 h-4 w-4" /> Nova transação
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#2C2C2E] border-[#3A3A3C] rounded-2xl">
            <TransactionForm
              onSubmit={handleSubmitTransaction}
              initialData={editingTransaction}
            />
          </DialogContent>
        </Dialog>
      </Header>

      <SummaryCards income={income} expenses={expenses} />

      <SearchBar />

      {/* Lista de transações */}
      <div className="mt-12">
        <h2 className="text-3xl font-semibold mb-6 text-[#0">Transações</h2>
        {filteredTransactions.length === 0 ? (
          <>
            <Skeleton className="h-24 w-full bg-[#3A3A3C] mb-4 rounded-xl" />
            <Skeleton className="h-24 w-full bg-[#3A3A3C] mb-4 rounded-xl" />
            <Skeleton className="h-24 w-full bg-[#3A3A3C] mb-4 rounded-xl" />
          </>
        ) : (
          <ul ref={listRef} className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="bg-[#2C2C2E] p-6 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex-grow">
                  <p className="font-semibold text-xl mb-1 text-[#F5F5F7]">
                    {transaction.title}
                  </p>
                  <p
                    className={`text-2xl font-medium ${
                      transaction.type === "income"
                        ? "text-[#00A868]"
                        : "text-[#FF453A]"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-[#98989D] mb-1 bg-[#3A3A3C] px-3 py-1 rounded-full">
                    {transaction.category}
                  </span>
                  <span className="text-xs text-[#98989D] mt-2">
                    {new Date(transaction.createdAt).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex space-x-3 ml-6">
                  <Button
                    onClick={() => handleEditTransaction(transaction)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-[#3A3A3C] rounded-full p-3 transition-all duration-200"
                  >
                    <PencilIcon className="h-4 w-4 text-[#00A868]" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-[#3A3A3C] rounded-full p-3 transition-all duration-200"
                  >
                    <TrashIcon className="h-4 w-4 text-[#FF453A]" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
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
