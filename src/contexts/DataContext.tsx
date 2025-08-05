import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMemo, useCallback } from 'react';
import { Client, Invoice, InvoiceItem } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// Timeout pour les requêtes de données (15 secondes)
const DATA_TIMEOUT = 15000;

// Fonction utilitaire pour ajouter un timeout aux requêtes
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Requête trop longue')), timeoutMs)
    )
  ]);
};

interface DataContextType {
  clients: Client[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    if (isAuthenticated && user) {
      if (!dataLoaded) {
        loadData(mounted);
      }
    } else {
      setClients([]);
      setInvoices([]);
      setDataLoaded(false);
      setError(null);
      setLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  const loadData = async (mounted: boolean = true) => {
    if (!user || !mounted) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Timeout de sécurité global
      const timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('Timeout de chargement des données - mode offline');
          setError('Chargement lent - certaines données peuvent être indisponibles');
          setLoading(false);
        }
      }, DATA_TIMEOUT);
      
      // Charger les données en parallèle pour améliorer les performances
      const clientsPromise = supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        
      const invoicesPromise = supabase
          .from('invoices')
          .select(`
            *,
            clients!inner(*),
            invoice_items(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
      const [clientsResult, invoicesResult] = await Promise.all([
        withTimeout(clientsPromise, DATA_TIMEOUT),
        withTimeout(invoicesPromise, DATA_TIMEOUT)
      ]);
      
      clearTimeout(timeoutId);
      
      if (!mounted) return;

      // Traitement des clients
      if (!clientsResult.error && clientsResult.data) {
        const formattedClients: Client[] = clientsResult.data.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          address: client.address,
          userId: client.user_id
        }));
        setClients(formattedClients);
      } else if (clientsResult.error) {
        console.error('Erreur chargement clients:', clientsResult.error);
        setError('Erreur de chargement des clients');
        setClients([]); // Fallback vers liste vide
      }

      // Traitement des factures
      if (!invoicesResult.error && invoicesResult.data) {
        const formattedInvoices: Invoice[] = invoicesResult.data.map(invoice => ({
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
      } else if (invoicesResult.error) {
        console.error('Erreur chargement factures:', invoicesResult.error);
        setError('Erreur de chargement des factures');
        setInvoices([]); // Fallback vers liste vide
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      if (mounted) {
        setError(error instanceof Error ? error.message : 'Erreur de chargement des données');
        // En cas d'erreur, on garde les données existantes mais on arrête le loading
        setDataLoaded(true);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'userId'>) => {
    if (!user) return;

    try {
      const insertPromise = supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: clientData.name,
          email: clientData.email,
          address: clientData.address
        })
        .select()
        .single();
        
      const { data, error } = await withTimeout(insertPromise, DATA_TIMEOUT);

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
  }, [user]);

  const updateClient = useCallback(async (id: string, clientData: Partial<Client>) => {
    try {
      const updatePromise = supabase
        .from('clients')
        .update({
          name: clientData.name,
          email: clientData.email,
          address: clientData.address
        })
        .eq('id', id);
        
      const { error } = await withTimeout(updatePromise, DATA_TIMEOUT);

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
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const deletePromise = supabase
        .from('clients')
        .delete()
        .eq('id', id);
        
      const { error } = await withTimeout(deletePromise, DATA_TIMEOUT);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }

      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error in deleteClient:', error);
      throw error;
    }
  }, []);

  const generateInvoiceNumber = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const rpcPromise = supabase
        .rpc('get_next_invoice_number', { p_user_id: user.id });
        
      const { data, error } = await withTimeout(rpcPromise, DATA_TIMEOUT);

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
  }, [user, invoices]);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Invoice> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const invoiceNumber = await generateInvoiceNumber();

      // Créer la facture
      const invoicePromise = supabase
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
        
      const { data: invoiceResult, error: invoiceError } = await withTimeout(invoicePromise, DATA_TIMEOUT);

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

      const itemsPromise = supabase
        .from('invoice_items')
        .insert(itemsToInsert);
        
      const { error: itemsError } = await withTimeout(itemsPromise, DATA_TIMEOUT);

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
  }, [user, generateInvoiceNumber]);

  const updateInvoice = useCallback(async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      const updatePromise = supabase
        .from('invoices')
        .update({
          status: invoiceData.status,
          subtotal: invoiceData.subtotal,
          tax_rate: invoiceData.taxRate,
          tax_amount: invoiceData.taxAmount,
          total: invoiceData.total
        })
        .eq('id', id);
        
      const { error } = await withTimeout(updatePromise, DATA_TIMEOUT);

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
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      const deletePromise = supabase
        .from('invoices')
        .delete()
        .eq('id', id);
        
      const { error } = await withTimeout(deletePromise, DATA_TIMEOUT);

      if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }

      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      throw error;
    }
  }, []);

  // Mémoriser les valeurs du contexte pour éviter les re-renders inutiles
  const contextValue = useMemo(() => ({
    clients,
    invoices,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceNumber
  }), [
    clients,
    invoices,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceNumber
  ]);
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};