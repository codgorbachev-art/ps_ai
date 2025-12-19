
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Terminal, Fingerprint, Loader2, Sparkles, Database, Cpu, Search, FileCheck, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ButtonGlow from './ui/ButtonGlow';
import { AppState, ScanResult, HistoryItem } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
  onCancel: () => void;
  history?: HistoryItem[];
}

const EXPERT_SYSTEM_INSTRUCTION = `
Ты — бескомпромиссная экспертная система "PureScan AI Pro" (v2.6) для глубокого аудита пищевой безопасности. 
Твоя задача: провести ЭКСТРЕМАЛЬНО ДЕТАЛЬНЫЙ анализ (+25% к стандартной подробности).

ПРИНЦИПЫ АНАЛИЗА:
1. СИНЕРГИЯ И КОМБО: Оценивай взаимодействие ингредиентов. Сахар + жиры = гиперпалатируемость.
2. ГЛУБОКИЙ АУДИТ (+5%): Анализируй наличие эндокринных дирижаблей (пластификаторы из упаковки, если применимо) и реальную биодоступность заявленных витаминов.
3. UPF ГРЕЙДИНГ: Шкала NOVA. Ультра-обработанная пища (UPF) — автоматический штраф -1.5 балла.
4. СКРЫТЫЕ ИМЕНА: Выявляй скрытые формы глютена, сои и сахара (лактоза, ячменный солод и т.д.).
5. ЯЗЫК: СТРОГО НА РУССКОМ.

АЛГОРИТМ SCORE:
- База: 10.0.
- Сахар/сиропы (>8г): -2.5.
- UPF статус (NOVA 4): -1.5.
- Синтетические Е-добавки высокого риска: -1.2 каждая.
- Пальмовое/рафинированные масла: -2.0.
- Бонус за отсутствие антислеживателей и наполнителей: +1.0.

СТРУКТУРА JSON:
{
  "fingerprint_material": "string",
  "product": { "name": "string", "brand": "string", "category": "string" },
  "analysis": { "score": number, "verdict": "string", "pros": ["string"], "cons": ["string"], "recommendation": "string" },
  "nutrition": { "kcal": number, "protein": number, "fat": number, "carbs": number, "sugar": number, "salt": number },
  "ingredients": { "items": [{ "name": "string", "canonicalName": "string", "status": "safe|neutral|risk|danger", "function": "string", "description": "string" }] },
  "additives": [{ "code": "string", "name": "string", "risk": "low|medium|high", "description": "string" }]
}`;

export const ScannerInterface: React.FC<ScannerProps> = ({ onScanComplete, onCancel, history = [] }) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState(0);
  const [ingredients, setIngredients] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performScan = async () => {
    setAppState(AppState.SCANNING);
    setProgress(0);
    const progInterval = setInterval(() => setProgress(p => p < 92 ? p + 0.7 : p), 100);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-pro-preview';
      
      const contents = imagePreview ? {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imagePreview.split(',')[1] } },
          { text: "Проведи максимально глубокий аудит состава. Ответ в JSON." }
        ]
      } : {
        parts: [{ text: `Аудит состава: ${ingredients}. Ответ строго в JSON.` }]
      };

      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction: EXPERT_SYSTEM_INSTRUCTION, responseMimeType: "application/json" }
      });

      if (response.text) {
        const raw = JSON.parse(response.text.trim());
        const result: ScanResult = {
          id: Date.now().toString(),
          fingerprint: raw.fingerprint_material,
          productName: raw.product?.name || 'Продукт',
          score: (raw.analysis?.score || 0).toString(),
          status: raw.analysis?.score >= 8 ? 'safe' : (raw.analysis?.score >= 5 ? 'warning' : 'danger'),
          verdict: raw.analysis?.verdict,
          details: raw.analysis?.recommendation,
          nutrients: [
            { label: 'Ккал', value: `${raw.nutrition?.kcal || 0}`, status: 'neutral', percentage: Math.min((raw.nutrition?.kcal / 10) || 0, 100) },
            { label: 'Сахар', value: `${raw.nutrition?.sugar || 0}г`, status: raw.nutrition?.sugar > 10 ? 'bad' : 'good', percentage: Math.min((raw.nutrition?.sugar * 2) || 0, 100) }
          ],
          ingredients: (raw.ingredients?.items || []).map((i: any) => ({ ...i, status: i.status || 'neutral' })),
          additives: (raw.additives || []).map((a: any) => ({ ...a, riskLevel: a.risk || 'medium' })),
          pros: raw.analysis?.pros || [],
          cons: raw.analysis?.cons || [],
          imageUrl: imagePreview
        };

        setProgress(100);
        setTimeout(() => onScanComplete(result), 800);
      }
    } catch (e) {
      console.error(e);
      setAppState(AppState.IDLE);
      alert("Ошибка при разборе состава. Попробуйте загрузить более четкое фото.");
    } finally {
      clearInterval(progInterval);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {appState === AppState.IDLE && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl glass-panel p-8 rounded-[3rem] relative border-t border-white/10 shadow-2xl">
            <button onClick={onCancel} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4"><div className="p-3 bg-brand-cyan/10 rounded-2xl border border-brand-cyan/20"><Sparkles className="w-6 h-6 text-brand-cyan" /></div></div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">PURESCAN AI PRO</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Глубокий аудит безопасности продукта</p>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className={`w-full h-64 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all mb-8 relative group overflow-hidden ${imagePreview ? 'border-brand-cyan bg-brand-cyan/5' : 'border-white/5 hover:border-brand-cyan/40 hover:bg-white/5'}`}>
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover opacity-60" /> : <div className="flex flex-col items-center"><Camera className="w-14 h-14 text-gray-700 mb-4 group-hover:text-brand-cyan transition-all" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Загрузить фото этикетки</span></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
            <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Или вставьте текст состава вручную..." className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] p-6 text-white placeholder:text-gray-800 focus:outline-none focus:border-brand-cyan/40 h-32 text-xs resize-none mb-8 transition-all font-mono" />
            <ButtonGlow onClick={performScan} className="w-full !rounded-2xl !py-5">ЗАПУСТИТЬ АУДИТ</ButtonGlow>
          </motion.div>
        )}
        {appState === AppState.SCANNING && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full max-w-lg">
            <div className="relative w-64 h-64 mb-16">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute inset-[-10px] border-[1px] border-dashed border-brand-cyan/20 rounded-full" />
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-md border border-white/5">
                 <div className="text-center relative">
                   <div className="text-6xl font-black text-white tracking-tighter tabular-nums">{Math.round(progress)}%</div>
                   <div className="text-[8px] font-black text-brand-cyan uppercase tracking-[0.6em] mt-3">Analyzing</div>
                   <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute -left-10 -right-10 h-[1px] bg-brand-cyan/40 shadow-[0_0_15px_#00f0ff] z-20 pointer-events-none" />
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerInterface;
