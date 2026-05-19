import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Trash2, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn } from '../lib/utils';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      setNotifications(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    // For now just hide it locally
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Inbox</h1>
           <p className="text-white/40">Stay updated with your registration status and news.</p>
        </div>
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-white/60" />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />)
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "group relative bg-white/5 border rounded-3xl p-6 transition-all",
                n.read ? "border-white/5 opacity-60" : "border-white/20 bg-white/[0.08]"
              )}
            >
              <div className="flex gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  n.type === 'registration_update' ? "bg-blue-500/20 text-blue-500" : "bg-purple-500/20 text-purple-500"
                )}>
                  {n.type === 'registration_update' ? <Trophy className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{n.message}</p>
                  
                  {!n.read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Check className="w-3 h-3" /> Mark as Read
                    </button>
                  )}
                </div>
                <button 
                   onClick={() => deleteNotification(n.id)}
                   className="absolute top-6 right-6 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-500"
                >
                   <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-24 bg-white/5 border border-dashed border-white/10 rounded-[32px]">
            <Bell className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Your inbox is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
