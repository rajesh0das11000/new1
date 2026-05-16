'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Send, Image as ImageIcon, MoreHorizontal, Loader2, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export default function ChatRoom({ matchId, onBack }: { matchId: string, onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId || !user) return;

    const fetchOtherUser = async () => {
      const matchRef = doc(db, 'matches', matchId);
      const matchSnap = await getDoc(matchRef);
      if (matchSnap.exists()) {
        const otherUserId = matchSnap.data().userIds.find((id: string) => id !== user.uid);
        const userRef = doc(db, 'profiles', otherUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setOtherUser(userSnap.data());
        }
      }
    };
    fetchOtherUser();

    const q = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !matchId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, 'matches', matchId, 'messages'), {
        senderId: user.uid,
        text: messageText,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'matches', matchId), {
        lastMessage: messageText,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Sleek Chat Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-4 shadow-sm z-10">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50">
           <Image 
              src={otherUser?.photoUrl || `https://picsum.photos/seed/${matchId}/100/100`} 
              alt={otherUser?.displayName || 'Avatar'} 
              fill
              className="object-cover" 
              referrerPolicy="no-referrer"
            />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 leading-tight">{otherUser?.displayName || 'Resonator'}</h4>
          <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 bg-green-500 rounded-full" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active now</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-colors">
              <Info className="w-5 h-5" />
           </button>
           <button className="p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-colors">
              <MoreHorizontal className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 scroll-smooth bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(241,245,249,0.5)_100%)]"
      >
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-sm">
             <Sparkles className="w-3.5 h-3.5 text-rose-500" />
             <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Resonance achieved</span>
          </div>
        </div>
        
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-5 py-3.5 rounded-[24px] text-[15px] leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-rose-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modern Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 rounded-[28px] p-2 pl-4 border border-slate-100 ring-4 ring-slate-50/50">
          <button type="button" className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-transparent py-3 text-slate-900 text-sm font-medium focus:outline-none placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-90 shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
