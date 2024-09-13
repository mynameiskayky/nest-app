export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  createdAt: string;
}

export interface TransactionFormData {
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}
