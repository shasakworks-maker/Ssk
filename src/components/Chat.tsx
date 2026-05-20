import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, Trash2, Copy, Check, ChevronRight, Zap, Terminal, PenTool, Leaf, FlaskConical, Home, Activity, HeartPulse as HeartIcon, Stethoscope, LogOut, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { auth, logOut, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

const SUGGESTED_PROMPTS = [
  { 
    title: "Digestive Care", 
    prompt: "I have mild acidity. What are the Ayurvedic and Homeopathic options for relief?", 
    icon: Zap 
  },
  { 
    title: "Cold & Flu", 
    prompt: "Suggest home remedies and allopathic treatments for a common cold.", 
    icon: PenTool 
  },
  { 
    title: "Quick Wellness", 
    prompt: "What are some Ayurvedic ways to improve sleep quality?", 
    icon: Sparkles 
  }
];

function HeartPulse() {
  return (
    <div className="flex items-center gap-1 h-6">
      {[1, 2, 3, 4, 5, 2, 4, 1].map((h, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: [1, h * 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
          style={{ willChange: 'transform', transformOrigin: 'bottom' }}
          className="w-1 bg-emerald-500/60 rounded-full h-2"
        />
      ))}
    </div>
  );
}

function HealthVisualizer() {
  return (
    <div className="absolute top-24 right-6 hidden xl:block w-48 h-32 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden group">
      <div className="absolute top-2 left-3 text-[8px] font-black uppercase tracking-widest text-zinc-600">DNA Sequence Analysis</div>
      <div className="flex items-center justify-around h-full pt-4 px-4 bg-grid opacity-30">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [20, 60, 20] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.15,
              ease: "easeInOut"
            }}
            style={{ willChange: 'height' }}
            className="w-1.5 rounded-full bg-purple-500/30"
          />
        ))}
      </div>
      <div className="absolute bottom-2 right-3">
        <motion.div 
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" 
        />
      </div>
    </div>
  );
}

