import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.1.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface SendEmailRequest {
  invoice: any
  userInfo: any
  currencySymbol: string
  fromEmail: string
  fromName: string
  customMessage?: string
}

// Initialiser Resend avec la nouvelle clé API
const resend = new Resend("re_S97fNDKE_3iXjEsFjHN1PEBEiUvTNoWuF")

// Validation du format email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Générer le contenu HTML de l'email
const generateEmailHTML = (invoice: any, userInfo: any, customMessage?: string): string => {
  const message = customMessage || `
Bonjour,

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
  `

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture ${invoice.invoiceNumber}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #2563eb;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .invoice-details {
                background-color: #f1f5f9;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
            }
            .invoice-details h3 {
                margin-top: 0;
                color: #2563eb;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
            }
            .detail-label {
                font-weight: 600;
                color: #64748b;
            }
            .detail-value {
                color: #1e293b;
            }
            .message {
                white-space: pre-line;
                margin: 20px 0;
                line-height: 1.8;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                font-size: 14px;
                color: #64748b;
                text-align: center;
            }
            .company-info {
                margin-top: 20px;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">📄 Billora</div>
                <h2>Facture ${invoice.invoiceNumber}</h2>
            </div>
            
            <div class="invoice-details">
                <h3>Détails de la facture</h3>
                <div class="detail-row">
                    <span class="detail-label">Numéro :</span>
                    <span class="detail-value">${invoice.invoiceNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date d'émission :</span>
                    <span class="detail-value">${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date d'échéance :</span>
                    <span class="detail-value">${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Montant total :</span>
                    <span class="detail-value"><strong>${invoice.total.toLocaleString('fr-FR')} ${invoice.total >= 1000 ? 'FCFA' : '€'}</strong></span>
                </div>
            </div>
            
            <div class="message">${message}</div>
            
            <div class="company-info">
                <strong>${userInfo.companyName}</strong><br>
                ${userInfo.address}<br>
                ${userInfo.contact}
            </div>
            
            <div class="footer">
                <p>Cet email a été généré automatiquement par Billora.</p>
                <p>Merci de ne pas répondre directement à cet email.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

// Générer le PDF de la facture
const generateInvoicePDF = (invoice: any, userInfo: any, currencySymbol: string): Uint8Array => {
  // Simulation de génération PDF - dans une vraie implémentation,
  // vous utiliseriez une bibliothèque comme jsPDF ou Puppeteer
  const pdfContent = `
    FACTURE ${invoice.invoiceNumber}
    
    De: ${userInfo.companyName}
    ${userInfo.address}
    ${userInfo.contact}
    
    À: ${invoice.client.name}
    ${invoice.client.email}
    ${invoice.client.address}
    
    Date d'émission: ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
    Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
    
    Articles:
    ${invoice.items.map((item: any) => 
      `- ${item.description}: ${item.quantity} x ${item.unitPrice} = ${item.total} ${currencySymbol}`
    ).join('\n')}
    
    Sous-total: ${invoice.subtotal} ${currencySymbol}
    ${invoice.taxRate > 0 ? `TVA (${invoice.taxRate}%): ${invoice.taxAmount} ${currencySymbol}` : ''}
    TOTAL: ${invoice.total} ${currencySymbol}
  `
  
  return new TextEncoder().encode(pdfContent)
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Méthode non autorisée" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const requestData: SendEmailRequest = await req.json()
    const { invoice, userInfo, currencySymbol, fromEmail, fromName, customMessage } = requestData

    // Validation des données
    if (!invoice || !userInfo || !fromEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Données manquantes" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Validation des emails
    if (!isValidEmail(fromEmail)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Adresse email expéditeur invalide" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!isValidEmail(invoice.client.email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Adresse email destinataire invalide" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Générer le PDF de la facture
    const pdfBuffer = generateInvoicePDF(invoice, userInfo, currencySymbol)
    const pdfBase64 = btoa(String.fromCharCode(...pdfBuffer))

    // Envoyer l'email avec Resend
    const emailResult = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [invoice.client.email],
      subject: `Votre facture n°${invoice.invoiceNumber}`,
      html: generateEmailHTML(invoice, userInfo, customMessage),
      text: customMessage || `
Bonjour,

Veuillez trouver ci-joint votre facture n°${invoice.invoiceNumber}.

Détails :
- Date d'émission : ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
- Date d'échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
- Montant total : ${invoice.total.toLocaleString('fr-FR')} ${currencySymbol}

Cordialement,
${userInfo.fullName}
${userInfo.companyName}
      `,
      attachments: [
        {
          filename: `Facture_${invoice.invoiceNumber}.pdf`,
          content: pdfBase64,
          content_type: 'application/pdf',
        },
      ],
    })

    if (emailResult.error) {
      throw new Error(emailResult.error.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email envoyé avec succès via Resend",
        messageId: emailResult.data?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )

  } catch (error) {
    console.error("Erreur dans send-invoice-email:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erreur lors de l'envoi de l'email: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})