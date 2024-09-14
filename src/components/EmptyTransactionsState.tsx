import React from "react";
import AddTransactionModal from "@/components/AddTransactionModal";

export default function EmptyTransactionsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-48 h-48 mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A3A3C] to-[#2C2C2E] rounded-full animate-pulse"></div>
        <div className="absolute inset-4 bg-[#1C1C1E] rounded-full flex items-center justify-center">
          <svg
            className="w-24 h-24 text-[#98989D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-[#F5F5F7]">
        Nenhuma transação ainda
      </h3>
      <p className="text-[#98989D] mb-8 max-w-md">
        Parece que você ainda não registrou nenhuma transação. Que tal começar
        agora?
      </p>
      <AddTransactionModal buttonText="Adicionar transação" />
    </div>
  );
}
