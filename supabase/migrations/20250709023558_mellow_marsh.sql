/*
  # Création de la table des factures

  1. Nouvelle table
    - `invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Référence vers users.id
      - `client_id` (uuid, foreign key) - Référence vers clients.id
      - `invoice_number` (text, unique) - Numéro de facture
      - `issue_date` (date) - Date d'émission
      - `due_date` (date) - Date d'échéance
      - `subtotal` (decimal) - Sous-total
      - `tax_rate` (decimal) - Taux de taxe
      - `tax_amount` (decimal) - Montant de la taxe
      - `total` (decimal) - Total
      - `status` (text) - Statut de la facture
      - `created_at` (timestamp) - Date de création
      - `updated_at` (timestamp) - Date de mise à jour

  2. Sécurité
    - Enable RLS sur la table `invoices`
    - Politique pour que les utilisateurs ne puissent accéder qu'à leurs propres factures
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  invoice_number text UNIQUE NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  subtotal decimal(10,2) DEFAULT 0,
  tax_rate decimal(5,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  total decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON invoices(client_id);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_issue_date_idx ON invoices(issue_date);

-- Politique pour que les utilisateurs ne puissent voir que leurs propres factures
CREATE POLICY "Users can read own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leurs propres factures
CREATE POLICY "Users can insert own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres factures
CREATE POLICY "Users can update own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent supprimer leurs propres factures
CREATE POLICY "Users can delete own invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();