/*
  # Création de la table des articles de facture

  1. Nouvelle table
    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key) - Référence vers invoices.id
      - `description` (text) - Description de l'article
      - `quantity` (decimal) - Quantité
      - `unit_price` (decimal) - Prix unitaire
      - `total` (decimal) - Total de la ligne
      - `sort_order` (integer) - Ordre d'affichage
      - `created_at` (timestamp) - Date de création

  2. Sécurité
    - Enable RLS sur la table `invoice_items`
    - Politique pour que les utilisateurs ne puissent accéder qu'aux articles de leurs factures
*/

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity decimal(10,2) DEFAULT 1,
  unit_price decimal(10,2) DEFAULT 0,
  total decimal(10,2) DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_items_sort_order_idx ON invoice_items(invoice_id, sort_order);

-- Politique pour que les utilisateurs ne puissent voir que les articles de leurs factures
CREATE POLICY "Users can read own invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Politique pour que les utilisateurs puissent insérer des articles dans leurs factures
CREATE POLICY "Users can insert own invoice items"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Politique pour que les utilisateurs puissent mettre à jour les articles de leurs factures
CREATE POLICY "Users can update own invoice items"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Politique pour que les utilisateurs puissent supprimer les articles de leurs factures
CREATE POLICY "Users can delete own invoice items"
  ON invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );