import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Clock, X } from 'lucide-react';
import type { Invoice } from '../types';

interface NotificationCenterProps {
  invoices: Invoice[];
  isMobile?: boolean;
}

interface Notification {
  id: string;
  type: 'overdue' | 'unpaid' | 'due_soon';
  title: string;
  message: string;
  invoice: Invoice;
  timestamp: Date;
}

export default function NotificationCenter({ invoices, isMobile = false }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger les notifications lues depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('readNotifications');
    if (saved) {
      setReadNotifications(JSON.parse(saved));
    }
  }, []);

  // Générer les notifications basées sur les factures
  const notifications: Notification[] = React.useMemo(() => {
    const now = new Date();
    const notifs: Notification[] = [];

    invoices.forEach(invoice => {
      const dueDate = new Date(invoice.due_date);
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Factures en retard
      if (invoice.status === 'overdue') {
        const daysOverdue = Math.abs(daysDiff);
        notifs.push({
          id: `overdue-${invoice.id}`,
          type: 'overdue',
          title: 'Facture en retard',
          message: `Facture ${invoice.invoice_number} en retard de ${daysOverdue} jour(s)`,
          invoice,
          timestamp: dueDate
        });
      }
      // Factures impayées depuis plus de 7 jours
      else if (invoice.status === 'sent' && daysDiff < -7) {
        notifs.push({
          id: `unpaid-${invoice.id}`,
          type: 'unpaid',
          title: 'Facture impayée',
          message: `Facture ${invoice.invoice_number} impayée depuis ${Math.abs(daysDiff)} jours`,
          invoice,
          timestamp: dueDate
        });
      }
      // Factures qui expirent bientôt (dans les 3 prochains jours)
      else if (invoice.status === 'sent' && daysDiff <= 3 && daysDiff > 0) {
        notifs.push({
          id: `due-soon-${invoice.id}`,
          type: 'due_soon',
          title: 'Échéance proche',
          message: `Facture ${invoice.invoice_number} expire dans ${daysDiff} jour(s)`,
          invoice,
          timestamp: dueDate
        });
      }
    });

    return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [invoices]);

  // Notifications non lues
  const unreadNotifications = notifications.filter(n => !readNotifications.includes(n.id));
  const unreadCount = unreadNotifications.length;

  // Marquer une notification comme lue
  const markAsRead = (notificationId: string) => {
    const newReadNotifications = [...readNotifications, notificationId];
    setReadNotifications(newReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify(newReadNotifications));
  };

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(allIds);
    localStorage.setItem('readNotifications', JSON.stringify(allIds));
  };

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'unpaid':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'border-l-red-500 bg-red-50';
      case 'unpaid':
        return 'border-l-orange-500 bg-orange-50';
      case 'due_soon':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (isMobile) {
    return (
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune notification</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-2 rounded border-l-4 ${getNotificationColor(notification.type)} ${
                  readNotifications.includes(notification.id) ? 'opacity-60' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-2">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{notifications.length - 3} autres notifications
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        readNotifications.includes(notification.id) ? 'opacity-60' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Client: {notification.invoice.client?.name} • 
                            Montant: {notification.invoice.total}€
                          </p>
                        </div>
                        {!readNotifications.includes(notification.id) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}