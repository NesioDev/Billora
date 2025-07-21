import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          address: string | null;
          contact: string | null;
          payment_instructions: string | null;
          currency: 'XAF' | 'XOF' | 'EUR' | 'USD';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          address?: string | null;
          contact?: string | null;
          payment_instructions?: string | null;
          currency?: 'XAF' | 'XOF' | 'EUR' | 'USD';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          address?: string | null;
          contact?: string | null;
          payment_instructions?: string | null;
          currency?: 'XAF' | 'XOF' | 'EUR' | 'USD';
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          status: 'draft' | 'sent' | 'paid' | 'overdue';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          status?: 'draft' | 'sent' | 'paid' | 'overdue';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          invoice_number?: string;
          issue_date?: string;
          due_date?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          status?: 'draft' | 'sent' | 'paid' | 'overdue';
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      invoice_counters: {
        Row: {
          id: string;
          user_id: string;
          year: number;
          counter: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          year: number;
          counter?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          year?: number;
          counter?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_next_invoice_number: {
        Args: { p_user_id: string };
        Returns: string;
      };
    };
  };
}