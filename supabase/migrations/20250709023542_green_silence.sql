/*
  # Création de la table des utilisateurs

  1. Nouvelle table
    - `users`
      - `id` (uuid, primary key) - Lié à auth.users
      - `email` (text, unique) - Email de l'utilisateur
      - `full_name` (text) - Nom complet
      - `company_name` (text) - Nom de l'entreprise
      - `address` (text) - Adresse complète
      - `contact` (text) - Informations de contact
      - `payment_instructions` (text) - Instructions de paiement
      - `currency` (text) - Devise préférée
      - `created_at` (timestamp) - Date de création
      - `updated_at` (timestamp) - Date de mise à jour

  2. Sécurité
    - Enable RLS sur la table `users`
    - Politique pour que les utilisateurs ne puissent accéder qu'à leurs propres données
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  address text,
  contact text,
  payment_instructions text,
  currency text DEFAULT 'EUR' CHECK (currency IN ('XAF', 'XOF', 'EUR', 'USD')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne puissent voir que leurs propres données
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent insérer leurs propres données
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres données
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();