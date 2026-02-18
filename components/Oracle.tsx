import React, { useState } from 'react';
import { generateOraclePrediction } from '../services/geminiService';
import { Sparkles, ScrollText } from 'lucide-react';

const Oracle: React.FC = () => {
  const [luckyNumber, setLuckyNumber] = useState<number | ''>('');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!luckyNumber) return;
    setLoading(true);
    const result = await generateOraclePrediction(Number(luckyNumber));
    setPrediction(result);
    setLoading(false);
  };

  return (
    <div className="my-12 p-8 md:p-12 bg-tet-red-light/30 border-2 border-dashed border-tet-red/20 rounded-3xl max-w-3xl mx-auto relative overflow-hidden">
      
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-serif font-bold text-tet-red flex items-center justify-center gap-3">
          <ScrollText className="w-8 h-8" /> Xin Xăm Đầu Năm
        </h2>
        <p className="text-gray-600 mt-2 font-serif italic">Chọn một con số may mắn, nhận lời khuyên an lành.</p>
      </div>

      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="relative">
            <input
            type="number"
            value={luckyNumber}
            onChange={(e) => setLuckyNumber(Number(e.target.value))}
            placeholder="Số may mắn (0-99)"
            className="w-48 bg-white border-2 border-tet-gold rounded-full text-center text-3xl py-4 text-tet-red font-bold focus:outline-none focus:ring-4 focus:ring-tet-gold/20 shadow-inner placeholder:text-gray-300"
            />
        </div>

        <button
          onClick={handlePredict}
          disabled={loading || !luckyNumber}
          className={`px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all shadow-md ${
            loading || !luckyNumber
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-tet-red text-white hover:bg-red-700 hover:shadow-lg'
          }`}
        >
          {loading ? <span className="flex items-center gap-2"><Sparkles className="animate-spin w-4 h-4"/> Đang luận giải...</span> : 'Gieo Quẻ'}
        </button>

        {prediction && (
          <div className="mt-8 p-8 bg-[#fffdf0] border border-[#e8dcc5] shadow-xl w-full max-w-lg mx-auto relative animate-in zoom-in-95 duration-500 rotate-1">
            {/* Decorative corner */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-tet-red"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-tet-red"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-tet-red"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-tet-red"></div>

            <h3 className="text-tet-gold font-bold mb-4 text-center font-serif uppercase tracking-widest text-sm">Lời Vàng Ý Ngọc</h3>
            <p className="text-xl text-center text-text-main font-hand leading-loose">
                "{prediction}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Oracle;