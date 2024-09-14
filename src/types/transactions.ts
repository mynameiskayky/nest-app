export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  type: "income" | "expense";
  createdAt: string;
}

export interface TransactionFormData {
  title: string;
  amount: number;
  category: string | null;
  type: "income" | "expense";
  date: Date;
}
