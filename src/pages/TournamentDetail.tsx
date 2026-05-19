import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Calendar, Clock, Download, Users, CheckCircle2, AlertCircle, QrCode, UploadCloud, ArrowLeft, ShieldAlert } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tournament, setTournament] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [timer, setTimer] = useState("");

  const [formData, setFormData] = useState({
    playerName: '',
    ffUid: '',
    ffIgn: '',
    phoneNumber: '',
    teamName: '',
    transactionId: '',
    paymentScreenshotUrl: ''
  });

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const tDoc = await getDoc(doc(db, 'tournaments', id));
      if (tDoc.exists()) {
        const data = tDoc.data();
        setTournament({ id: tDoc.id, ...data });
        
        // Check if user is registered
        if (user) {
          const rQuery = query(
            collection(db, 'registrations'),
            where('tournamentId', '==', id),
            where('userId', '==', user.uid)
          );
          const rSnap = await getDocs(rQuery);
          if (!rSnap.empty) {
            setRegistration({ id: rSnap.docs[0].id, ...rSnap.docs[0].data() });
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [id, user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !tournament) return;
    
    if (tournament.filledSlots >= tournament.totalSlots) {
      alert("Registration full!");
      return;
    }

    try {
      setRegistering(true);
      const regData = {
        tournamentId: id,
        userId: user.uid,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'registrations'), regData);
      setRegistration({ id: docRef.id, ...regData });
      
      // Update slots (simple increment, real-world would need a transaction)
      await updateDoc(doc(db, 'tournaments', id), {
        filledSlots: increment(1)
      });
      
    } catch (err) {
      console.error(err);
      alert("Error registering. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" /></div>;
  if (!tournament) return <div className="text-center py-24"><h2 className="text-2xl font-bold">Tournament not found</h2><button onClick={() => navigate('/')} className="mt-4 text-white/40 hover:text-white flex items-center gap-2 mx-auto"><ArrowLeft className="w-4 h-4" /> Go Back</button></div>;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <button onClick={() => navigate(-1)} className="mb-8 text-white/40 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Tournaments
      </button>

      <div className="relative rounded-[40px] overflow-hidden bg-white/5 border border-white/10 mb-12">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
        <div className="h-64 sm:h-80 w-full overflow-hidden">
          {tournament.bannerUrl ? (
             <img src={tournament.bannerUrl} alt={tournament.name} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />
          )}
        </div>
        
        <div className="relative z-20 -mt-24 p-8">
           <div className="flex flex-wrap items-center gap-3 mb-4">
             <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider">{tournament.mode}</span>
             <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">{tournament.status}</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{tournament.name}</h1>
           <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white/40" />
                <span className="text-white/80 font-medium">{formatDate(tournament.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/40" />
                <span className="text-white/80 font-medium">{tournament.filledSlots || 0} / {tournament.totalSlots} Slots Filled</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-white/40" />
                <span className="text-white/80 font-medium">₹{tournament.prizePool} Prize Pool</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white/5 rounded-3xl p-8 border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              RULES & DESCRIPTION
            </h2>
            <div className="text-white/60 leading-relaxed whitespace-pre-wrap">
              {tournament.rules || "No rules specified for this tournament."}
            </div>
          </section>

          {registration && registration.status === 'approved' && tournament.roomId && (
            <motion.section
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/10 border-2 border-green-500/20 rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold text-green-500 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5" />
                ROOM DETAILS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Room ID</p>
                  <p className="text-2xl font-mono font-bold tracking-widest">{tournament.roomId}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Password</p>
                  <p className="text-2xl font-mono font-bold tracking-widest">{tournament.roomPassword}</p>
                </div>
              </div>
            </motion.section>
          )}
        </div>

        <div className="space-y-8">
          {registration ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center sticky top-24">
              <div className={cn(
                "w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center",
                registration.status === 'approved' ? "bg-green-500/20 text-green-500" :
                registration.status === 'pending' ? "bg-yellow-500/20 text-yellow-500" :
                "bg-red-500/20 text-red-500"
              )}>
                {registration.status === 'approved' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">
                {registration.status === 'approved' ? 'REGISTRATION APPROVED' : 
                 registration.status === 'pending' ? 'REGISTRATION PENDING' : 'REGISTRATION REJECTED'}
              </h3>
              <p className="text-white/40 text-sm mb-6">
                {registration.status === 'approved' ? 'Good luck on the battlefield! Check room details above.' :
                 registration.status === 'pending' ? 'Our admins are verifying your payment. This usually takes 30-60 mins.' :
                 'Your registration was rejected. Please contact support for more details.'}
              </p>
              <div className="text-left space-y-4 pt-6 border-t border-white/10">
                <div>
                   <p className="text-white/20 text-[10px] font-bold uppercase">IGN</p>
                   <p className="font-bold">{registration.ffIgn}</p>
                </div>
                <div>
                   <p className="text-white/20 text-[10px] font-bold uppercase">UID</p>
                   <p className="font-mono text-sm">{registration.ffUid}</p>
                </div>
              </div>
            </div>
          ) : tournament.filledSlots >= tournament.totalSlots ? (
             <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
               <h3 className="text-xl font-bold mb-2">REGISTRATION FULL</h3>
               <p className="text-white/40 text-sm">Sorry, all slots for this tournament are already filled. Connect with us to stay updated for the next one.</p>
             </div>
          ) : !user ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <h3 className="text-xl font-bold mb-4">WANT TO JOIN?</h3>
              <p className="text-white/40 text-sm mb-6">Login to register for this tournament and win big prizes.</p>
              <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest">SIGN IN TO REGISTER</button>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6">REGISTER NOW</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Full Name</label>
                  <input
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                    placeholder="Enter real name"
                    value={formData.playerName}
                    onChange={e => setFormData({...formData, playerName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">FF UID</label>
                    <input
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                      placeholder="123456789"
                      value={formData.ffUid}
                      onChange={e => setFormData({...formData, ffUid: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">FF IGN</label>
                    <input
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                      placeholder="Killer_7"
                      value={formData.ffIgn}
                      onChange={e => setFormData({...formData, ffIgn: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Phone Number</label>
                  <input
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                    placeholder="WatsApp number"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
                
                <div className="pt-6 border-t border-white/10">
                   <p className="text-[10px] font-bold text-white/40 uppercase mb-4">Payment Verification (Entry: ₹{tournament.entryFee})</p>
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4 flex items-center gap-4">
                      <QrCode className="w-12 h-12 text-white/60" />
                      <div>
                         <p className="text-xs font-bold text-white">SCAN TO PAY</p>
                         <p className="text-[10px] text-white/40">Use any UPI app to pay the entry fee</p>
                      </div>
                      <button type="button" className="ml-auto text-[10px] font-bold bg-white/10 px-3 py-1 rounded-lg">QR CODE</button>
                   </div>
                   <input
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 mb-3"
                    placeholder="Transaction ID / UTR"
                    value={formData.transactionId}
                    onChange={e => setFormData({...formData, transactionId: e.target.value})}
                   />
                   <div className="relative group cursor-pointer">
                      <div className="w-full h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center group-hover:border-white/20 transition-colors">
                        <UploadCloud className="w-6 h-6 text-white/20 mb-1" />
                        <span className="text-[10px] font-bold text-white/20 uppercase">Upload Payment Screenshot</span>
                      </div>
                      {/* Real upload would be here, setting dummy URL for demo */}
                      <input 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        type="file" 
                        onChange={() => setFormData({...formData, paymentScreenshotUrl: 'https://placeholder.com/screenshot.jpg'})}
                      />
                   </div>
                   {formData.paymentScreenshotUrl && <p className="text-[10px] text-green-500 mt-2 font-bold uppercase">✓ Screenshot Uploaded</p>}
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className={cn(
                    "w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform",
                    registering && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {registering ? 'REGISTERING...' : 'CONFIRM REGISTRATION'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
