import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Plus, Users, Check, X, Megaphone, Key, Trash2, Edit3, ChevronRight, LayoutGrid, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn } from '../lib/utils';

export default function Admin() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'tournaments' | 'registrations' | 'announcements' | 'create'>('tournaments');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for new Tournament
  const [newTournament, setNewTournament] = useState({
    name: '',
    date: '',
    time: '',
    entryFee: 0,
    mode: 'Solo',
    totalSlots: 48,
    prizePool: '',
    rules: '',
    status: 'upcoming',
    bannerUrl: ''
  });

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    async function fetchData() {
      const tSnap = await getDocs(query(collection(db, 'tournaments'), orderBy('date', 'desc')));
      setTournaments(tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const rSnap = await getDocs(query(collection(db, 'registrations'), orderBy('createdAt', 'desc')));
      setRegistrations(rSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const aSnap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      setAnnouncements(aSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      setLoading(false);
    }
    fetchData();
  }, [activeTab]);

  const seedData = async () => {
    try {
      const tournamentsToSeed = [
        {
          name: "Weekend Pro Clash",
          date: "2026-05-25",
          time: "18:00",
          entryFee: 50,
          mode: "Solo",
          totalSlots: 48,
          filledSlots: 12,
          prizePool: "₹2000",
          rules: "1. No Hacks\n2. Be on time\n3. Screenshot winners",
          status: "upcoming",
          createdAt: new Date().toISOString()
        },
        {
          name: "Squad Strike Elite",
          date: "2026-05-26",
          time: "20:00",
          entryFee: 200,
          mode: "Squad",
          totalSlots: 12,
          filledSlots: 4,
          prizePool: "₹5000",
          rules: "1. Squad only\n2. Standard map\n3. Entry ₹200 per team",
          status: "upcoming",
          createdAt: new Date().toISOString()
        }
      ];

      for (const t of tournamentsToSeed) {
        await addDoc(collection(db, 'tournaments'), t);
      }

      await addDoc(collection(db, 'announcements'), {
        title: "Welcome to Shasak Tournament!",
        content: "We are officially open! Join our upcoming matches and win big.",
        createdAt: new Date().toISOString()
      });

      alert("Sample data seeded!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Seeding failed");
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tournaments'), {
        ...newTournament,
        filledSlots: 0,
        createdAt: new Date().toISOString()
      });
      alert("Tournament Created!");
      setActiveTab('tournaments');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRegStatus = async (regId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'registrations', regId), { status });
      setRegistrations(registrations.map(r => r.id === regId ? { ...r, status } : r));
      
      // Optionally add a notification for the user
      const reg = registrations.find(r => r.id === regId);
      if (reg) {
        await addDoc(collection(db, 'notifications'), {
          userId: reg.userId,
          title: `Registration ${status.toUpperCase()}`,
          message: `Your registration for tournament ${reg.tournamentId} has been ${status}.`,
          read: false,
          createdAt: new Date().toISOString(),
          type: 'registration_update'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseRoom = async (tId: string) => {
    const roomId = prompt("Enter Room ID:");
    const roomPassword = prompt("Enter Room Password:");
    if (roomId && roomPassword) {
      await updateDoc(doc(db, 'tournaments', tId), { roomId, roomPassword, status: 'live' });
      alert("Room details released!");
      window.location.reload();
    }
  };

  const handleDeleteTournament = async (id: string) => {
     if (confirm("Are you sure?")) {
         await deleteDoc(doc(db, 'tournaments', id));
         setTournaments(tournaments.filter(t => t.id !== id));
     }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
     e.preventDefault();
     await addDoc(collection(db, 'announcements'), {
         ...newAnnouncement,
         createdAt: new Date().toISOString()
     });
     setNewAnnouncement({ title: '', content: '' });
     setActiveTab('announcements');
  }

  if (!profile?.isAdmin) return <div className="text-center py-24">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Admin Sidebar */}
        <div className="md:w-64 space-y-2">
           <h2 className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Admin Engine</h2>
           {[
             { id: 'tournaments', label: 'Tournaments', icon: Trophy },
             { id: 'registrations', label: 'Registrations', icon: ListChecks },
             { id: 'announcements', label: 'Notices', icon: Megaphone },
             { id: 'create', label: 'New Event', icon: Plus },
           ].map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                    "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                    activeTab === tab.id ? "bg-white text-black translate-x-2" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
             >
                <tab.icon className="w-5 h-5" />
                {tab.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'tournaments' && (
              <motion.div
                key="t"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">Managed Events</h1>
                  <div className="flex gap-2">
                    <button onClick={seedData} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                      SEED DATA
                    </button>
                    <button onClick={() => setActiveTab('create')} className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" /> CREATE
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {tournaments.map((t) => (
                    <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center font-black">
                        {t.mode[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{t.name}</h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest">{formatDate(t.date)} • {t.filledSlots}/{t.totalSlots} Slots</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                            onClick={() => handleReleaseRoom(t.id)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 transition-colors"
                            title="Release Room ID"
                          >
                            <Key className="w-5 h-5" />
                         </button>
                         <button 
                            onClick={() => handleDeleteTournament(t.id)}
                            className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  ))}
                  {tournaments.length === 0 && <p className="text-center py-12 text-white/20">No tournaments created yet.</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'registrations' && (
              <motion.div key="r" className="space-y-6">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Player Applications</h1>
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="border-b border-white/10 text-[10px] font-black text-white/20 uppercase tracking-widest">
                         <th className="px-6 py-4">Player / Team</th>
                         <th className="px-6 py-4">Tournament</th>
                         <th className="px-6 py-4">Transaction ID</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {registrations.map((reg) => (
                           <tr key={reg.id} className="text-sm">
                             <td className="px-6 py-6">
                               <p className="font-bold">{reg.playerName}</p>
                               <p className="text-xs text-white/40">{reg.teamName || 'Solo'}</p>
                             </td>
                             <td className="px-6 py-6 text-white/60">
                               {tournaments.find(t => t.id === reg.tournamentId)?.name || 'Unknown'}
                             </td>
                             <td className="px-6 py-6 font-mono text-xs text-white/40">
                               {reg.transactionId}
                             </td>
                             <td className="px-6 py-6">
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                 reg.status === 'approved' ? "bg-green-500/20 text-green-500" :
                                 reg.status === 'pending' ? "bg-yellow-500/20 text-yellow-500" :
                                 "bg-red-500/20 text-red-500"
                               )}>
                                 {reg.status}
                               </span>
                             </td>
                             <td className="px-6 py-6 text-right">
                                {reg.status === 'pending' && (
                                  <div className="flex items-center justify-end gap-2">
                                     <button 
                                        onClick={() => handleUpdateRegStatus(reg.id, 'approved')}
                                        className="w-10 h-10 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500/40"
                                      >
                                       <Check className="w-5 h-5" />
                                     </button>
                                     <button 
                                        onClick={() => handleUpdateRegStatus(reg.id, 'rejected')}
                                        className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/40"
                                      >
                                       <X className="w-5 h-5" />
                                     </button>
                                  </div>
                                )}
                             </td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                   {registrations.length === 0 && <p className="text-center py-12 text-white/20">No registrations found.</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'announcements' && (
              <motion.div key="a" className="space-y-8">
                 <h1 className="text-4xl font-black uppercase tracking-tighter">Notice Center</h1>
                 <form onSubmit={handleCreateAnnouncement} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase">Title</label>
                      <input 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                        value={newAnnouncement.title}
                        onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase">Content</label>
                      <textarea 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 h-32"
                        value={newAnnouncement.content}
                        onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest">Post Announcement</button>
                 </form>

                 <div className="grid gap-4">
                    {announcements.map(a => (
                       <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold">{a.title}</h4>
                             <span className="text-[10px] text-white/20 font-mono">{formatDate(a.createdAt)}</span>
                          </div>
                          <p className="text-sm text-white/60">{a.content}</p>
                       </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'create' && (
              <motion.div key="c" className="space-y-8">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">Forge New Battle</h1>
                  <form onSubmit={handleCreateTournament} className="bg-white/5 border border-white/10 rounded-[40px] p-10 grid grid-cols-2 gap-8">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Tournament Name</label>
                        <input 
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:border-white/20"
                            placeholder="Pro Championship Series"
                            value={newTournament.name}
                            onChange={e => setNewTournament({...newTournament, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Date</label>
                        <input 
                            type="date"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20"
                            value={newTournament.date}
                            onChange={e => setNewTournament({...newTournament, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Time</label>
                        <input 
                            type="time"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20"
                            value={newTournament.time}
                            onChange={e => setNewTournament({...newTournament, time: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Entry Fee (₹)</label>
                        <input 
                            type="number"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20"
                            value={newTournament.entryFee}
                            onChange={e => setNewTournament({...newTournament, entryFee: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Prize Pool</label>
                        <input 
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20"
                            placeholder="₹5000 + Custom Rewards"
                            value={newTournament.prizePool}
                            onChange={e => setNewTournament({...newTournament, prizePool: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Game Mode</label>
                        <select 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20"
                            value={newTournament.mode}
                            onChange={e => setNewTournament({...newTournament, mode: e.target.value})}
                        >
                            <option value="Solo">Solo</option>
                            <option value="Duo">Duo</option>
                            <option value="Squad">Squad</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Total Slots</label>
                        <input 
                            type="number"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20"
                            value={newTournament.totalSlots}
                            onChange={e => setNewTournament({...newTournament, totalSlots: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase">Rules & Rules</label>
                        <textarea 
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20 h-48"
                            placeholder="1. No Hacks..."
                            value={newTournament.rules}
                            onChange={e => setNewTournament({...newTournament, rules: e.target.value})}
                        />
                      </div>
                      <div className="col-span-2">
                        <button type="submit" className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xl tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                           INITIATE TOURNAMENT
                        </button>
                      </div>
                  </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
