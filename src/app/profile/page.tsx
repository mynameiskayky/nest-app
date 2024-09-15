"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, DollarSign, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import LoadingScreen from "@/components/LoadingScreen";
import { useTransactionContext } from "@/contexts/TransactionContext";
import Header from "@/components/Header";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { transactions } = useTransactionContext();
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session && transactions.length > 0) {
      const calculateFinancials = () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter(
            (t) =>
              t.type === "expense" && new Date(t.createdAt) >= firstDayOfMonth
          )
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        setTotalBalance(balance);
        setMonthlyExpenses(expenses);
        setIsLoading(false);
      };

      calculateFinancials();
    }
  }, [session, transactions]);

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Conta excluída",
          description: "Sua conta foi excluída com sucesso.",
          variant: "default",
        });
        await signOut({ redirect: false });
        router.push("/");
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao excluir conta",
          description:
            errorData.message || "Ocorreu um erro ao excluir a conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast({
        title: "Erro ao excluir conta",
        description:
          "Ocorreu um erro ao tentar excluir a conta. Tente novamente.",
        variant: "destructive",
      });
    }
    setIsDeleteModalOpen(false);
  };

  if (!session || isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="container h-screen flex flex-col justify-center mx-auto p-4 space-y-6">
      <Header />
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src="/placeholder.svg?height=80&width=80"
              alt="Foto do perfil"
            />
            <AvatarFallback>
              {session.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{session.user?.name}</CardTitle>
            <CardDescription>{session.user?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full mt-4">
            Editar Perfil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <DollarSign className="h-6 w-6 text-green-500" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Saldo Total</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalBalance)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-blue-500" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Gastos do Mês</p>
              <p className="text-xl font-semibold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(monthlyExpenses)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas sobre suas finanças
              </p>
            </div>
            <Switch
              id="notifications"
              disabled={true}
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="currency">Moeda</Label>
            <Button variant="outline" className="w-40">
              Real (BRL) <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="pt-4">
            <DeleteAccountButton />
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Excluir Conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
