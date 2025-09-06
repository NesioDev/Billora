@@ .. @@
-interface NotificationCenterProps {
-  invoices: Invoice[];
-}
+interface NotificationCenterProps {
+  invoices: Invoice[];
+  isMobile?: boolean;
+}

-const NotificationCenter: React.FC<NotificationCenterProps> = ({ invoices }) => {
+const NotificationCenter: React.FC<NotificationCenterProps> = ({ invoices, isMobile = false }) => {
   const [isOpen, setIsOpen] = useState(false);
@@ .. @@
   return (
     <div className="relative">
-      <button
-        onClick={() => setIsOpen(!isOpen)}
-        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
-      >
-        <Bell className="h-5 w-5" />
-        {unreadCount > 0 && (
-          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
-            {unreadCount > 9 ? '9+' : unreadCount}
-          </span>
-        )}
-      </button>
+      {isMobile ? (
+        <div className="px-3 py-2">
+          <div className="flex items-center justify-between mb-2">
+            <span className="text-sm font-medium text-gray-700">Notifications</span>
+            {unreadCount > 0 && (
+              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
+                {unreadCount > 9 ? '9+' : unreadCount}
+              </span>
+            )}
+          </div>
+          {notifications.length === 0 ? (
+            <p className="text-xs text-gray-500">Aucune notification</p>
+          ) : (
+            <div className="space-y-2 max-h-40 overflow-y-auto">
+              {notifications.slice(0, 3).map((notification) => (
+                <div
+                  key={notification.id}
+                  className={`p-2 rounded-md text-xs ${
+                    notification.type === 'overdue' 
+                      ? 'bg-red-50 border-l-2 border-red-400' 
+                      : notification.type === 'unpaid'
+                      ? 'bg-orange-50 border-l-2 border-orange-400'
+                      : 'bg-blue-50 border-l-2 border-blue-400'
+                  }`}
+                >
+                  <p className="font-medium">{notification.title}</p>
+                  <p className="text-gray-600">{notification.message}</p>
+                </div>
+              ))}
+              {notifications.length > 3 && (
+                <p className="text-xs text-gray-500 text-center">
+                  +{notifications.length - 3} autres notifications
+                </p>
+              )}
+            </div>
+          )}
+        </div>
+      ) : (
+        <>
+          <button
+            onClick={() => setIsOpen(!isOpen)}
+            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
+          >
+            <Bell className="h-5 w-5" />
+            {unreadCount > 0 && (
+              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
+                {unreadCount > 9 ? '9+' : unreadCount}
+              </span>
+            )}
+          </button>

-      {isOpen && (
-        <>
-          <div 
-            className="fixed inset-0 z-10" 
-            onClick={() => setIsOpen(false)}
-          />
-          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
-            <div className="p-4 border-b border-gray-200">
-              <div className="flex items-center justify-between">
-                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
-                {unreadCount > 0 && (
-                  <button
-                    onClick={markAllAsRead}
-                    className="text-sm text-blue-600 hover:text-blue-800"
-                  >
-                    Tout marquer comme lu
-                  </button>
-                )}
+          {isOpen && (
+            <>
+              <div 
+                className="fixed inset-0 z-10" 
+                onClick={() => setIsOpen(false)}
+              />
+              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
+                <div className="p-4 border-b border-gray-200">
+                  <div className="flex items-center justify-between">
+                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
+                    {unreadCount > 0 && (
+                      <button
+                        onClick={markAllAsRead}
+                        className="text-sm text-blue-600 hover:text-blue-800"
+                      >
+                        Tout marquer comme lu
+                      </button>
+                    )}
+                  </div>
+                </div>
+                
+                <div className="overflow-y-auto max-h-80">
+                  {notifications.length === 0 ? (
+                    <div className="p-4 text-center text-gray-500">
+                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
+                      <p>Aucune notification</p>
+                    </div>
+                  ) : (
+                    <div className="divide-y divide-gray-100">
+                      {notifications.map((notification) => (
+                        <div
+                          key={notification.id}
+                          onClick={() => markAsRead(notification.id)}
+                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
+                            !readNotifications.includes(notification.id) ? 'bg-blue-50' : ''
+                          }`}
+                        >
+                          <div className="flex items-start space-x-3">
+                            <div className={`flex-shrink-0 p-1 rounded-full ${
+                              notification.type === 'overdue' 
+                                ? 'bg-red-100' 
+                                : notification.type === 'unpaid'
+                                ? 'bg-orange-100'
+                                : 'bg-blue-100'
+                            }`}>
+                              {notification.type === 'overdue' ? (
+                                <AlertTriangle className="h-4 w-4 text-red-600" />
+                              ) : notification.type === 'unpaid' ? (
+                                <Clock className="h-4 w-4 text-orange-600" />
+                              ) : (
+                                <Bell className="h-4 w-4 text-blue-600" />
+                              )}
+                            </div>
+                            <div className="flex-1 min-w-0">
+                              <p className="text-sm font-medium text-gray-900">
+                                {notification.title}
+                              </p>
+                              <p className="text-sm text-gray-600 mt-1">
+                                {notification.message}
+                              </p>
+                              <p className="text-xs text-gray-400 mt-1">
+                                {notification.date}
+                              </p>
+                            </div>
+                            {!readNotifications.includes(notification.id) && (
+                              <div className="flex-shrink-0">
+                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
+                              </div>
+                            )}
+                          </div>
+                        </div>
+                      ))}
+                    </div>
+                  )}
+                </div>
               </div>
-            </div>
-            
-            <div className="overflow-y-auto max-h-80">
-              {notifications.length === 0 ? (
-                <div className="p-4 text-center text-gray-500">
-                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
-                  <p>Aucune notification</p>
-                </div>
-              ) : (
-                <div className="divide-y divide-gray-100">
-                  {notifications.map((notification) => (
-                    <div
-                      key={notification.id}
-                      onClick={() => markAsRead(notification.id)}
-                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
-                        !readNotifications.includes(notification.id) ? 'bg-blue-50' : ''
-                      }`}
-                    >
-                      <div className="flex items-start space-x-3">
-                        <div className={`flex-shrink-0 p-1 rounded-full ${
-                          notification.type === 'overdue' 
-                            ? 'bg-red-100' 
-                            : notification.type === 'unpaid'
-                            ? 'bg-orange-100'
-                            : 'bg-blue-100'
-                        }`}>
-                          {notification.type === 'overdue' ? (
-                            <AlertTriangle className="h-4 w-4 text-red-600" />
-                          ) : notification.type === 'unpaid' ? (
-                            <Clock className="h-4 w-4 text-orange-600" />
-                          ) : (
-                            <Bell className="h-4 w-4 text-blue-600" />
-                          )}
-                        </div>
-                        <div className="flex-1 min-w-0">
-                          <p className="text-sm font-medium text-gray-900">
-                            {notification.title}
-                          </p>
-                          <p className="text-sm text-gray-600 mt-1">
-                            {notification.message}
-                          </p>
-                          <p className="text-xs text-gray-400 mt-1">
-                            {notification.date}
-                          </p>
-                        </div>
-                        {!readNotifications.includes(notification.id) && (
-                          <div className="flex-shrink-0">
-                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
-                          </div>
-                        )}
-                      </div>
-                    </div>
-                  ))}
-                </div>
-              )}
-            </div>
-          </div>
-        </>
+            </>
+          )}
+        </>
       )}
     </div>
   );