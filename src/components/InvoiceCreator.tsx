import React, { useState, memo, useCallback, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Client, InvoiceItem } from '../types';
import { Plus, Trash2, Download, Send, CheckCircle, Settings, AlertCircle, Loader, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import { sendInvoiceEmail } from '../services/emailService';
import EmailSettings from './EmailSettings';

interface InvoiceCreatorProps {
  onComplete: () => void;
}

const InvoiceCreator: React.FC<InvoiceCreatorProps> = ({ onComplete }) => {
  const { clients, addInvoice, generateInvoiceNumber, loading, error } = useData();
  const { user, getCurrencySymbol } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [emailData, setEmailData] = useState({
    subject: '',
    body: ''
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const currencySymbol = getCurrencySymbol();

  // Charger la configuration email au montage
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('billora_email_config');
    if (savedConfig) {
      setEmailConfig(JSON.parse(savedConfig));
    }
    
    // Générer le numéro de facture
    if (clients.length > 0) {
      generateInvoiceNumber().then(setInvoiceNumber);
    }
  }, []);

  React.useEffect(() => {
    if (clients.length > 0 && !invoiceNumber) {
      generateInvoiceNumber().then(setInvoiceNumber);
    }
  }, [clients.length]);

  const addItem = useCallback(() => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  }, [items]);

  const removeItem = useCallback((id: string) => {
    setItems(items.filter(item => item.id !== id));
  }, [items]);

  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  }, [items]);

  // Mémoriser les calculs
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [items, taxRate]);

  const formatAmount = (amount: number) => {
    if (currencySymbol === 'FCFA') {
      return `${amount.toFixed(0)} ${currencySymbol}`;
    }
    return `${amount.toFixed(2)} ${currencySymbol}`;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setSubmitting(true);

    try {
    const newInvoice = {
      clientId: selectedClient.id,
      client: selectedClient,
      issueDate,
      dueDate,
      items,
      subtotal: calculations.subtotal,
      taxRate,
      taxAmount: calculations.taxAmount,
      total: calculations.total,
      status: 'draft' as const
    };

      const savedInvoice = await addInvoice(newInvoice);
    
      setCreatedInvoice(savedInvoice);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erreur lors de la création de la facture. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedClient, issueDate, dueDate, items, calculations, taxRate, addInvoice]);

  const handleDownloadPDF = () => {
    if (!createdInvoice || !user) return;

    const userInfo = {
      fullName: user.fullName || '',
      companyName: user.companyName || '',
      address: user.address || '',
      contact: user.contact || '',
      paymentInstructions: user.paymentInstructions || ''
    };

    downloadInvoicePDF({
      invoice: createdInvoice,
      userInfo,
      currencySymbol
    });
  };

  const handlePrintInvoice = () => {
    if (!createdInvoice || !user) return;

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
    const printHTML = generatePrintHTML(createdInvoice, userInfo, currencySymbol);
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Fonction pour générer le HTML d'impression
  const generatePrintHTML = (invoice: any, userInfo: any, currencySymbol: string) => {
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

  const handleSendEmail = () => {
    if (!createdInvoice) return;
    
    // Vérifier si la configuration email existe
    if (!emailConfig) {
      setShowEmailSettings(true);
      return;
    }
    
    setEmailData({
      subject: `Votre facture n°${createdInvoice.invoiceNumber}`,
      body: `Bonjour,

Nous vous remercions pour votre confiance et avons le plaisir de vous transmettre votre facture en pièce jointe.

Détails de la facture :
• Numéro : ${createdInvoice.invoiceNumber}
• Date d'émission : ${format(new Date(createdInvoice.issueDate), 'dd/MM/yyyy', { locale: fr })}
• Date d'échéance : ${format(new Date(createdInvoice.dueDate), 'dd/MM/yyyy', { locale: fr })}
• Montant total : ${formatAmount(createdInvoice.total)}

Pour toute question concernant cette facture, n'hésitez pas à nous contacter.

Cordialement,
${user?.fullName || user?.companyName}
${user?.companyName}
${user?.contact}`
    });
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    if (!createdInvoice || !user || !emailConfig) return;

    setSendingEmail(true);
    setEmailResult(null);

    const userInfo = {
      fullName: user.fullName || '',
      companyName: user.companyName || '',
      address: user.address || '',
      contact: user.contact || '',
      paymentInstructions: user.paymentInstructions || ''
    };

    try {
      const result = await sendInvoiceEmail({
        invoice: createdInvoice,
        userInfo,
        currencySymbol,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName,
        customMessage: emailData.body
      });

      setEmailResult(result);

      if (result.success) {
        setTimeout(() => {
          setShowEmailModal(false);
          setShowSuccessModal(false);
          onComplete();
        }, 2000);
      }
    } catch (error) {
      setEmailResult({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    onComplete();
  };

  const handleEmailConfigSave = (config: any) => {
    setEmailConfig(config);
    setShowEmailSettings(false);
    // Relancer l'envoi d'email si on était en train de configurer pour envoyer
    if (createdInvoice) {
      handleSendEmail();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">
            {error ? 'Connexion en cours...' : 'Chargement...'}
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

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun client disponible</h3>
        <p className="mt-1 text-sm text-gray-500">Vous devez d'abord ajouter des clients pour créer une facture.</p>
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Créer une nouvelle facture</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                id="client"
                required
                value={selectedClient?.id || ''}
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value);
                  setSelectedClient(client || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de facture
              </label>
              <input
                type="text"
                id="invoiceNumber"
                value={invoiceNumber || 'Génération...'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date d'émission *
              </label>
              <input
                type="date"
                id="issueDate"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance *
              </label>
              <input
                type="date"
                id="dueDate"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Articles/Services</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
                  {/* Mobile layout */}
                  <div className="block sm:hidden space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description {index === 0 && '*'}
                      </label>
                      <input
                        type="text"
                        required={index === 0}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Description du service/produit"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                         onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix unitaire
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                         onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <p className="text-sm font-medium text-gray-900">{formatAmount(item.total)}</p>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-end">
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description {index === 0 && '*'}
                      </label>
                      <input
                        type="text"
                        required={index === 0}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description du service/produit"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                       onFocus={(e) => e.target.value = ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix unitaire
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                       onFocus={(e) => e.target.value = ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <input
                        type="text"
                        value={formatAmount(item.total)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div className="col-span-1">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Sous-total:</span>
               <span className="text-gray-900">{formatAmount(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="taxRate" className="text-sm font-medium text-gray-700">
                  Taxe (%):
                </label>
                <input
                  type="number"
                  id="taxRate"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                 onFocus={(e) => e.target.value = ''}
                  className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Montant taxe:</span>
                 <span className="text-gray-900">{formatAmount(calculations.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-base font-bold text-gray-900">Total:</span>
               <span className="text-base font-bold text-gray-900">{formatAmount(calculations.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={onComplete}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedClient}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            {submitting ? (
              <div className="flex items-center">
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Création...
              </div>
            ) : (
              'Créer la facture'
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Facture créée avec succès !</h3>
              <p className="text-sm text-gray-500 mb-6">
                Votre facture {createdInvoice?.invoiceNumber} a été créée. Que souhaitez-vous faire maintenant ?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le PDF
                </button>
                
                <button
                  onClick={handlePrintInvoice}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer la facture
                </button>
                
                <button
                  onClick={handleSendEmail}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer par email
                  {!emailConfig && <Settings className="h-3 w-3 ml-1" />}
                </button>
                
                <button
                  onClick={handleCloseSuccess}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Envoyer la facture par email</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="emailTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Destinataire
                </label>
                <input
                  type="email"
                  id="emailTo"
                  value={selectedClient?.email || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">
                  Objet
                </label>
                <input
                  type="text"
                  id="emailSubject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="emailBody"
                  rows={8}
                  value={emailData.body}
                  onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {emailResult && (
                <div className={`p-4 rounded-md ${emailResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {emailResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${emailResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {emailResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  disabled={sendingEmail}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={sendEmail}
                  disabled={sendingEmail || !emailConfig}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings Modal */}
      {showEmailSettings && (
        <EmailSettings
          onSave={handleEmailConfigSave}
          onCancel={() => setShowEmailSettings(false)}
          initialConfig={emailConfig}
        />
      )}
    </div>
  );
};

export default memo(InvoiceCreator);