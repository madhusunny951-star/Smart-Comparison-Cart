import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { NotificationItem, Order } from '../types/index.ts';
import { Bell, CheckCheck, Package, CreditCard, Truck, RotateCcw, Tag } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { user, getAuthHeader } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`, { headers });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen, user?.uid]);

  const markAllRead = async () => {
    try {
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'DELIVERY':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'REFUND':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      case 'PROMO':
        return <Tag className="w-4 h-4 text-pink-600" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Alerts & Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs text-emerald-100 hover:text-white underline cursor-pointer"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 text-lg font-bold">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  n.read ? 'bg-white border-gray-100' : 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-gray-100 shrink-0 shadow-xs">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 text-xs space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-gray-900 truncate">{n.title}</h4>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
