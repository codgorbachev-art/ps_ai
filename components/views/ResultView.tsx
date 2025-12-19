
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanResult, IngredientItem } from '../../types';
import ButtonGlow from '../ui/ButtonGlow';
import html2canvas from 'html2canvas';
import { 
  Check, 
  ChevronDown, 
  X, 
  Activity, 
  Sparkles, 
  FlaskConical, 
  ShieldAlert, 
  Zap, 
  Leaf, 
  Droplets, 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  Microscope, 
  Share2 
} from 'lucide-react';

export const ResultView: React.FC<{ result: ScanResult; onBack: () => void; onScanNew: () => void }> = ({ result, onBack, onScanNew }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'nutrients'>('overview');
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const scoreNum = parseFloat(result.score || '0');
  const scoreColor = scoreNum >= 8 ? '#00f0ff' : scoreNum >= 5 ? '#facc15' : '#ef4444';
  const category = scoreNum >= 8 ? 'GOOD' : scoreNum >= 5 ? 'MEDIUM' : 'BAD';

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      if (storyRef.current) {
        const canvas = await html2canvas(storyRef.current, {
          backgroundColor: '#020202',
          scale: 3,
          useCORS: true,
          width: 1080,
          height: 1920,
          onclone: (doc) => {
            const el = doc.getElementById('story-container');
            if(el) el.style.display = 'flex';
          }
        });
        const link = document.createElement('a');
        link.download = `PureScan_Story_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (err) { alert('Ошибка экспорта изображения.'); } finally { setIsSharing(false); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 px-4 pt-2">
      {/* IMPROVED 9:16 STORY TEMPLATE */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div id="story-container" ref={storyRef} style={{ width: '1080px', height: '1920px' }} className="bg-[#020202] flex flex-col items-center text-white font-sans relative overflow-hidden">
          <div className="absolute inset-0">
             <div className={`absolute inset-0 opacity-50 ${
               category === 'GOOD' ? 'bg-[radial-gradient(circle_at_50%_20%,_#064e3b_0%,_transparent_70%)]' :
               category === 'MEDIUM' ? 'bg-[radial-gradient(circle_at_50%_20%,_#78350f_0%,_transparent_70%)]' :
               'bg-[radial-gradient(circle_at_50%_20%,_#7f1d1d_0%,_transparent_70%)]'
             }`} />
             <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black via-transparent to-transparent" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1500px] h-[1500px] bg-white/[0.015] rounded-full blur-[300px]" />
          </div>

          <div className="relative z-10 w-full h-full flex flex-col p-24 justify-between items-center text-center">
            {/* Logo */}
            <div className="flex flex-col items-center gap-12 mt-12">
              <div className="w-48 h-48 bg-white text-black rounded-[4.5rem] flex items-center justify-center font-black text-[100px] shadow-[0_40px_80px_rgba(255,255,255,0.3)]">
                PS
              </div>
              <span className="text-4xl font-black tracking-[1em] text-white/50 uppercase italic">PURESCAN PRO</span>
            </div>

            {/* Product Name with symmetric spacing */}
            <div className="w-full flex justify-center items-center h-[350px]">
              <h1 className={`font-black tracking-tighter text-white uppercase italic drop-shadow-[0_40px_80px_rgba(0,0,0,1)] leading-[0.85] ${
                (result.productName?.length || 0) > 20 ? 'text-[110px]' : 'text-[160px]'
              }`}>
                {result.productName}
              </h1>
            </div>

            {/* Centered Score */}
            <div className="relative w-[750px] h-[750px] flex items-center justify-center my-10">
               <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="375" cy="375" r="330" stroke="rgba(255,255,255,0.03)" strokeWidth="85" fill="transparent" />
                  <circle cx="375" cy="375" r="330" stroke={scoreColor} strokeWidth="85" fill="transparent" strokeLinecap="round" strokeDasharray="2073" strokeDashoffset={2073 - (scoreNum/10)*2073} style={{ filter: `drop-shadow(0 0 80px ${scoreColor})` }} />
               </svg>
               <div className="flex flex-col items-center z-10">
                  <span className="text-[360px] font-black leading-none text-white drop-shadow-[0_60px_100px_rgba(0,0,0,0.8)] tabular-nums">{result.score}</span>
                  <span className="text-4xl font-black uppercase tracking-[1.5em] text-white/30 -mt-8 italic">HEALTH SCORE</span>
               </div>
            </div>

            {/* Verdict */}
            <div className={`text-8xl font-black py-16 px-36 rounded-[7rem] border-[18px] uppercase tracking-[0.4em] italic shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl ${
              category === 'GOOD' ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/25' : 
              category === 'MEDIUM' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/25' : 
              'border-red-500 text-red-500 bg-red-500/25'
            }`}>
              {result.verdict}
            </div>

            {/* Highlights with improved contrast */}
            <div className="w-full grid grid-cols-2 gap-16 px-10 mb-10">
               <div className="bg-black/60 backdrop-blur-3xl border-4 border-white/20 p-20 rounded-[8rem] flex flex-col items-center gap-10 shadow-2xl">
                 <ShieldCheck className="w-36 h-36 text-green-400" />
                 <p className="text-[44px] font-black uppercase tracking-tighter text-white/90 leading-tight italic">{result.pros[0] || 'БЕЗОПАСНО'}</p>
               </div>
               <div className="bg-black/60 backdrop-blur-3xl border-4 border-white/20 p-20 rounded-[8rem] flex flex-col items-center gap-10 shadow-2xl">
                 <AlertTriangle className="w-36 h-36 text-red-500" />
                 <p className="text-[44px] font-black uppercase tracking-tighter text-white/90 leading-tight italic">{result.cons[0] || 'ЕСТЬ РИСКИ'}</p>
               </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-10 opacity-60 mb-12">
              <Zap className="w-24 h-24 text-brand-cyan fill-brand-cyan" />
              <span className="text-7xl font-black uppercase tracking-[1.5em] italic">PURESCAN.AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD UI