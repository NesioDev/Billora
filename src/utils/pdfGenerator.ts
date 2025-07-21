import jsPDF from 'jspdf';
import { Invoice } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PDFGeneratorOptions {
  invoice: Invoice;
  userInfo: {
    fullName: string;
    companyName: string;
    address: string;
    contact: string;
    paymentInstructions?: string;
  };
  currencySymbol: string;
}

export const generateInvoicePDF = ({ invoice, userInfo, currencySymbol }: PDFGeneratorOptions) => {
  const doc = new jsPDF();
  
  // Configuration des couleurs
  const primaryBlue = [41, 98, 255]; // Bleu principal
  const darkGray = [51, 51, 51]; // Gris foncé pour le texte
  const lightGray = [128, 128, 128]; // Gris clair
  const tableHeaderGray = [245, 245, 245]; // Gris très clair pour l'en-tête du tableau
  const separatorGray = [220, 220, 220]; // Gris pour les séparateurs
  
  // Helper pour formater les montants avec séparateurs de milliers et points décimaux
  const formatAmount = (amount: number) => {
    if (currencySymbol === 'FCFA') {
      // Pour FCFA, pas de décimales, utiliser des espaces comme séparateurs de milliers
      return `${Math.round(amount).toLocaleString('fr-FR').replace(/\s/g, ' ')} ${currencySymbol}`;
    }
    // Pour les autres devises, utiliser des points pour les décimales et des espaces pour les milliers
    const formattedNumber = amount.toFixed(2).replace('.', ',');
    const parts = formattedNumber.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${parts.join(',')} ${currencySymbol}`;
  };

  // Fonction pour dessiner le logo Billora proprement
  const drawBilloraLogo = (x: number, y: number) => {
    // Icône de document
    doc.setFillColor(...primaryBlue);
    doc.roundedRect(x, y, 12, 16, 1, 1, 'F');
    
    // Coin plié du document
    doc.setFillColor(255, 255, 255);
    doc.triangle(x + 9, y, x + 12, y, x + 12, y + 3, 'F');
    
    // Lignes dans le document
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 2, y + 5, 6, 0.8, 'F');
    doc.rect(x + 2, y + 7, 4, 0.8, 'F');
    
    // Check mark vert
    doc.setFillColor(34, 197, 94);
    doc.circle(x + 6, y + 12, 2.5, 'F');
    
    // Dessiner le check blanc
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    doc.line(x + 4.5, y + 12, x + 5.5, y + 13);
    doc.line(x + 5.5, y + 13, x + 7.5, y + 11);
    
    // Texte "Billora"
    doc.setTextColor(...primaryBlue);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Billora', x + 18, y + 12);
  };

  // === EN-TÊTE ===
  // Logo Billora à gauche
  drawBilloraLogo(20, 20);
  
  // Titre "FACTURE" à droite
  doc.setTextColor(...darkGray);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 120, 35);

  // === INFORMATIONS ENTREPRISE (Gauche) ===
  let yPos = 55;
  doc.setTextColor(...darkGray);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(userInfo.fullName, 20, yPos);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  
  // Adresse sur plusieurs lignes si nécessaire
  const addressLines = userInfo.address.split(',').map(line => line.trim());
  addressLines.forEach(line => {
    if (line) {
      doc.text(line, 20, yPos);
      yPos += 5;
    }
  });
  
  // Contact
  doc.text(userInfo.contact, 20, yPos);

  // === INFORMATIONS FACTURE (Droite) ===
  yPos = 55;
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  
  // Labels
  doc.text('Impour n.', 120, yPos);
  doc.text('Date d\'émission:', 120, yPos + 8);
  doc.text('Date d\'échéance:', 120, yPos + 16);
  
  // Valeurs
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, 155, yPos);
  doc.text(format(new Date(invoice.issueDate), 'd MMMM yyyy', { locale: fr }), 155, yPos + 8);
  doc.text(format(new Date(invoice.dueDate), 'd MMMM yyyy', { locale: fr }), 155, yPos + 16);

  // === LIGNE DE SÉPARATION ===
  yPos = 90;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);

  // === SECTION CLIENT ===
  yPos = 105;
  doc.setTextColor(...darkGray);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, yPos);
  
  // Informations client à droite
  const clientName = invoice.client.name.toUpperCase();
  doc.text(`Client ${clientName}`, 120, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text(invoice.client.email, 120, yPos);

  // === TABLEAU DES ARTICLES ===
  yPos = 130;
  
  // Définition des positions des colonnes
  const tableX = 20;
  const tableWidth = 170;
  const col1X = tableX; // Description
  const col2X = tableX + 85; // Quantité
  const col3X = tableX + 115; // Prix unitaire
  const col4X = tableX + 145; // Montant
  const tableEndX = tableX + tableWidth;
  
  // En-tête du tableau avec fond gris
  doc.setFillColor(...tableHeaderGray);
  doc.rect(tableX, yPos - 3, tableWidth, 10, 'F');
  
  // Bordures du tableau principal
  doc.setDrawColor(...separatorGray);
  doc.setLineWidth(0.5);
  doc.rect(tableX, yPos - 3, tableWidth, 10);
  
  // Séparateurs verticaux dans l'en-tête
  doc.setLineWidth(0.3);
  doc.line(col2X, yPos - 3, col2X, yPos + 7); // Séparateur après Description
  doc.line(col3X, yPos - 3, col3X, yPos + 7); // Séparateur après Quantité
  doc.line(col4X, yPos - 3, col4X, yPos + 7); // Séparateur après Prix unitaire
  
  // Textes de l'en-tête
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', col1X + 5, yPos + 2);
  doc.text('Quantité', col2X + 5, yPos + 2);
  doc.text('Prix unitaire', col3X + 5, yPos + 2);
  doc.text('Montant', col4X + 5, yPos + 2);

  // Lignes des articles
  yPos += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  invoice.items.forEach((item, index) => {
    const rowHeight = 12;
    
    // Fond alterné pour les lignes
    if (index % 2 === 1) {
      doc.setFillColor(252, 252, 252);
      doc.rect(tableX, yPos - 3, tableWidth, rowHeight, 'F');
    }
    
    // Bordures horizontales des cellules
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.2);
    doc.rect(tableX, yPos - 3, tableWidth, rowHeight);
    
    // Séparateurs verticaux pour chaque ligne
    doc.setLineWidth(0.2);
    doc.line(col2X, yPos - 3, col2X, yPos + 9); // Séparateur après Description
    doc.line(col3X, yPos - 3, col3X, yPos + 9); // Séparateur après Quantité
    doc.line(col4X, yPos - 3, col4X, yPos + 9); // Séparateur après Prix unitaire
    
    doc.setTextColor(...darkGray);
    
    // Description (avec gestion du texte long)
    let description = item.description;
    if (description.length > 30) {
      description = description.substring(0, 27) + '...';
    }
    doc.text(description, col1X + 5, yPos + 3);
    
    // Quantité (centré dans sa colonne)
    const qtyText = item.quantity.toString();
    const qtyWidth = doc.getTextWidth(qtyText);
    const qtyColWidth = col3X - col2X;
    doc.text(qtyText, col2X + (qtyColWidth - qtyWidth) / 2, yPos + 3);
    
    // Prix unitaire (aligné à droite dans sa colonne)
    const unitPriceText = formatAmount(item.unitPrice);
    const unitPriceWidth = doc.getTextWidth(unitPriceText);
    doc.text(unitPriceText, col4X - 5 - unitPriceWidth, yPos + 3);
    
    // Montant total (aligné à droite dans sa colonne)
    const totalText = formatAmount(item.total);
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, tableEndX - 5 - totalWidth, yPos + 3);
    
    yPos += rowHeight;
  });

  // === TOTAUX ===
  yPos += 10;
  
  // Ligne de séparation avant les totaux
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(100, yPos, 190, yPos);
  
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  
  // Sous-total
  doc.text('Sous-total', 130, yPos);
  const subtotalText = formatAmount(invoice.subtotal);
  const subtotalWidth = doc.getTextWidth(subtotalText);
  doc.setTextColor(...darkGray);
  doc.text(subtotalText, 185 - subtotalWidth, yPos);
  
  // TVA si applicable
  if (invoice.taxRate > 0) {
    yPos += 8;
    doc.setTextColor(...lightGray);
    doc.text(`TVA (${invoice.taxRate}%)`, 130, yPos);
    const taxText = formatAmount(invoice.taxAmount);
    const taxWidth = doc.getTextWidth(taxText);
    doc.setTextColor(...darkGray);
    doc.text(taxText, 185 - taxWidth, yPos);
  }
  
  // Total final
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text('Total', 130, yPos);
  const finalTotalText = formatAmount(invoice.total);
  const finalTotalWidth = doc.getTextWidth(finalTotalText);
  doc.text(finalTotalText, 185 - finalTotalWidth, yPos);

  // === INSTRUCTIONS DE PAIEMENT ===
  if (userInfo.paymentInstructions && userInfo.paymentInstructions.trim()) {
    yPos += 25;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    
    const instructions = userInfo.paymentInstructions.split('\n');
    instructions.forEach((line, index) => {
      if (line.trim()) {
        doc.text(line.trim(), 20, yPos + (index * 5));
      }
    });
  }

  // === PIED DE PAGE ===
  const pageHeight = doc.internal.pageSize.height;
  
  // Logo plus petit en bas
  drawBilloraLogo(20, pageHeight - 25);
  
  // Date de génération
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  doc.text(`Générée le ${format(new Date(), 'dd.MM.yyyy à HH:mm', { locale: fr })}`, 20, pageHeight - 8);
  
  return doc;
};

export const downloadInvoicePDF = (options: PDFGeneratorOptions) => {
  const doc = generateInvoicePDF(options);
  doc.save(`Facture_${options.invoice.invoiceNumber}.pdf`);
};