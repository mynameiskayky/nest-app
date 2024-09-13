import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { TransactionFormData } from "@/types/transactions";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "./ConfirmationModal";

const CSVImport: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTransaction, deleteAllTransactions } = useTransactionContext();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (file: File) => {
    setIsImporting(true);
    Papa.parse(file, {
      complete: async (results) => {
        try {
          console.log("CSV parsing complete. Raw data:", results.data);
          const transactions: TransactionFormData[] = results.data
            .slice(1)
            .map((row: any, index: number) => {
              console.log(`Processando linha ${index}:`, row);
              const amount = parseFloat(String(row[1]).replace(",", "."));
              return {
                title: String(row[3] || ""),
                amount: isNaN(amount) ? 0 : amount,
                category: "Outros",
                type: amount >= 0 ? "income" : "expense",
                date: row[0]
                  ? new Date(row[0]).toISOString()
                  : new Date().toISOString(),
              };
            })
            .filter((t): t is TransactionFormData => {
              const isValid = Boolean(t.title && t.amount !== 0);
              if (!isValid) {
                console.log("Transação inválida filtrada:", t);
              }
              return isValid;
            });

          console.log("Processed transactions:", transactions);

          for (const transaction of transactions) {
            try {
              await addTransaction(transaction);
              console.log("Transaction added successfully:", transaction);
            } catch (error) {
              console.error("Error adding transaction:", error);
            }
          }

          toast({
            title: "Importação concluída",
            description: `${transactions.length} transações foram importadas.`,
          });
        } catch (error) {
          console.error("Erro ao processar transações:", error);
          toast({
            title: "Erro na importação",
            description: "Ocorreu um erro ao processar as transações.",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        console.error("Erro ao processar o arquivo CSV:", error);
        toast({
          title: "Erro na importação",
          description: "Ocorreu um erro ao processar o arquivo CSV.",
          variant: "destructive",
        });
        setIsImporting(false);
      },
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDeleteAllTransactions = async () => {
    try {
      await deleteAllTransactions();
      toast({
        title: "Transações excluídas",
        description: "Todas as transações foram excluídas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir todas as transações:", error);
      toast({
        title: "Erro na exclusão",
        description: "Ocorreu um erro ao excluir todas as transações.",
        variant: "destructive",
      });
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="bg-transparent border border-[#00A868] text-[#00A868] hover:bg-[#00A86820] flex items-center space-x-2"
          onClick={handleButtonClick}
          disabled={isImporting}
        >
          {isImporting ? (
            <span>Importando...</span>
          ) : (
            <>
              <Upload size={16} />
              <span>Importar CSV</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="bg-transparent border border-[#FF453A] text-[#FF453A] hover:bg-[#FF453A20] flex items-center space-x-2"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash2 size={16} />
          <span>Excluir Todas</span>
        </Button>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAllTransactions}
        title="Excluir todas as transações"
        message="Tem certeza que deseja excluir todas as transações? Esta ação não pode ser desfeita."
      />
    </>
  );
};

export default CSVImport;
