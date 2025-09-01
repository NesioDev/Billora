import React, { memo, useMemo } from 'react';
import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Invoice } from '../types';
import { FileText, Users, Euro, Calendar, CheckCircle, Clock, AlertCircle, XCircle, Download, Loader, Printer, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

const Dashboard: React.FC = () => {
  const { invoices, clients, updateInvoice, loading, error } = useData();
  const { user, getCurrencySymbol } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const currencySymbol = getCurrencySymbol();
  
  // Mémoriser les calculs pour éviter les recalculs inutiles
  const statistics = useMemo(() => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0);
    const pendingAmount = totalAmount - paidAmount;
    
    return { totalAmount, paidAmount, pendingAmount };
  }, [invoices]);

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'sent':
        return <Clock className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'sent':
        return 'Envoyée';
      case 'paid':
        return 'Payée';
      case 'overdue':
        return 'En retard';
      default:
        return 'Inconnu';
    }
  };

  const formatAmount = (amount: number) => {
    if (currencySymbol === 'FCFA') {
      return `${amount.toFixed(0)} ${currencySymbol}`;
    }
    return `${amount.toFixed(2)} ${currencySymbol}`;
  };

  const handleStatusChange = useMemo(() => (invoiceId: string, newStatus: Invoice['status']) => {
    updateInvoice(invoiceId, { status: newStatus });
  }, [updateInvoice]);

  const handleDownloadInvoicePDF = useMemo(() => (invoice: Invoice) => {
    if (!user) return;

    const userInfo = {
      fullName: user.fullName || '',
      companyName: user.companyName || '',
      address: user.address || '',
      contact: user.contact || '',
      paymentInstructions: user.paymentInstructions || ''
    };

    downloadInvoicePDF({
      invoice,
      userInfo,
      currencySymbol
    });
  }, [user, currencySymbol]);

  const handlePrintInvoice = useMemo(() => (invoice: Invoice) => {
    if (!user) return;

    const userInfo = {
      fullName: user.fullName || '',
      companyName: user.companyName || '',
      address: user.address || '',
      contact: user.contact || '',
      paymentInstructions: user.paymentInstructions || ''
    };

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Générer le HTML pour l'impression
    const printHTML = generatePrintHTML(invoice, userInfo, currencySymbol);
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }, [user, currencySymbol]);

  // Fonction pour générer le HTML d'impression
  const generatePrintHTML = (invoice: Invoice, userInfo: any, currencySymbol: string) => {
    const formatAmount = (amount: number) => {
      if (currencySymbol === 'FCFA') {
        return `${Math.round(amount).toLocaleString('fr-FR').replace(/\s/g, ' ')} ${currencySymbol}`;
      }
      return `${amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}`;
    };

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture ${invoice.invoiceNumber}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
          }
          
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-right: 10px;
          }
          
          .invoice-title {
            font-size: 36px;
            font-weight: bold;
            color: #333;
            margin: 0;
          }
          
          .company-info {
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          
          .company-details {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          
          .client-info, .invoice-info {
            flex: 1;
          }
          
          .invoice-info {
            text-align: right;
            margin-left: 40px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          
          .info-line {
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .label {
            color: #666;
            display: inline-block;
            width: 120px;
          }
          
          .value {
            color: #333;
            font-weight: 500;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #ddd;
          }
          
          .items-table th {
            background-color: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #333;
            border-bottom: 2px solid #ddd;
            font-size: 14px;
          }
          
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #fafafa;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .totals {
            margin-left: auto;
            width: 300px;
            margin-bottom: 30px;
          }
          
          .total-line {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          
          .total-line.final {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
            padding-top: 10px;
          }
          
          .payment-instructions {
            margin-top: 40px;
            padding: 20px;
            background-color: #f8f9fa;
            border-left: 4px solid #2563eb;
          }
          
          .payment-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <div class="logo">📄 Billora</div>
          </div>
          <h1 class="invoice-title">FACTURE</h1>
        </div>
        
        <div class="company-info">
          <div class="company-name">${userInfo.fullName}</div>
          <div class="company-details">
            ${userInfo.companyName}<br>
            ${userInfo.address.split(',').join('<br>')}<br>
            ${userInfo.contact}
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="client-info">
            <div class="section-title">Facturé à :</div>
            <div class="info-line"><strong>${invoice.client.name}</strong></div>
            <div class="info-line">${invoice.client.email}</div>
            <div class="info-line">${invoice.client.address}</div>
          </div>
          
          <div class="invoice-info">
            <div class="info-line">
              <span class="label">Numéro :</span>
              <span class="value">${invoice.invoiceNumber}</span>
            </div>
            <div class="info-line">
              <span class="label">Date d'émission :</span>
              <span class="value">${format(new Date(invoice.issueDate), 'dd/MM/yyyy', { locale: fr })}</span>
            </div>
            <div class="info-line">
              <span class="label">Date d'échéance :</span>
              <span class="value">${format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: fr })}</span>
            </div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Quantité</th>
              <th class="text-right">Prix unitaire</th>
              <th class="text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatAmount(item.unitPrice)}</td>
                <td class="text-right">${formatAmount(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-line">
            <span>Sous-total :</span>
            <span>${formatAmount(invoice.subtotal)}</span>
          </div>
          ${invoice.taxRate > 0 ? `
            <div class="total-line">
              <span>TVA (${invoice.taxRate}%) :</span>
              <span>${formatAmount(invoice.taxAmount)}</span>
            </div>
          ` : ''}
          <div class="total-line final">
            <span>TOTAL :</span>
            <span>${formatAmount(invoice.total)}</span>
          </div>
        </div>
        
        ${userInfo.paymentInstructions ? `
          <div class="payment-instructions">
            <div class="payment-title">Instructions de paiement :</div>
            <div>${userInfo.paymentInstructions.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Facture générée le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })} par Billora</p>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">
            {error ? 'Connexion en cours...' : 'Chargement du tableau de bord...'}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md max-w-sm mx-auto">
              <p className="text-yellow-800 text-xs">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-yellow-600 hover:text-yellow-800 underline"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Attention:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Factures</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Clients</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Euro className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
              <p className="text-xs sm:text-sm lg:text-xl xl:text-2xl font-bold text-gray-900 break-all">{formatAmount(statistics.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Payé</p>
              <p className="text-xs sm:text-sm lg:text-xl xl:text-2xl font-bold text-gray-900 break-all">{formatAmount(statistics.paidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Historique des factures</h3>
        </div>
        
        {invoices.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune facture</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première facture.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile view */}
            <div className="block sm:hidden">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="border-b border-gray-200 p-4 space-y-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm font-medium text-gray-900 break-words">{invoice.client.name}</p>
                      <p className="text-xs text-gray-500 break-all">{invoice.client.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 hidden xs:inline">{getStatusLabel(invoice.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Numéro</p>
                      <p className="font-medium text-xs sm:text-sm break-all">{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Montant</p>
                      <p className="font-medium text-xs sm:text-sm break-all">{formatAmount(invoice.total)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-xs sm:text-sm">{format(new Date(invoice.issueDate), 'dd/MM/yy', { locale: fr })}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Statut</p>
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full py-1"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="sent">Envoyée</option>
                        <option value="paid">Payée</option>
                        <option value="overdue">En retard</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.client.name}</div>
                      <div className="text-sm text-gray-500">{invoice.client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(invoice.issueDate), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{getStatusLabel(invoice.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                        className="text-xs lg:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mr-2"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="sent">Envoyée</option>
                        <option value="paid">Payée</option>
                        <option value="overdue">En retard</option>
                      </select>
                      <button
                        onClick={() => handleDownloadInvoicePDF(invoice)}
                        className="inline-flex items-center px-2 lg:px-3 py-1 border border-transparent text-xs font-medium rounded text-green-600 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Download className="h-3 w-3 lg:mr-1" />
                        <span className="hidden lg:inline">PDF</span>
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(invoice)}
                        className="inline-flex items-center px-2 lg:px-3 py-1 border border-transparent text-xs font-medium rounded text-purple-600 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Printer className="h-3 w-3 lg:mr-1" />
                        <span className="hidden lg:inline">Imprimer</span>
                      </button>
                      <button
                        onClick={() => alert('Fonctionnalité d\'envoi par email à implémenter')}
                        className="inline-flex items-center px-2 lg:px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Send className="h-3 w-3 lg:mr-1" />
                        <span className="hidden lg:inline">Email</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Dashboard);