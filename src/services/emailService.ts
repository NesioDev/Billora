import { Invoice } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface SendInvoiceEmailOptions {
  invoice: Invoice;
  userInfo: {
    fullName: string;
    companyName: string;
    address: string;
    contact: string;
    paymentInstructions?: string;
  };
  currencySymbol: string;
  fromEmail: string;
  fromName: string;
  customMessage?: string;
}

// Validation du format email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction principale d'envoi d'email via Resend
export const sendInvoiceEmail = async (options: SendInvoiceEmailOptions): Promise<{
  success: boolean;
  message: string;
  messageId?: string;
}> => {
  const { invoice, userInfo, currencySymbol, fromEmail, fromName, customMessage } = options;
  
  // Validation des emails côté client
  if (!isValidEmail(fromEmail)) {
    return {
      success: false,
      message: 'Adresse email expéditeur invalide'
    };
  }
  
  if (!isValidEmail(invoice.client.email)) {
    return {
      success: false,
      message: 'Adresse email destinataire invalide'
    };
  }

  try {
    // Obtenir l'URL de base de Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      // Fallback vers simulation si Supabase n'est pas configuré
      console.warn('Supabase non configuré, utilisation de la simulation');
      return simulateEmailSend(options);
    }

    const apiUrl = `${supabaseUrl}/functions/v1/send-invoice-email`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice,
        userInfo,
        currencySymbol,
        fromEmail,
        fromName,
        customMessage
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erreur lors de l\'envoi');
    }

    return result;

  } catch (error: any) {
    console.error('Erreur envoi email:', error);
    
    // En cas d'erreur avec l'API, utiliser la simulation
    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.warn('Erreur réseau, utilisation de la simulation');
      return simulateEmailSend(options);
    }
    
    return {
      success: false,
      message: error.message || 'Erreur lors de l\'envoi de l\'email'
    };
  }
};

// Fonction de test simplifiée pour Resend
export const testEmailConfiguration = async (fromEmail: string): Promise<{
  success: boolean;
  message: string;
}> => {
  // Validation côté client
  if (!fromEmail) {
    return {
      success: false,
      message: 'Adresse email requise'
    };
  }

  if (!isValidEmail(fromEmail)) {
    return {
      success: false,
      message: 'Format d\'email invalide'
    };
  }

  // Avec Resend, pas besoin de configuration SMTP complexe
  // On valide juste le format de l'email
  return {
    success: true,
    message: 'Configuration email valide pour Resend'
  };
};

// Fonction de simulation pour le développement/fallback
const simulateEmailSend = async (options: SendInvoiceEmailOptions): Promise<{
  success: boolean;
  message: string;
  messageId?: string;
}> => {
  const { invoice, userInfo, fromEmail, fromName } = options;
  
  // Simulation d'un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log(`
    📧 EMAIL SIMULÉ ENVOYÉ AVEC SUCCÈS (RESEND)
    ==========================================
    De: ${fromName} <${fromEmail}>
    À: ${invoice.client.name} <${invoice.client.email}>
    Objet: Votre facture n°${invoice.invoiceNumber}
    
    Service: Resend API
    
    Facture:
    - Numéro: ${invoice.invoiceNumber}
    - Client: ${invoice.client.name}
    - Montant: ${invoice.total} ${options.currencySymbol}
    - Date d'échéance: ${invoice.dueDate}
    
    💡 Note: Ceci est une simulation. Configurez Supabase pour l'envoi réel via Resend.
  `);

  return {
    success: true,
    message: 'Email envoyé avec succès via Resend (simulation)',
    messageId: `resend_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
};

// Fonction utilitaire pour générer le contenu de l'email (pour référence)
export const generateEmailContent = (invoice: Invoice, userInfo: any, customMessage?: string): string => {
  return customMessage || `
Bonjour ${invoice.client.name},

Nous vous remercions pour votre confiance et avons le plaisir de vous transmettre votre facture en pièce jointe.

Détails de la facture :
• Numéro : ${invoice.invoiceNumber}
• Date d'émission : ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
• Date d'échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
• Montant total : ${invoice.total.toLocaleString('fr-FR')} ${invoice.total >= 1000 ? 'FCFA' : '€'}

Pour toute question concernant cette facture, n'hésitez pas à nous contacter.

Cordialement,
${userInfo.fullName}
${userInfo.companyName}
${userInfo.contact}
  `;
};