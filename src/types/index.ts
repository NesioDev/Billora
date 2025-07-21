export interface User {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  address?: string;
  contact?: string;
  paymentInstructions?: string;
  currency?: 'XAF' | 'XOF' | 'EUR' | 'USD';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  userId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client: Client;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}