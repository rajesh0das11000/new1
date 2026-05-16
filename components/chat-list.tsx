'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { MessageSquare, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface Match {
  id: string;
  userIds: string[];
  lastMessage?: string;
  updatedAt: any;
  otherUser?: any;
}

export default function ChatList({ onSelectMatch }: { onSelectMatch: (id: string) => void }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'matches'),
      where('userIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const matchData = await Promise.all(snapshot.docs.map(async (matchDoc) => {
        const data = matchDoc.data();
        const otherUserId = data.userIds.find((id: string) => id !== user.uid);
        const userRef = doc(db, 'profiles', otherUserId);
        const userSnap = await getDoc(userRef);
        const otherUser = userSnap.exists() ? userSnap.data() : null;

        return {
          id: matchDoc.id,
          ...data,
          otherUser,
        } as Match;
      }));
      setMatches(matchData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-slate-50">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
          <MessageSquare className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">The silence of potential...</h3>
        <p className="text-slate-500 max-w-xs leading-relaxed text-sm">Start discovering and matching with others to begin your conversations.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="px-6 py-10 lg:px-0">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Messages</h2>
          <p className="text-slate-500 font-medium">Genuine connections in real-time.</p>
        </div>
        
        <div className="space-y-3 px-4 lg:px-0">
          {matches.map((match, index) => (
            <motion.button
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectMatch(match.id)}
              className="w-full flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:shadow-slate-200/50 hover:scale-[1.01] transition-all text-left group"
            >
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50">
                  <Image 
                    src={match.otherUser?.photoUrl || `https://picsum.photos/seed/${match.id}/100/100`} 
                    alt={match.otherUser?.displayName || 'Resonator'} 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-lg text-slate-900 truncate flex items-center gap-2">
                    {match.otherUser?.displayName || 'Resonator'}
                    {match.otherUser?.aura && (
                       <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-bold uppercase tracking-wider rounded">AI</span>
                    )}
                  </h4>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold whitespace-nowrap">
                    2m ago
                  </span>
                </div>
                <p className="text-slate-500 text-sm truncate pr-4 italic">
                  {match.lastMessage || `You connected with ${match.otherUser?.displayName}!`}
                </p>
              </div>

              <div className="shrink-0 text-slate-300 group-hover:text-rose-500 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
