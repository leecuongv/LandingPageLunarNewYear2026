import React, { useRef, useState } from 'react';
import HeroSection from './components/HeroSection';
import CardCreator from './components/CardCreator';
import Oracle from './components/Oracle';
import TravelMap from './components/TravelMap';
import { Flower } from 'lucide-react';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const creatorRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => {
        creatorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-soft-bg text-text-main font-sans selection:bg-tet-gold selection:text-white">
        {!started ? (
            <HeroSection onStart={handleStart} />
        ) : (
            <div className="animate-in fade-in duration-1000">
                <HeroSection onStart={() => creatorRef.current?.scrollIntoView({ behavior: 'smooth' })} />
                
                <div ref={creatorRef} className="container mx-auto px-4 py-12">
                    {/* Section Separator */}
                    <div className="flex items-center justify-center gap-4 my-12 opacity-70">
                        <div className="h-px bg-tet-red/30 w-24"></div>
                        <Flower className="w-6 h-6 text-tet-red animate-spin-slow" />
                        <div className="text-tet-red font-serif italic text-lg">Tạo Thiệp Xuân</div>
                        <Flower className="w-6 h-6 text-tet-red animate-spin-slow" />
                        <div className="h-px bg-tet-red/30 w-24"></div>
                    </div>
                    
                    <CardCreator />

                    {/* Section Separator */}
                    <div className="flex items-center justify-center gap-4 my-20 opacity-70">
                        <div className="h-px bg-tet-gold w-24"></div>
                        <div className="text-tet-gold font-serif italic text-lg">Gieo Quẻ & Du Xuân</div>
                        <div className="h-px bg-tet-gold w-24"></div>
                    </div>

                    <Oracle />
                    <TravelMap />
                    
                    <footer className="mt-20 py-8 text-center text-gray-500 border-t border-gray-200">
                        <p className="font-serif italic">
                            © 2026 Xuân Bính Ngọ - Powered by Gemini API
                        </p>
                    </footer>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;