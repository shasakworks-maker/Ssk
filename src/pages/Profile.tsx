import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Phone, Shield, Pencil, Save, X, Ban } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phoneNumber: profile?.phoneNumber || '',
    ffUid: profile?.ffUid || '',
    ffIgn: profile?.ffIgn || '',
    teamName: profile?.teamName || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      setIsEditing(false);
      window.location.reload(); // Refresh to get new profile data from context
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="relative mb-12">
        <div className="h-48 w-full bg-gradient-to-r from-white/10 to-transparent rounded-[40px] border border-white/10" />
        <div className="absolute -bottom-8 left-12 flex items-end gap-6">
          <div className="w-32 h-32 rounded-[32px] border-4 border-[#0a0a0a] bg-white overflow-hidden shadow-2xl">
            {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-black font-black text-4xl">
                    {profile.displayName?.charAt(0)}
                </div>
            )}
          </div>
          <div className="pb-4">
             <h1 className="text-4xl font-black tracking-tighter">{profile.displayName}</h1>
             <p className="text-white/40 font-mono text-sm uppercase tracking-widest">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-white/40" />
                PERSONAL DETAILS
              </h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {isEditing ? <X className="w-5 h-5" /> : <Pencil className="w-5 h-5 text-white/40" />}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Display Name</label>
                   {isEditing ? (
                     <input 
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                       value={formData.displayName}
                       onChange={e => setFormData({...formData, displayName: e.target.value})}
                     />
                   ) : (
                     <p className="font-medium text-white">{profile.displayName || 'Not Set'}</p>
                   )}
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
                   {isEditing ? (
                     <input 
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                       value={formData.phoneNumber}
                       onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                     />
                   ) : (
                     <p className="font-medium text-white">{profile.phoneNumber || 'Not Set'}</p>
                   )}
                </div>
                <div className="space-y-1">
                   <label className="text-[10px) font-bold text-white/40 uppercase tracking-widest">Free Fire UID</label>
                   {isEditing ? (
                     <input 
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                       value={formData.ffUid}
                       onChange={e => setFormData({...formData, ffUid: e.target.value})}
                     />
                   ) : (
                     <p className="font-medium text-white font-mono">{profile.ffUid || 'Not Set'}</p>
                   )}
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Free Fire IGN</label>
                   {isEditing ? (
                     <input 
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                       value={formData.ffIgn}
                       onChange={e => setFormData({...formData, ffIgn: e.target.value})}
                     />
                   ) : (
                     <p className="font-medium text-white">{profile.ffIgn || 'Not Set'}</p>
                   )}
                </div>
              </div>
              
              {isEditing && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-white/40" />
                ACCOUNT STATUS
              </h2>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">Role</span>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        profile.isAdmin ? "bg-purple-500/20 text-purple-500" : "bg-white/10 text-white/60"
                    )}>
                        {profile.isAdmin ? 'ADMIN' : 'PLAYER'}
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">Account Status</span>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        profile.isBanned ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                    )}>
                        {profile.isBanned ? 'BANNED' : 'ACTIVE'}
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-red-500/5 border border-red-500/10 rounded-[32px] p-8 text-center">
              <p className="text-white/40 text-xs mb-4">SUSPICIOUS ACTIVITY?</p>
              <button className="flex items-center gap-2 mx-auto text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors">
                <Ban className="w-4 h-4" />
                Report User
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
