import React, { useRef, useState } from "react";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { TransactionFormData } from "@/types/transactions";
import { useCompletion } from "ai/react";

const CSVImport: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTransaction } = useTransactionContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const { complete } = useCompletion({
    api: "/api/ai-categorize",
  });

  const processTransactionWithAI = async (transaction: TransactionFormData) => {
    try {
      const result = (await complete(
        `Melhore o título e escolha uma categoria para esta transação: Título original: ${transaction.title}, Valor: ${transaction.amount}, Data: ${transaction.date}`
      )) as string;

      const { improvedTitle, category } = JSON.parse(result);

      return {
        ...transaction,
        title: improvedTitle || transaction.title,
        category: category || transaction.category,
      };
    } catch (error) {
      console.error("Erro ao processar transação com IA:", error);
      return transaction;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      Papa.parse(file, {
        complete: async (results) => {
          const transactions: TransactionFormData[] = results.data
            .slice(1)
            .map((row: unknown) => {
              if (Array.isArray(row)) {
                return {
                  title: row[3],
                  amount: parseFloat(row[1]),
                  date: new Date(row[0]),
                  category: "",
                  type: parseFloat(row[1]) > 0 ? "income" : "expense",
                } as TransactionFormData;
              }
              throw new Error("Row is not of type string[]");
            });

          for (const transaction of transactions) {
            const processedTransaction = await processTransactionWithAI(
              transaction
            );
            addTransaction(processedTransaction);
          }

          setIsProcessing(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        header: false,
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        {isProcessing ? "Processando..." : "Importar CSV"}
      </Button>
    </div>
  );
};

export default CSVImport;
