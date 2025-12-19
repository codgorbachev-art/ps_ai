
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, HistoryItem } from '../../types';
import { Crown, History, TrendingUp, Plus, ArrowRight, Activity, Zap, Sparkles, Calendar, Tag, ChevronRight } from 'lucide-react';
import ButtonGlow from '../ui/ButtonGlow';

export const DashboardView: React.FC<{ 
  user: User; 
  history: HistoryItem[]; 
  onScan: () => void; 
  onUpgrade: () => void;
  onHistoryClick: (item: HistoryItem) => void;
}> = ({ user, history, onScan, onUpgrade, onHistoryClick }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const stats = useMemo(() => {
    const avgScore = history.length > 0 
      ? (history.reduce((acc, curr) => acc + parseFloat(curr.score), 0) / history.length)
      : 0;
    
    return {
      total: history.length,
      avg: avgScore.toFixed(1),
      avgNum: avgScore
    };
  }, [history]);

  const chartData = useMemo(() => {
     return [...history].slice(0, 10).reverse().map((item) => ({
        id: item.id,
        score: parseFloat(item.score),
        name: item.productName,
        date: item.date,
        rawResult: item.rawResult
     }));
  }, [history]);

  const width = 100;
  const height = 40;
  
  const points = chartData.map((d, i) => {
    const x = chartData.length > 1 ? (i / (chartData.length - 1)) * width : 50;
    const y = height - (d.score / 10) * height; 
    return { x, y, ...d };
  });

  const getBezierPath = (pts: any[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const pathD = getBezierPath(points);
  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length-1].x},${height} L ${points[0].x},${height} Z`
    : '';

  const circleRadius = 28;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (stats.avgNum / 10) * circleCircumference;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 md:space-y-10 pb-12 px-2 sm:px-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Привет, <span className="text-gradient-brand">{user.name}</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium opacity-80">Продукты под контролем AI.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] backdrop-blur-md">
             {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
           </span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-[2.5rem] relative overflow-hidden group border-t border-white/10 flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/15 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Тариф</p>
            <h3 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
              {user.plan}
              {user.plan !== 'FREE' && <Crown className="w-5 h-5 text-brand-purple fill-brand-purple" />}
            </h3>
          </div>
          {user.plan === 'FREE' && (
             <button onClick={onUpgrade} className="relative z-10 mt-auto flex items-center gap-2 text-[10px] font-black text-brand-purple hover:text-brand-cyan transition-all uppercase tracking-widest pt-4">
               Upgrade <ChevronRight className="w-3 h-3" />
             </button>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-[2.5rem] relative overflow-hidden group border-t border-white/10 flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-cyan/15 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Активность</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{stats.total} <span className="text-sm font-bold text-gray-500 tracking-normal ml-1">сканов</span></h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-[2.5rem] border-t border-white/10 flex items-center justify-between min-h-[160px] sm:col-span-2 lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Health IQ</p>
              <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">{stats.avg}</h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black inline-flex items-center gap-2 border ${
              stats.avgNum >= 8 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            } uppercase tracking-widest`}>
               {stats.avgNum >= 8 ? 'ОТЛИЧНО' : 'ЕСТЬ РИСКИ'}
            </div>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r={circleRadius} stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                <motion.circle 
                  cx="50%" cy="50%" r={circleRadius} 
                  stroke={stats.avgNum >= 8 ? '#00f0ff' : '#ef4444'} 
                  strokeWidth="6" fill="transparent" strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  animate={{ strokeDashoffset: circleOffset }}
                  transition={{ duration: 1.5 }}
                />
             </svg>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
           className="lg:col-span-2 glass-panel p-10 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black flex items-center gap-3 text-white uppercase tracking-widest">
              <TrendingUp className="w-5 h-5 text-brand-cyan" /> Динамика Качества
            </h3>
          </div>

          <div className="relative h-64 w-full">
            {chartData.length > 1 ? (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradientMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7000ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path d={areaD} fill="url(#chartGradientMain)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                <motion.path d={pathD} fill="none" stroke="#00f0ff" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                {points.map((p, i) => (
                  <circle 
                    key={p.id} cx={p.x} cy={p.y} r="1.2" fill="#00f0ff"
                    onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => onHistoryClick({ id: p.id, date: p.date, productName: p.name, score: p.score.toString(), status: 'safe', rawResult: p.rawResult })}
                    className="cursor-pointer hover:r-2 transition-all"
                  />
                ))}
              </svg>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-800 opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Мало данных для статистики</p>
               </div>
            )}
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
           className="flex flex-col gap-6"
        >
          <div 
             onClick={onScan}
             className="flex-1 glass-panel p-8 rounded-[3rem] border border-dashed border-white/10 hover:border-brand-cyan/40 cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center text-center"
          >
             <div className="w-20 h-20 rounded-3xl bg-brand-cyan flex items-center justify-center shadow-[0_10px_40px_rgba(0,240,255,0.3)] group-hover:scale-110 transition-transform">
               <Plus className="w-10 h-10 text-black" />
             </div>
             <h3 className="text-xl font-black text-white mt-8 tracking-tighter uppercase">Новый Анализ</h3>
          </div>
          
          <ButtonGlow onClick={onUpgrade} variant="secondary" className="!w-full !rounded-[2rem] !py-6">
             <Crown className="w-4 h-4 text-brand-purple" /> Перейти на PRO
          </ButtonGlow>
        </motion.div>
      </div>

      {/* History */}
      <div className="grid grid-cols-1 gap-4 pt-6">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-4">История</h3>
        {history.slice(0, 5).map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            onClick={() => onHistoryClick(item)}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all cursor-pointer group border border-white/5"
          >
            <div className="flex items-center gap-6">
              <div className={`w-1.5 h-10 rounded-full ${
                item.status === 'safe' ? 'bg-green-500' : item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              } shadow-[0_0_10px_currentColor] opacity-60`} />
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-bold text-white group-hover:text-brand-cyan transition-colors truncate text-base">{item.productName}</h4>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-1">{item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-black text-white tabular-nums bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">{item.score}</span>
              <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
