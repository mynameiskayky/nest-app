export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  createdAt: string;
}

export type TransactionFormData = Omit<Transaction, "id" | "createdAt">;
