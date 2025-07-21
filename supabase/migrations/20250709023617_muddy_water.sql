/*
  # Création de la table des compteurs de factures

  1. Nouvelle table
    - `invoice_counters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Référence vers users.id
      - `year` (integer) - Année
      - `counter` (integer) - Compteur pour l'année
      - `created_at` (timestamp) - Date de création
      - `updated_at` (timestamp) - Date de mise à jour

  2. Sécurité
    - Enable RLS sur la table `invoice_counters`
    - Politique pour que les utilisateurs ne puissent accéder qu'à leurs propres compteurs

  3. Contraintes
    - Unique constraint sur (user_id, year) pour éviter les doublons
*/

CREATE TABLE IF NOT EXISTS invoice_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  counter integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year)
);

ALTER TABLE invoice_counters ENABLE ROW LEVEL SECURITY;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS invoice_counters_user_id_year_idx ON invoice_counters(user_id, year);

-- Politique pour que les utilisateurs ne puissent voir que leurs propres compteurs
CREATE POLICY "Users can read own invoice counters"
  ON invoice_counters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leurs propres compteurs
CREATE POLICY "Users can insert own invoice counters"
  ON invoice_counters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres compteurs
CREATE POLICY "Users can update own invoice counters"
  ON invoice_counters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_invoice_counters_updated_at
  BEFORE UPDATE ON invoice_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour obtenir le prochain numéro de facture
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_user_id uuid)
RETURNS text AS $$
DECLARE
  current_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
  next_counter integer;
  invoice_number text;
BEGIN
  -- Insérer ou mettre à jour le compteur pour l'année courante
  INSERT INTO invoice_counters (user_id, year, counter)
  VALUES (p_user_id, current_year, 1)
  ON CONFLICT (user_id, year)
  DO UPDATE SET 
    counter = invoice_counters.counter + 1,
    updated_at = now()
  RETURNING counter INTO next_counter;
  
  -- Générer le numéro de facture
  invoice_number := current_year || '-' || LPAD(next_counter::text, 4, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;