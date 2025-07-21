import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, User, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { testEmailConfiguration } from '../services/emailService';

interface EmailSettingsProps {
  onSave: (config: any) => void;
  onCancel: () => void;
  initialConfig?: any;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ onSave, onCancel, initialConfig }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    fromEmail: initialConfig?.fromEmail || user?.email || '',
    fromName: initialConfig?.fromName || user?.companyName || user?.fullName || ''
  });
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testEmailConfiguration(config.fromEmail);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors du test de configuration'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Test de la configuration avant sauvegarde
    try {
      const testResult = await testEmailConfiguration(config.fromEmail);
      if (!testResult.success) {
        setTestResult(testResult);
        setSaving(false);
        return;
      }
      
      // Sauvegarder la configuration
      localStorage.setItem('billora_email_config', JSON.stringify(config));
      onSave(config);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors de la sauvegarde'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div className="relative top-4 sm:top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-medium text-gray-900 mb-6">Configuration Email avec Resend</h3>
        
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Service Resend intégré
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Billora utilise maintenant Resend pour l'envoi d'emails :</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Configuration simplifiée - plus besoin de SMTP</li>
                  <li>Livraison fiable et rapide</li>
                  <li>Gestion automatique des bounces et spam</li>
                  <li>Statistiques d'envoi intégrées</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email expéditeur *
            </label>
            <input
              type="email"
              id="fromEmail"
              name="fromEmail"
              required
              value={config.fromEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="votre-email@votre-domaine.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Utilisez une adresse email de votre domaine pour une meilleure délivrabilité
            </p>
          </div>

          <div>
            <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Nom expéditeur *
            </label>
            <input
              type="text"
              id="fromName"
              name="fromName"
              required
              value={config.fromName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Votre nom ou nom de l'entreprise"
            />
          </div>

          {/* Test de configuration */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !config.fromEmail}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? 'Test en cours...' : 'Tester la configuration'}
            </button>

            {testResult && (
              <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !config.fromEmail || !config.fromName}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailSettings;