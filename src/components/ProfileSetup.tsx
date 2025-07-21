import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Building, MapPin, Phone, FileText, DollarSign, Mail, Settings } from 'lucide-react';
import EmailSettings from './EmailSettings';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    companyName: user?.companyName || '',
    address: user?.address || '',
    contact: user?.contact || '',
    paymentInstructions: user?.paymentInstructions || '',
    currency: user?.currency || 'EUR'
  });
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emailConfig, setEmailConfig] = useState<any>(null);

  const currencies = [
    { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA' },
    { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'FCFA' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dollar américain', symbol: '$' }
  ];

  // Charger la configuration email au montage
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('billora_email_config');
    if (savedConfig) {
      setEmailConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    onComplete();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailConfigSave = (config: any) => {
    setEmailConfig(config);
    setShowEmailSettings(false);
  };

  const isProfileComplete = user?.fullName && user?.companyName && user?.address && user?.contact && user?.currency;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          {isProfileComplete ? 'Modifier mon profil' : 'Configuration du profil'}
        </h2>
        
        {!isProfileComplete && (
          <div className="bg-blue-50 p-4 rounded-md mb-4 sm:mb-6">
            <p className="text-blue-800 text-sm">
              Complétez votre profil pour commencer à créer des factures professionnelles.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Nom complet *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2 border"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2 border"
                placeholder="Nom de votre entreprise"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Adresse *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2 border"
              placeholder="Adresse complète de votre entreprise"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Contact *
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2 border"
                placeholder="Téléphone, email ou autre contact"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Devise *
              </label>
              <select
                id="currency"
                name="currency"
                required
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2 border"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="paymentInstructions" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Instructions de paiement
            </label>
            <textarea
              id="paymentInstructions"
              name="paymentInstructions"
              rows={4}
              value={formData.paymentInstructions}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2 border resize-none"
              placeholder="Instructions spéciales pour le paiement (optionnel)"
            />
          </div>

          {/* Configuration Email */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Configuration Email</h3>
                <p className="text-sm text-gray-500">
                  Configurez votre email pour envoyer les factures automatiquement
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailSettings(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                {emailConfig ? 'Modifier' : 'Configurer'}
              </button>
            </div>
            
            {emailConfig && (
              <div className="bg-green-50 p-3 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Email configuré : {emailConfig.fromEmail}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            {isProfileComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              {isProfileComplete ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

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

export default ProfileSetup;