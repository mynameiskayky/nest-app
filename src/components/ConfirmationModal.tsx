import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`
        p-0 
        ${isMobile ? "w-full h-full max-h-[100dvh]" : "w-[90vw] max-w-md"}
      `}
      >
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{title}</DialogTitle>
          </DialogHeader>
          <p className="text-[#C4C4CC] text-base my-4">{message}</p>
          <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
            <Button
              variant="outline"
              onClick={onClose}
              className={`
                bg-[#323238] text-white hover:bg-[#29292E]
                ${isMobile ? "w-full py-3 text-base" : ""}
              `}
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className={`
                bg-[#00875F] hover:bg-[#015F43] text-white
                ${isMobile ? "w-full py-3 text-base" : ""}
              `}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