export default function Chat() {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          role: data.role,
          parts: [{ text: data.text }]
        } as Message;
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageText = overrideInput || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: messageText }] };
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to Firestore
      if (user) {
        await addDoc(collection(db, `users/${user.uid}/messages`), {
          role: 'user',
          text: messageText,
          createdAt: serverTimestamp()
        });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Save AI message to Firestore
      if (user) {
        await addDoc(collection(db, `users/${user.uid}/messages`), {
          role: 'model',
          text: data.text,
          createdAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error('Chat Error:', error);
      const errorMessage: Message = { role: 'model', parts: [{ text: `System Error: ${error.message}. Please check your connection.` }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = async () => {
    if (user && confirm("Reset Aura's memory? This will clear our current thread.")) {
      const q = query(collection(db, `users/${user.uid}/messages`));
      const snapshot = await getDocs(q);
      const batch = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(batch);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050507] text-zinc-100 font-sans selection:bg-purple-500/40 selection:text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <HealthVisualizer />
        
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 scan-line" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ willChange: 'transform, opacity' }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[80px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ willChange: 'transform, opacity' }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[80px] rounded-full" 
        />
      </div>

      {/* Header */}
      <header className="px-4 py-3 md:px-6 md:py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-[60] flex justify-between items-center">
        <div className="flex items-center gap-3 md:gap-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/20 relative overflow-hidden group"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100"
            />
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10" />
          </motion.div>
          <div>
            <h1 className="font-display font-bold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 cursor-default leading-tight">Aura Wellness</h1>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap">v1.2 Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Vitals</div>
            <HeartPulse />
          </div>
          
          {user && (
            <div className="flex items-center gap-2 md:gap-3 px-2 py-1 md:px-3 md:py-1.5 bg-white/5 rounded-xl border border-white/5">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 md:w-6 md:w-6 rounded-lg object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-5 h-5 md:w-6 md:w-6 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <User className="w-3 h-3 md:w-3.5 md:h-3.5 text-zinc-400" />
                </div>
              )}
              <div className="hidden lg:block text-[10px] font-bold text-zinc-400 truncate max-w-[80px]">
                {user.displayName || user.email}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 md:gap-2">
            <button 
              onClick={clearChat}
              className="flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
              title="Reset Memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => logOut()}
              className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all text-[11px] md:text-xs font-bold"
              title="Secure Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-12 space-y-8 md:space-y-12 scroll-smooth">
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl md:rounded-3xl"
          >
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase tracking-widest">Medical Intelligence Guard</p>
              <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">
                Aura provides multi-category health insights. This information is for educational purposes and is not a substitute for professional clinical judgment.
              </p>
            </div>
          </motion.div>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-8 md:py-12"
            >
              <div className="relative mb-6 md:mb-10">
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-[-30px] md:inset-[-40px] bg-purple-500/20 blur-[50px] md:blur-[60px] rounded-full"
                 />
                 <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative backdrop-blur-sm">
                    <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white/80" />
                 </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 md:mb-4 tracking-tight leading-tight px-4">
                Welcome to <span className="text-purple-400">Aura Wellness</span>.
              </h2>
              <p className="text-zinc-400 text-base md:text-lg mb-6 md:mb-8 max-w-lg leading-relaxed px-4">
                Your multidisciplinary wellness advisor. Ask about symptoms or treatments across multiple medical systems.
              </p>
              
              <div className="mb-8 md:mb-10 px-5 py-3 md:px-6 md:py-4 bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-[32px] max-w-xl mx-auto backdrop-blur-sm">
                <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed text-center">
                  Secure Medical Environment • Neural Engine v1.2
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full px-4">
                {SUGGESTED_PROMPTS.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => handleSubmit(undefined, item.prompt)}
                    className="group p-4 md:p-5 bg-white/[0.03] border border-white/5 rounded-[20px] md:rounded-[24px] text-left hover:bg-white/[0.08] hover:border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 group-hover:text-inherit" />
                    </div>
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{item.title}</span>
                    <p className="text-xs md:text-sm text-zinc-300 font-medium line-clamp-2 leading-relaxed">{item.prompt}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-8 md:space-y-12">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "flex flex-col group",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2 md:gap-3 mb-2 md:mb-3 px-1",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shadow-lg",
                      msg.role === 'user' 
                        ? "bg-zinc-800 text-zinc-400 border border-white/5" 
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                    )}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      {msg.role === 'user' ? 'Client' : 'Aura AI'}
                    </span>
                  </div>

                  <div className={cn(
                    "relative group-hover:shadow-2xl transition-all duration-300",
                    msg.role === 'user' 
                      ? "max-w-[85%] sm:max-w-[80%] rounded-[24px] md:rounded-[28px] rounded-tr-none bg-white text-zinc-950 px-5 py-3 md:px-6 md:py-4 shadow-xl" 
                      : "max-w-[95%] sm:max-w-[90%] rounded-[24px] md:rounded-[28px] rounded-tl-none bg-white/[0.03] border border-white/5 px-5 py-4 md:px-7 md:py-5 text-zinc-100"
                  )}>
                    <div className={cn(
                      "prose max-w-none prose-sm",
                      msg.role === 'user' ? "prose-zinc prose-p:font-medium text-black" : "prose-invert prose-purple prose-p:leading-[1.7]"
                    )}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h3: ({ children }) => {
                            const text = String(children).toLowerCase();
                            let icon = <Activity className="w-4 h-4" />;
                            let styles = "border-zinc-500/20 bg-zinc-500/5 text-zinc-400";
                            
                            if (text.includes("ayurvedic")) {
                              icon = <Leaf className="w-4 h-4" />;
                              styles = "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
                            } else if (text.includes("homeopathic")) {
                              icon = <Stethoscope className="w-4 h-4" />;
                              styles = "border-blue-500/30 bg-blue-500/5 text-blue-400";
                            } else if (text.includes("home remedies")) {
                              icon = <Home className="w-4 h-4" />;
                              styles = "border-orange-500/30 bg-orange-500/5 text-orange-400";
                            } else if (text.includes("allopathic")) {
                              icon = <FlaskConical className="w-4 h-4" />;
                              styles = "border-purple-500/30 bg-purple-500/5 text-purple-400";
                            }

                            return (
                              <div className={cn("mt-6 md:mt-8 mb-3 md:mb-4 px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl border flex items-center gap-3 font-display font-bold uppercase tracking-widest text-[10px] md:text-xs", styles)}>
                                <div className={cn("w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center border", styles)}>
                                  {icon}
                                </div>
                                {children}
                              </div>
                            );
                          }
                        }}
                      >
                        {msg.parts[0].text}
                      </ReactMarkdown>
                    </div>

                    {msg.role === 'model' && (
                      <button
                        onClick={() => copyToClipboard(msg.parts[0].text, idx)}
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all border border-white/5"
                        title="Copy code"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex flex-col items-start max-w-4xl mx-auto w-full">
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 animate-pulse">Aura is Thinking</span>
                  </div>
                  <div className="px-7 py-5 bg-white/[0.03] border border-white/5 rounded-[28px] rounded-tl-none flex items-center gap-3 relative overflow-hidden">
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent w-full h-full"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] z-10"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] z-10"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] z-10"
                    />
                  </div>
                </div>
              )}
              <div ref={scrollRef} className="h-4" />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-10 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent z-[60] relative">
        <div className="max-w-4xl mx-auto relative group">
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-1.5 md:p-2 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[28px] md:rounded-[32px] flex items-center gap-2 shadow-2xl transition-all duration-500",
              "focus-within:border-white/20 focus-within:bg-zinc-900/60 focus-within:shadow-purple-500/10"
            )}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your symptoms here..."
              className="flex-1 bg-transparent px-4 md:px-6 py-3 md:py-4 focus:outline-none text-zinc-100 placeholder:text-zinc-600 text-base md:text-lg font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-[20px] md:rounded-[24px] bg-white text-black flex items-center justify-center transition-all shadow-xl active:scale-90 disabled:opacity-50 disabled:grayscale",
                input.trim() && !isLoading ? "hover:bg-purple-500 hover:text-white" : ""
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />}
            </button>
          </motion.form>
          <div className="flex justify-center mt-4 md:mt-6 gap-4 md:gap-6">
             <div className="flex items-center gap-1.5 md:gap-2 text-zinc-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none">
               <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
               Secure
             </div>
             <div className="flex items-center gap-1.5 md:gap-2 text-zinc-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none">
               <span className="w-1 h-1 rounded-full bg-indigo-500/50" />
               Sandbox
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
