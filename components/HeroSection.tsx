import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-tet-red-light via-soft-bg to-tet-gold-light text-center px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        {/* Soft floating orbs */}
        <div className="absolute top-10 left-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-float"></div>
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-tet-gold/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Decorative Circles pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#D32F2F 0.5px, transparent 0.5px)', backgroundSize: '30px 30px', opacity: 0.1 }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Main Title */}
        <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-hand text-primary animate-sway">Chào Xuân Mới</h2>
            <h1 className="text-6xl md:text-9xl font-serif font-bold text-gradient drop-shadow-sm">
            Tết 2026
            </h1>
            <div className="text-xl md:text-2xl text-text-main/80 font-serif tracking-[0.2em] uppercase mt-4 border-y border-text-main/20 py-2 inline-block">
            Bính Ngọ Như Ý
            </div>
        </div>

        <p className="text-lg md:text-xl text-text-main/70 max-w-2xl mx-auto leading-relaxed font-sans">
          "Ngựa phi đường xa, mang lộc về nhà"
          <br />
          <span className="text-base text-text-main/60 mt-2 block">
            Gửi trao lời chúc bình an & thịnh vượng với sự hỗ trợ từ AI.
          </span>
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group relative px-10 py-4 bg-tet-red text-white rounded-full font-bold shadow-lg shadow-tet-red/30 hover:shadow-tet-red/50 hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            Viết Lời Chúc Ngay <ArrowDown className="w-5 h-5 animate-bounce" />
          </span>
        </button>
      </div>
      
      {/* Decorative Year */}
      <div className="absolute bottom-0 w-full overflow-hidden">
        <svg viewBox="0 0 1440 320" className="w-full h-auto text-white fill-current opacity-50">
           <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;