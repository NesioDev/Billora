import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Invoice, InvoiceItem } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface DataContextType {
  clients: Client[];
  invoices: Invoice[];
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'userId'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  generateInvoiceNumber: () => Promise<string>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    } else {
      setClients([]);
      setInvoices([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Charger les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('Error loading clients:', clientsError);
      } else {
        const formattedClients: Client[] = clientsData.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          address: client.address,
          userId: client.user_id
        }));
        setClients(formattedClients);
      }

      // Charger les factures avec les clients et les articles
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients!inner(*),
          invoice_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        console.error('Error loading invoices:', invoicesError);
      } else {
        const formattedInvoices: Invoice[] = invoicesData.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          clientId: invoice.client_id,
          client: {
            id: invoice.clients.id,
            name: invoice.clients.name,
            email: invoice.clients.email,
            address: invoice.clients.address,
            userId: invoice.clients.user_id
          },
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          items: invoice.invoice_items.map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unit_price),
            total: parseFloat(item.total)
          })),
          subtotal: parseFloat(invoice.subtotal),
          taxRate: parseFloat(invoice.tax_rate),
          taxAmount: parseFloat(invoice.tax_amount),
          total: parseFloat(invoice.total),
          status: invoice.status,
          userId: invoice.user_id,
          createdAt: invoice.created_at,
          updatedAt: invoice.updated_at
        }));
        setInvoices(formattedInvoices);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'userId'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: clientData.name,
          email: clientData.email,
          address: clientData.address
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding client:', error);
        throw error;
      }

      const newClient: Client = {
        id: data.id,
        name: data.name,
        email: data.email,
        address: data.address,
        userId: data.user_id
      };

      setClients(prev => [newClient, ...prev]);
    } catch (error) {
      console.error('Error in addClient:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          email: clientData.email,
          address: clientData.address
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      ));
    } catch (error) {
      console.error('Error in updateClient:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }

      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error in deleteClient:', error);
      throw error;
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .rpc('get_next_invoice_number', { p_user_id: user.id });

      if (error) {
        console.error('Error generating invoice number:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in generateInvoiceNumber:', error);
      // Fallback en cas d'erreur
      const currentYear = new Date().getFullYear();
      const userInvoices = invoices.filter(i => i.invoiceNumber.startsWith(`${currentYear}-`));
      const nextNumber = userInvoices.length + 1;
      return `${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Invoice> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const invoiceNumber = await generateInvoiceNumber();

      // Créer la facture
      const { data: invoiceResult, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: invoiceData.clientId,
          invoice_number: invoiceNumber,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          subtotal: invoiceData.subtotal,
          tax_rate: invoiceData.taxRate,
          tax_amount: invoiceData.taxAmount,
          total: invoiceData.total,
          status: invoiceData.status
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        throw invoiceError;
      }

      // Créer les articles de la facture
      const itemsToInsert = invoiceData.items.map((item, index) => ({
        invoice_id: invoiceResult.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
        sort_order: index
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError);
        throw itemsError;
      }

      const newInvoice: Invoice = {
        id: invoiceResult.id,
        invoiceNumber: invoiceResult.invoice_number,
        clientId: invoiceResult.client_id,
        client: invoiceData.client,
        issueDate: invoiceResult.issue_date,
        dueDate: invoiceResult.due_date,
        items: invoiceData.items,
        subtotal: parseFloat(invoiceResult.subtotal),
        taxRate: parseFloat(invoiceResult.tax_rate),
        taxAmount: parseFloat(invoiceResult.tax_amount),
        total: parseFloat(invoiceResult.total),
        status: invoiceResult.status,
        userId: invoiceResult.user_id,
        createdAt: invoiceResult.created_at,
        updatedAt: invoiceResult.updated_at
      };

      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    } catch (error) {
      console.error('Error in addInvoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: invoiceData.status,
          subtotal: invoiceData.subtotal,
          tax_rate: invoiceData.taxRate,
          tax_amount: invoiceData.taxAmount,
          total: invoiceData.total
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating invoice:', error);
        throw error;
      }

      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...invoiceData } : invoice
      ));
    } catch (error) {
      console.error('Error in updateInvoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }

      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      clients,
      invoices,
      loading,
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoiceNumber
    }}>
      {children}
    </DataContext.Provider>
  );
};