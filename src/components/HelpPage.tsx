import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  PlusCircle, 
  Settings, 
  Download, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  User, 
  Building, 
  MapPin, 
  Phone, 
  DollarSign, 
  Mail,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Premiers pas',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Bienvenue sur Billora !</h3>
            <p className="text-blue-800 mb-4">
              Billora est votre solution complète pour créer et gérer vos factures professionnelles. 
              Suivez ce guide pour commencer rapidement.
            </p>
            <div className="flex items-center space-x-2 text-blue-700">
              <CheckCircle className="h-5 w-5" />
              <span>Interface simple et intuitive</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700 mt-2">
              <CheckCircle className="h-5 w-5" />
              <span>Génération PDF automatique</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700 mt-2">
              <CheckCircle className="h-5 w-5" />
              <span>Envoi d'emails intégré</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold">1. Configurez votre profil</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Commencez par renseigner vos informations d'entreprise pour personnaliser vos factures.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <img 
                  src="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=400" 
                  alt="Configuration du profil" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600">
                  Remplissez vos informations : nom, entreprise, adresse, contact et devise.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold">2. Ajoutez vos clients</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Créez votre base de données clients pour faciliter la création de factures.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <img 
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400" 
                  alt="Gestion des clients" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600">
                  Gérez facilement vos contacts clients avec toutes leurs informations.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold">3. Créez vos factures</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Générez des factures professionnelles en quelques clics avec calculs automatiques.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <img 
                  src="https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400" 
                  alt="Création de factures" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600">
                  Interface intuitive pour créer des factures détaillées rapidement.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Send className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold">4. Envoyez et suivez</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Envoyez vos factures par email et suivez leur statut en temps réel.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <img 
                  src="https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400" 
                  alt="Envoi et suivi" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600">
                  Tableau de bord complet pour suivre toutes vos factures.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'profile-setup',
      title: 'Configuration du profil',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Configurer votre profil d'entreprise</h3>
            <p className="text-gray-600 mb-6">
              Votre profil apparaîtra sur toutes vos factures. Assurez-vous que toutes les informations sont correctes et professionnelles.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Nom complet</h4>
                  <p className="text-gray-600 text-sm">
                    Votre nom tel qu'il apparaîtra sur les factures. Utilisez votre nom professionnel complet.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Nom de l'entreprise</h4>
                  <p className="text-gray-600 text-sm">
                    Le nom officiel de votre entreprise ou votre nom commercial.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Adresse complète</h4>
                  <p className="text-gray-600 text-sm">
                    Adresse physique de votre entreprise (rue, ville, code postal, pays).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <p className="text-gray-600 text-sm">
                    Numéro de téléphone, email professionnel ou autre moyen de contact.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Devise</h4>
                  <p className="text-gray-600 text-sm">
                    Choisissez votre devise principale : Euro (€), Dollar ($), ou Franc CFA (FCFA).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900">Conseil</span>
              </div>
              <p className="text-blue-800 text-sm">
                Vous pouvez modifier ces informations à tout moment depuis la section "Profil" du menu principal.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'client-management',
      title: 'Gestion des clients',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Gérer vos clients</h3>
            <p className="text-gray-600 mb-6">
              Créez et organisez votre base de données clients pour simplifier la création de factures.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Ajouter un nouveau client</h4>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</div>
                    <span className="font-medium">Cliquez sur "Ajouter un client"</span>
                  </div>
                  <img 
                    src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400" 
                    alt="Bouton ajouter client" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</div>
                    <span className="font-medium">Remplissez les informations</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Nom :</strong> Nom du client ou de l'entreprise</li>
                    <li>• <strong>Email :</strong> Adresse email pour l'envoi des factures</li>
                    <li>• <strong>Adresse :</strong> Adresse complète du client</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</div>
                    <span className="font-medium">Sauvegardez</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Le client sera ajouté à votre liste et disponible pour vos factures.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Actions disponibles</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <Edit2 className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <span className="font-medium text-green-900">Modifier</span>
                      <p className="text-sm text-green-700">Mettre à jour les informations du client</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <span className="font-medium text-red-900">Supprimer</span>
                      <p className="text-sm text-red-700">Retirer définitivement le client</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <span className="font-medium text-blue-900">Consulter</span>
                      <p className="text-sm text-blue-700">Voir toutes les informations du client</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <HelpCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-900">Important</span>
                  </div>
                  <p className="text-yellow-800 text-sm">
                    Assurez-vous que l'adresse email du client est correcte pour l'envoi automatique des factures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'invoice-creation',
      title: 'Création de factures',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Créer une facture professionnelle</h3>
            <p className="text-gray-600 mb-6">
              Suivez ces étapes pour créer une facture complète et professionnelle.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h4 className="font-semibold text-lg mb-3">Étape 1 : Informations de base</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Sélection du client</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Choisissez le client dans la liste déroulante. Si le client n'existe pas, ajoutez-le d'abord dans la section "Clients".
                    </p>
                    <img 
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300" 
                      alt="Sélection client" 
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Dates importantes</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Date d'émission :</strong> Date de création de la facture</li>
                      <li>• <strong>Date d'échéance :</strong> Date limite de paiement</li>
                      <li>• <strong>Numéro :</strong> Généré automatiquement</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h4 className="font-semibold text-lg mb-3">Étape 2 : Articles et services</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <img 
                    src="https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400" 
                    alt="Ajout d'articles" 
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm text-gray-600">
                    Interface intuitive pour ajouter vos produits et services
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Champs requis :</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Description :</strong> Détail du produit/service</li>
                      <li>• <strong>Quantité :</strong> Nombre d'unités</li>
                      <li>• <strong>Prix unitaire :</strong> Prix par unité</li>
                      <li>• <strong>Total :</strong> Calculé automatiquement</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Fonctionnalités :</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ajout de lignes multiples</li>
                      <li>• Suppression d'articles</li>
                      <li>• Calcul automatique des totaux</li>
                      <li>• Gestion de la TVA</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h4 className="font-semibold text-lg mb-3">Étape 3 : Calculs et taxes</h4>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">Sous-total</div>
                      <p className="text-sm text-purple-700">Somme des articles</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">+ TVA</div>
                      <p className="text-sm text-purple-700">Pourcentage configurable</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">= Total</div>
                      <p className="text-sm text-purple-700">Montant final</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-900">Validation automatique</span>
              </div>
              <p className="text-green-800 text-sm">
                Billora vérifie automatiquement que tous les champs requis sont remplis avant de créer la facture.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'email-sending',
      title: 'Envoi d\'emails',
      icon: Send,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Configuration et envoi d'emails</h3>
            <p className="text-gray-600 mb-6">
              Billora utilise Resend pour un envoi d'emails fiable et professionnel.
            </p>

            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600 mr-3" />
                  <h4 className="text-lg font-semibold text-blue-900">Service Resend intégré</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2 text-blue-800">Avantages :</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Configuration simplifiée</li>
                      <li>• Livraison fiable et rapide</li>
                      <li>• Gestion automatique des bounces</li>
                      <li>• Statistiques d'envoi intégrées</li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src="https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=300" 
                      alt="Envoi d'emails" 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Configuration initiale</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</div>
                      <span className="font-medium">Accédez aux paramètres email</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Depuis votre profil, cliquez sur "Configurer" dans la section Email.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</div>
                      <span className="font-medium">Renseignez vos informations</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Email expéditeur :</strong> votre-email@domaine.com</li>
                      <li>• <strong>Nom expéditeur :</strong> Votre nom ou entreprise</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</div>
                      <span className="font-medium">Testez la configuration</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Utilisez le bouton "Tester" pour vérifier que tout fonctionne.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Envoi de factures</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Download className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <span className="font-medium text-green-900">PDF automatique</span>
                        <p className="text-sm text-green-700">La facture est jointe en PDF</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <span className="font-medium text-blue-900">Message personnalisé</span>
                        <p className="text-sm text-blue-700">Modifiez le contenu de l'email</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <span className="font-medium text-purple-900">Confirmation d'envoi</span>
                        <p className="text-sm text-purple-700">Notification de succès/échec</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <HelpCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-semibold text-yellow-900">Conseil</span>
                    </div>
                    <p className="text-yellow-800 text-sm">
                      Utilisez une adresse email de votre domaine pour une meilleure délivrabilité.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Comprendre votre tableau de bord</h3>
            <p className="text-gray-600 mb-6">
              Le tableau de bord vous donne une vue d'ensemble de votre activité de facturation.
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-4">Statistiques en temps réel</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <span className="font-medium text-blue-900">Nombre de factures</span>
                        <p className="text-sm text-blue-700">Total des factures créées</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Users className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <span className="font-medium text-green-900">Nombre de clients</span>
                        <p className="text-sm text-green-700">Total des clients enregistrés</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-yellow-600 mr-3" />
                      <div>
                        <span className="font-medium text-yellow-900">Montant total</span>
                        <p className="text-sm text-yellow-700">Somme de toutes les factures</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-purple-600 mr-3" />
                      <div>
                        <span className="font-medium text-purple-900">Montant payé</span>
                        <p className="text-sm text-purple-700">Factures marquées comme payées</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-4">Gestion des statuts</h4>
                  <img 
                    src="https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400" 
                    alt="Tableau de bord" 
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-sm"><strong>Brouillon :</strong> Facture en cours de création</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-sm"><strong>Envoyée :</strong> Facture transmise au client</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-sm"><strong>Payée :</strong> Paiement reçu</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <span className="text-sm"><strong>En retard :</strong> Échéance dépassée</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-4">Actions rapides disponibles</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-lg mb-2">
                      <Download className="h-6 w-6 text-blue-600 mx-auto" />
                    </div>
                    <h5 className="font-medium">Télécharger PDF</h5>
                    <p className="text-sm text-gray-600">Obtenez une copie PDF de vos factures</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-lg mb-2">
                      <Edit2 className="h-6 w-6 text-green-600 mx-auto" />
                    </div>
                    <h5 className="font-medium">Modifier le statut</h5>
                    <p className="text-sm text-gray-600">Changez le statut de vos factures</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-lg mb-2">
                      <Send className="h-6 w-6 text-purple-600 mx-auto" />
                    </div>
                    <h5 className="font-medium">Renvoyer par email</h5>
                    <p className="text-sm text-gray-600">Renvoyez une facture à un client</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Questions fréquemment posées</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Comment modifier une facture déjà créée ?</h4>
                <p className="text-gray-600 text-sm">
                  Une fois créée, une facture ne peut pas être modifiée directement. Vous pouvez cependant changer son statut 
                  (brouillon, envoyée, payée, en retard) depuis le tableau de bord. Pour des modifications importantes, 
                  créez une nouvelle facture.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Puis-je utiliser Billora sans connexion internet ?</h4>
                <p className="text-gray-600 text-sm">
                  Billora fonctionne principalement en ligne pour la synchronisation des données et l'envoi d'emails. 
                  Cependant, vos données sont sauvegardées localement et restent accessibles même en cas de déconnexion temporaire.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Comment sauvegarder mes données ?</h4>
                <p className="text-gray-600 text-sm">
                  Vos données sont automatiquement sauvegardées dans votre navigateur. Pour une sauvegarde complète, 
                  nous recommandons d'exporter régulièrement vos factures en PDF et de noter vos informations clients importantes.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Puis-je personnaliser l'apparence de mes factures ?</h4>
                <p className="text-gray-600 text-sm">
                  Actuellement, Billora utilise un modèle de facture professionnel standard. La personnalisation avancée 
                  (logos, couleurs, mise en page) sera disponible dans les prochaines versions.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Comment gérer la TVA sur mes factures ?</h4>
                <p className="text-gray-600 text-sm">
                  Lors de la création d'une facture, vous pouvez définir un taux de TVA (en pourcentage). 
                  Le montant de la TVA sera automatiquement calculé et ajouté au total. Laissez à 0% si vous n'êtes pas assujetti à la TVA.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Que faire si l'envoi d'email ne fonctionne pas ?</h4>
                <p className="text-gray-600 text-sm">
                  Vérifiez d'abord votre configuration email dans les paramètres. Assurez-vous que l'adresse email du client 
                  est correcte. Si le problème persiste, vous pouvez toujours télécharger le PDF et l'envoyer manuellement.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Comment supprimer définitivement une facture ?</h4>
                <p className="text-gray-600 text-sm">
                  Actuellement, il n'est pas possible de supprimer une facture pour maintenir la traçabilité comptable. 
                  Vous pouvez marquer une facture comme "annulée" en changeant son statut ou en ajoutant une note dans la description.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h4 className="text-lg font-semibold text-blue-900">Besoin d'aide supplémentaire ?</h4>
              </div>
              <p className="text-blue-800 mb-4">
                Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <p>📧 Email : support@billora.com</p>
                <p>💬 Chat en ligne : Disponible du lundi au vendredi, 9h-18h</p>
                <p>📚 Documentation complète : docs.billora.com</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Centre d'aide</h2>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-blue-900">Bienvenue dans le centre d'aide Billora</h3>
        </div>
        <p className="text-blue-800 mb-4">
          Trouvez toutes les informations nécessaires pour utiliser Billora efficacement. 
          Des premiers pas à la gestion avancée de vos factures.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Guides détaillés</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Captures d'écran</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">FAQ complète</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu de navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                    {isActive ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {activeSection ? (
            <div className="bg-white rounded-lg shadow-md">
              {sections.find(s => s.id === activeSection)?.content}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sélectionnez une section</h3>
              <p className="text-gray-600">
                Choisissez un sujet dans le menu de gauche pour accéder aux guides détaillés.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section de contact rapide */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vous ne trouvez pas ce que vous cherchez ?</h3>
          <p className="text-gray-600 mb-4">
            Notre équipe est là pour vous aider à tirer le meilleur parti de Billora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center justify-center bg-blue-50 p-4 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-900 font-medium">support@billora.com</span>
            </div>
            <div className="flex items-center justify-center bg-green-50 p-4 rounded-lg">
              <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-900 font-medium">Chat en direct</span>
            </div>
            <div className="flex items-center justify-center bg-purple-50 p-4 rounded-lg">
              <Video className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-purple-900 font-medium">Tutoriels vidéo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;