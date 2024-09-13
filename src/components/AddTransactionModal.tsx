import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import TransactionForm from "./TransactionForm";
import { TransactionFormData } from "@/types/transactions";
import { useIsMobile } from "@/hooks/useIsMobile";

interface AddTransactionModalProps {
  onSubmit: (data: TransactionFormData) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  onSubmit,
}) => {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (data: TransactionFormData) => {
    await onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-full px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm font-medium">
          <PlusIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>Nova transação</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`
        p-0 
        ${isMobile ? "w-full h-full max-h-[100dvh]" : "w-[90vw] max-w-md"}
      `}
      >
        <div className={`${isMobile ? "h-full flex flex-col" : ""}`}>
          <div className={`p-6 ${isMobile ? "flex-grow overflow-y-auto" : ""}`}>
            <h2 className="text-2xl font-bold text-center mb-6">
              Nova Transação
            </h2>
            <TransactionForm onSubmit={handleSubmit} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
