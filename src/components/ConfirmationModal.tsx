import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2C2C2E] border-[#3A3A3C] rounded-2xl w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-[#C4C4CC]">{message}</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#323238] text-white hover:bg-[#29292E]"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#00875F] hover:bg-[#015F43] text-white"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
