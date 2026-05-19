import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Trophy, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, cn } from '../lib/utils';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchTournaments() {
      const q = query(collection(db, 'tournaments'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      setTournaments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchTournaments();
  }, []);

  const filtered = tournaments.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
           <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">All Tournaments</h1>
           <p className="text-white/40 max-w-md">Browse through available, live, and past tournaments. Show your skills on the global stage.</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          {['all', 'upcoming', 'live', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                filter === f ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-[32px] animate-pulse" />)
        ) : filtered.length > 0 ? (
          filtered.map((t) => (
            <Link key={t.id} to={`/tournament/${t.id}`}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:bg-white/10 transition-all flex flex-col h-full"
              >
                <div className="h-44 relative overflow-hidden">
                  {t.bannerUrl ? (
                    <img src={t.bannerUrl} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {t.mode}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        t.status === 'live' ? "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                        t.status === 'upcoming' ? "bg-green-500" : "bg-white/20"
                    )} />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{formatDate(t.date)}</p>
                  <h3 className="text-xl font-bold mb-4">{t.name}</h3>
                  
                  <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Prize</p>
                      <p className="font-mono text-lg">₹{t.prizePool}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Entry</p>
                      <p className="font-mono text-lg">{t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
             <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white/60">No tournaments found</h3>
             <p className="text-white/40">Try changing your filter or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
