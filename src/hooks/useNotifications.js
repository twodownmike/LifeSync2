import { useState, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return 'denied';
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/vite.svg', // Fallback icon
          badge: '/vite.svg',
          vibrate: [200, 100, 200],
          ...options
        });
        
        notification.onclick = function() {
          window.focus();
          notification.close();
        };
        
        return notification;
      } catch (e) {
        console.error("Notification failed", e);
      }
    } else if (permission === 'default') {
        requestPermission().then(res => {
            if (res === 'granted') {
                sendNotification(title, options);
            }
        });
    }
  }, [permission, requestPermission]);

  return { permission, requestPermission, sendNotification };
}
