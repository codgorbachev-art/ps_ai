
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
      await new Promise(r => setTimeout(r, 1000));
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
        link.download = `PureScan_Story.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (err) { alert('Ошибка экспорта.'); } finally { setIsSharing(false); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 px-4 pt-2">
      {/* PERFECT 9:16 STORY TEMPLATE */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div id="story-container" ref={storyRef} style={{ width: '1080px', height: '1920px' }} className="bg-[#020202] flex flex-col items-center text-white font-sans relative overflow-hidden">
          <div className="absolute inset-0">
             <div className={`absolute inset-0 opacity-40 ${
               category === 'GOOD' ? 'bg-[radial-gradient(circle_at_20%_20%,_#064e3b_0%,_transparent_60%)]' :
               category === 'MEDIUM' ? 'bg-[radial-gradient(circle_at_20%_20%,_#78350f_0%,_transparent_60%)]' :
               'bg-[radial-gradient(circle_at_20%_20%,_#7f1d1d_0%,_transparent_60%)]'
             }`} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-white/[0.02] rounded-full blur-[250px]" />
          </div>

          <div className="relative z-10 w-full h-full flex flex-col p-24 justify-between items-center text-center">
            <div className="flex flex-col items-center gap-10 mt-10">
              <div className="w-44 h-44 bg-white text-black rounded-[4rem] flex items-center justify-center font-black text-8xl shadow-2xl relative">
                PS <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-brand-cyan rounded-2xl flex items-center justify-center"><Sparkles className="w-8 h-8 text-black" /></div>
              </div>
              <span className="text-4xl font-black tracking-[0.8em] text-white/40 uppercase italic">PURESCAN PRO</span>
            </div>

            <h1 className={`font-black tracking-tighter text-white uppercase italic drop-shadow-[0_40px_80px_rgba(0,0,0,1)] px-10 ${
              (result.productName?.length || 0) > 20 ? 'text-[110px]' : 'text-[160px]'
            }`}>
              {result.productName}
            </h1>

            <div className="relative w-[700px] h-[700px] flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="350" cy="350" r="310" stroke="rgba(255,255,255,0.03)" strokeWidth="70" fill="transparent" />
                  <circle cx="350" cy="350" r="310" stroke={scoreColor} strokeWidth="70" fill="transparent" strokeLinecap="round" strokeDasharray="1947" strokeDashoffset={1947 - (scoreNum/10)*1947} style={{ filter: `drop-shadow(0 0 60px ${scoreColor})` }} />
               </svg>
               <div className="flex flex-col items-center z-10">
                  <span className="text-[340px] font-black leading-none text-white drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]">{result.score}</span>
                  <span className="text-4xl font-black uppercase tracking-[1.4em] text-white/30 -mt-6">HEALTH INDEX</span>
               </div>
            </div>

            <div className={`text-7xl font-black py-16 px-32 rounded-[6rem] border-[16px] uppercase tracking-[0.5em] italic shadow-2xl backdrop-blur-3xl ${
              category === 'GOOD' ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/25' : 
              category === 'MEDIUM' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/25' : 
              'border-red-500 text-red-500 bg-red-500/25'
            }`}>
              {result.verdict}
            </div>

            <div className="w-full grid grid-cols-2 gap-12 px-10">
               <div className="bg-white/5 backdrop-blur-3xl border-2 border-white/10 p-20 rounded-[7rem] flex flex-col items-center gap-10">
                 <ShieldCheck className="w-32 h-32 text-green-400" />
                 <p className="text-[42px] font-black uppercase leading-tight italic">{result.pros[0] || 'БЕЗОПАСНО'}</p>
               </div>
               <div className="bg-white/5 backdrop-blur-3xl border-2 border-white/10 p-20 rounded-[7rem] flex flex-col items-center gap-10">
                 <AlertTriangle className="w-32 h-32 text-red-500" />
                 <p className="text-[42px] font-black uppercase leading-tight italic">{result.cons[0] || 'ЕСТЬ РИСКИ'}</p>
               </div>
            </div>

            <div className="flex items-center gap-10 opacity-70 mb-10"><Zap className="w-20 h-20 text-brand-cyan fill-brand-cyan" /><span className="text-6xl font-black uppercase tracking-[1.2em] italic">PURESCAN.AI</span></div>
          </div>
        </div>
      </div>

      {/* RESULT DASHBOARD */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 md:p-12 rounded-[4rem] mb-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 border-t border-white/15 shadow-2xl">
        <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
              <circle stroke="rgba(255, 255, 255, 0.03)" strokeWidth="16" fill="transparent" r="85" cx="100" cy="100" />
              <motion.circle stroke={scoreColor} strokeWidth="16" strokeDasharray="534" strokeDashoffset={534 - (scoreNum / 10) * 534} strokeLinecap="round" fill="transparent" r="85" cx="100" cy="100" initial={{ strokeDashoffset: 534 }} animate={{ strokeDashoffset: 534 - (scoreNum / 10) * 534 }} transition={{ duration: 1.5 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-6xl font-black text-white tabular-nums">{result.score}</span>
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-cyan/60 mt-2">INDEX</span>
            </div>
        </div>
        <div className="flex-1 text-center lg:text-left z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-none">{result.productName}</h1>
            <div className={`inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] bg-black/50 border ${category === 'GOOD' ? 'border-green-500/40 text-green-400' : category === 'MEDIUM' ? 'border-yellow-400/40 text-yellow-400' : 'border-red-500/40 text-red-500'}`}>{result.verdict}</div>
          </div>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
            <ButtonGlow onClick={handleShare} isLoading={isSharing} className="!px-12 !rounded-3xl !py-5"><Share2 className="w-5 h-5" /> ЭКСПОРТ STORY</ButtonGlow>
            <ButtonGlow variant="secondary" onClick={onScanNew} className="!px-10 !rounded-3xl !py-5">НОВЫЙ СКАН</ButtonGlow>
          </div>
        </div>
      </motion.div>

      {/* MODERN TABS */}
      <div className="flex p-2 bg-white/[0.04] border border-white/10 rounded-[3rem] mb-12 sticky top-28 z-30 backdrop-blur-3xl shadow-xl">
        {(['overview', 'ingredients', 'nutrients'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4.5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all relative group ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === tab ? (
              <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-gradient-to-r from-brand-cyan/30 to-brand-purple/30 border border-white/15 rounded-[2.5rem] shadow-lg" />
            ) : (
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] rounded-[2.5rem] transition-colors" />
            )}
            <span className="relative z-10 flex items-center justify-center gap-3">{tab === 'overview' ? 'ОБЗОР' : tab === 'ingredients' ? 'СОСТАВ' : 'КБЖУ'}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="grid grid-cols-1 gap-10">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="glass-panel p-10 rounded-[3.5rem] bg-green-500/[0.03] border-white/10">
                <h3 className="text-green-400 text-[11px] font-black uppercase tracking-[0.5em] mb-10"><ShieldCheck className="w-5 h-5 inline mr-3" /> ПРЕИМУЩЕСТВА</h3>
                {result.pros.map((p, i) => (<div key={i} className="flex gap-4 text-base text-gray-300 mb-4"><Check className="w-5 h-5 text-green-500 shrink-0" />{p}</div>))}
              </div>
              <div className="glass-panel p-10 rounded-[3.5rem] bg-red-500/[0.03] border-white/10">
                <h3 className="text-red-400 text-[11px] font-black uppercase tracking-[0.5em] mb-10"><AlertTriangle className="w-5 h-5 inline mr-3" /> РИСКИ</h3>
                {result.cons.map((c, i) => (<div key={i} className="flex gap-4 text-base text-gray-300 mb-4"><X className="w-5 h-5 text-red-500 shrink-0" />{c}</div>))}
              </div>
              {result.additives.length > 0 && (
                <div className="md:col-span-2 space-y-6">
                   <h3 className="text-brand-purple text-[11px] font-black uppercase tracking-[0.5em] px-6">ИНДЕКС ДОБАВОК</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {result.additives.map((add, idx) => (
                        <motion.div key={idx} whileHover={{ scale: 1.05 }} className="glass-panel p-8 rounded-[2.5rem] bg-white/[0.03] hover:bg-white/[0.08] transition-all group border-white/10 shadow-lg">
                           <div className="flex justify-between items-start mb-5">
                              <span className="text-[10px] font-black text-brand-purple bg-brand-purple/20 px-4 py-2 rounded-2xl border border-brand-purple/30">{add.code}</span>
                              <div className={`w-4 h-4 rounded-full ${add.riskLevel === 'high' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : add.riskLevel === 'medium' ? 'bg-yellow-500 shadow-[0_0_15px_#facc15]' : 'bg-green-500 shadow-[0_0_15px_#22c55e]'}`} />
                           </div>
                           <h4 className="font-black text-base text-white mb-3 group-hover:text-brand-purple transition-colors">{add.name}</h4>
                           <p className="text-xs text-gray-500 leading-relaxed">{add.description}</p>
                        </motion.div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              {result.ingredients.map((item, i) => (
                <div key={i} className={`glass-panel rounded-[2.5rem] border border-white/10 overflow-hidden transition-all duration-300 ${expandedIngredient === `ing-${i}` ? 'bg-white/[0.06]' : ''}`}>
                  <div onClick={() => setExpandedIngredient(expandedIngredient === `ing-${i}` ? null : `ing-${i}`)} className="p-8 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className={`w-4 h-4 rounded-full ${item.status === 'danger' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : item.status === 'risk' ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : 'bg-green-500 shadow-[0_0_15px_#22c55e]'}`} />
                      <div><span className="font-black text-white text-lg">{item.name}</span><p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.function}</p></div>
                    </div>
                    <ChevronDown className={`w-6 h-6 text-gray-600 transition-transform ${expandedIngredient === `ing-${i}` ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedIngredient === `ing-${i}` && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="p-10 border-t border-white/5 text-gray-300 text-base leading-relaxed">{item.description}</motion.div>}
                </div>
              ))}
            </div>
          )}
          {activeTab === 'nutrients' && (
            <div className="glass-panel p-12 md:p-16 rounded-[4rem] border-white/10 space-y-16 shadow-inner">
               {result.nutrients.map((n, i) => (
                  <div key={i} className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div><span className="text-[11px] font-black uppercase text-gray-600 tracking-[0.4em]">{n.label}</span><span className="block text-4xl font-black text-white tabular-nums tracking-tighter">{n.value}</span></div>
                      <div className={`px-5 py-2 rounded-2xl border font-black text-[10px] uppercase tracking-widest ${n.status === 'good' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>НОРМА</div>
                    </div>
                    <div className="h-4 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/10 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: `${n.percentage || 50}%` }} transition={{ duration: 1.5 }} className={`h-full rounded-full ${n.status === 'bad' ? 'bg-red-500' : 'bg-gradient-to-r from-brand-cyan to-brand-purple'}`} /></div>
                  </div>
               ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
