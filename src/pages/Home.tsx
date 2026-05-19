import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Zap, Bell, ChevronRight, Play } from 'lucide-react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';

export default function Home() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const tQuery = query(
          collection(db, 'tournaments'),
          where('status', '==', 'upcoming'),
          orderBy('date', 'asc'),
          limit(3)
        );
        const tSnap = await getDocs(tQuery);
        setTournaments(tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const aQuery = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const aSnap = await getDocs(aQuery);
        setAnnouncements(aSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <section className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-white/10 to-transparent border border-white/10 mb-16 h-[500px] flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="relative z-10 px-12 md:px-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-4 h-4 fill-black" />
              Live Tournaments Now
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              DOMINATE THE <br />
              <span className="text-white/50">BATTLEGROUND.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mb-10 leading-relaxed">
              Join India's most elite Free Fire tournament platform. Compete with the best, prove your skills, and win massive prize pools.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tournaments" className="px-8 py-4 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 transition-transform flex items-center gap-2">
                JOIN NOW
                <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                <Play className="w-5 h-5 fill-white" />
                WATCH LIVE
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Upcoming Tournaments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight">UPCOMING MATCHES</h2>
            <Link to="/tournaments" className="text-white/40 hover:text-white text-sm font-medium transition-colors">VIEW ALL</Link>
          </div>

          <div className="grid gap-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />)
            ) : tournaments.length > 0 ? (
              tournaments.map((t) => (
                <Link key={t.id} to={`/tournament/${t.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-48 h-32 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                        {t.bannerUrl ? (
                          <img src={t.bannerUrl} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider">
                            {t.mode}
                          </span>
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                            {formatDate(t.date)}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">{t.name}</h3>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-white/40 text-[10px] font-bold uppercase">Prize Pool</p>
                            <p className="font-mono text-xl text-white">₹{t.prizePool}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-[10px] font-bold uppercase">Entry Fee</p>
                            <p className="font-mono text-xl text-white">₹{t.entryFee === 0 ? 'FREE' : t.entryFee}</p>
                          </div>
                          <div className="ml-auto">
                             <p className="text-white/40 text-[10px] font-bold uppercase text-right">Slots</p>
                             <p className="font-mono text-sm text-white">{t.filledSlots || 0} / {t.totalSlots}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-white/40">No upcoming tournaments at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Notice Board */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              NOTICE BOARD
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-6">
              {announcements.map((a) => (
                <div key={a.id} className="pb-6 border-b border-white/10 last:border-0 last:pb-0">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{formatDate(a.createdAt)}</span>
                  <h4 className="font-bold text-white mb-1">{a.title}</h4>
                  <p className="text-sm text-white/60 line-clamp-2">{a.content}</p>
                </div>
              ))}
              {announcements.length === 0 && !loading && (
                <p className="text-white/40 text-sm text-center py-4">No recent announcements.</p>
              )}
            </div>
          </div>

          <div>
             <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              QUICK STATS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Total Users</p>
                <p className="text-2xl font-black">1.2K+</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Tournaments</p>
                <p className="text-2xl font-black">450+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
