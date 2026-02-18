import React, { useState, useRef, useEffect } from 'react';
import { WishStyle, GeneratedCardData } from '../types';
import { generateNewYearWish, generateCardBackground, generateVoiceWish } from '../services/geminiService';
import { Wand2, Image as ImageIcon, Volume2, QrCode, Download, Share2, Pause, Play, RefreshCw, PenTool } from 'lucide-react';

const CardCreator: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Creation, 2: Preview/Finalize
  
  // Inputs
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [style, setStyle] = useState<WishStyle>(WishStyle.TRADITIONAL);
  const [bgDesc, setBgDesc] = useState('Vườn hoa đào ngày xuân, màu nước nhẹ nhàng');
  
  // Generated Data
  const [wish, setWish] = useState('');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);

  // Status
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Canvas Ref for merging
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleGenerateWish = async () => {
    if (!recipient || !sender) return alert("Vui lòng nhập tên người gửi và người nhận.");
    setIsGeneratingWish(true);
    const text = await generateNewYearWish(recipient, style, sender);
    setWish(text);
    setIsGeneratingWish(false);
    
    // Auto generate voice when wish changes
    setIsGeneratingVoice(true);
    const buffer = await generateVoiceWish(text);
    setAudioBuffer(buffer);
    setIsGeneratingVoice(false);
  };

  const handleGenerateBg = async () => {
    setIsGeneratingBg(true);
    const url = await generateCardBackground(bgDesc);
    setBgImage(url);
    setIsGeneratingBg(false);
  };

  const handlePlayAudio = () => {
    if (!audioBuffer) return;
    
    if (isPlayingAudio && sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        setIsPlayingAudio(false);
        return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Re-create source node as they are one-time use
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlayingAudio(false);
    source.start();
    sourceNodeRef.current = source;
    setIsPlayingAudio(true);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw final canvas
  useEffect(() => {
    if (step === 2 && canvasRef.current && bgImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImage;
      img.onload = () => {
        // Set canvas size
        canvas.width = 1000;
        canvas.height = 1000;

        // Draw Background
        ctx.drawImage(img, 0, 0, 1000, 1000);

        // Soft Overlay (Gradient) for readability
        const gradient = ctx.createLinearGradient(0, 0, 0, 1000);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(50, 50, 900, 900);
        
        // Border styling (Decorative Frame)
        ctx.strokeStyle = '#D32F2F'; // Red
        ctx.lineWidth = 3;
        ctx.strokeRect(70, 70, 860, 860);
        ctx.strokeStyle = '#FBC02D'; // Gold
        ctx.lineWidth = 1;
        ctx.strokeRect(80, 80, 840, 840);

        // Text Styling
        ctx.textAlign = 'center';
        
        // Header
        ctx.font = 'bold 50px "Playfair Display", serif';
        ctx.fillStyle = '#D32F2F';
        ctx.fillText("Chúc Mừng Năm Mới", 500, 180);
        ctx.font = 'italic 30px "Playfair Display", serif';
        ctx.fillStyle = '#FBC02D';
        ctx.fillText("Xuân Bính Ngọ 2026", 500, 230);

        // Wish Text (Wrap text)
        ctx.font = '40px "Dancing Script", cursive';
        ctx.fillStyle = '#4E342E';
        const words = wish.split(' ');
        let line = '';
        let y = 350;
        const maxWidth = 700;
        
        for(let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, 500, y);
            line = words[n] + ' ';
            y += 60;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 500, y);

        // From/To
        y += 120;
        ctx.font = 'bold 24px "Nunito", sans-serif';
        ctx.fillStyle = '#D32F2F';
        ctx.fillText(`Kính gửi: ${recipient}`, 500, y);
        y += 40;
        ctx.fillText(`Từ: ${sender}`, 500, y);

        // Draw QR if exists
        if (qrImage) {
            const qr = new Image();
            qr.src = qrImage;
            qr.onload = () => {
                ctx.drawImage(qr, 425, 750, 150, 150); // Bottom center
                
                // QR Label
                ctx.font = '16px "Nunito", sans-serif';
                ctx.fillStyle = '#4E342E';
                ctx.fillText("Lì xì may mắn", 500, 740);
            }
        }
      };
    }
  }, [step, bgImage, wish, recipient, sender, qrImage]);

  const handleDownload = () => {
    if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = `ThiepTet2026-${recipient}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
    }
  };

  return (
    <div id="create-section" className="w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Controls */}
        <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
          
          {/* Card 1: Wish */}
          <div className="bg-white p-8 rounded-2xl paper-shadow border border-gray-100">
            <h2 className="text-2xl font-serif font-bold mb-6 text-tet-red flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-tet-red-light flex items-center justify-center text-tet-red">1</span>
              Lời Chúc Ý Nghĩa
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-sm text-gray-500 font-bold ml-1">Người nhận</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-text-main focus:border-tet-red focus:ring-1 focus:ring-tet-red outline-none transition-all" 
                      placeholder="VD: Ông Bà, Cha Mẹ..." 
                      value={recipient} onChange={e => setRecipient(e.target.value)}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm text-gray-500 font-bold ml-1">Người gửi</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-text-main focus:border-tet-red focus:ring-1 focus:ring-tet-red outline-none transition-all" 
                      placeholder="VD: Con cháu..." 
                      value={sender} onChange={e => setSender(e.target.value)}
                    />
                 </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-500 font-bold ml-1">Phong cách</label>
                <select 
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-text-main focus:border-tet-red outline-none cursor-pointer"
                    value={style} 
                    onChange={e => setStyle(e.target.value as WishStyle)}
                >
                    {Object.values(WishStyle).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button 
                onClick={handleGenerateWish} 
                disabled={isGeneratingWish}
                className="w-full py-3 bg-tet-red text-white font-bold rounded-xl shadow-md hover:bg-red-700 hover:shadow-lg flex justify-center items-center gap-2 transition-all"
              >
                {isGeneratingWish ? <RefreshCw className="animate-spin"/> : <><PenTool className="w-4 h-4"/> Viết Lời Chúc</>}
              </button>
              
              {wish && (
                <div className="mt-4 p-5 bg-tet-gold-light/50 rounded-xl italic text-text-main border border-tet-gold/20 font-serif relative">
                    <span className="absolute top-2 left-2 text-4xl text-tet-gold/30">“</span>
                    <span className="relative z-10">{wish}</span>
                    <span className="absolute bottom-[-10px] right-4 text-4xl text-tet-gold/30">”</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Background */}
          <div className="bg-white p-8 rounded-2xl paper-shadow border border-gray-100">
            <h2 className="text-2xl font-serif font-bold mb-6 text-secondary flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-secondary">2</span>
              Họa Nền Thiệp
            </h2>
             <textarea 
               className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-text-main focus:border-secondary focus:ring-1 focus:ring-secondary outline-none h-24 mb-4 resize-none"
               placeholder="Mô tả ý tưởng của bạn (VD: Cành mai vàng rực rỡ bên ấm trà...)"
               value={bgDesc} onChange={e => setBgDesc(e.target.value)}
             />
             <button 
                onClick={handleGenerateBg} 
                disabled={isGeneratingBg}
                className="w-full py-3 bg-secondary text-white font-bold rounded-xl shadow-md hover:bg-green-600 hover:shadow-lg flex justify-center items-center gap-2 transition-all"
              >
                {isGeneratingBg ? <RefreshCw className="animate-spin"/> : <><ImageIcon className="w-4 h-4"/> Vẽ Tranh Mới</>}
              </button>
          </div>

          {/* Card 3: Extras */}
          <div className="bg-white p-8 rounded-2xl paper-shadow border border-gray-100">
            <h2 className="text-2xl font-serif font-bold mb-6 text-tet-gold flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-tet-gold-light flex items-center justify-center text-tet-gold">3</span>
              Thêm Tiện Ích
            </h2>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-gray-500" />
                        <span className="text-text-main font-semibold">Đọc lời chúc</span>
                    </div>
                    <button 
                        onClick={handlePlayAudio}
                        disabled={!audioBuffer || isGeneratingVoice}
                        className={`p-3 rounded-full transition-all ${isPlayingAudio ? 'bg-tet-red text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                    >
                        {isGeneratingVoice ? <RefreshCw className="w-5 h-5 animate-spin"/> : (isPlayingAudio ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>)}
                    </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <QrCode className="w-5 h-5 text-gray-500" />
                        <span className="text-text-main font-semibold">QR Lì Xì</span>
                    </div>
                    <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold text-gray-600 transition-colors shadow-sm">
                        Chọn ảnh
                        <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} />
                    </label>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col items-center lg:sticky lg:top-8 h-fit">
            <h3 className="text-xl font-serif font-bold mb-6 text-gray-400 uppercase tracking-widest">Bản Xem Trước</h3>
            
            <div className="relative w-full max-w-md aspect-square bg-white rounded-xl overflow-hidden shadow-2xl border-8 border-white ring-1 ring-gray-200 flex items-center justify-center group transition-transform hover:scale-[1.01] duration-500">
                {step === 1 ? (
                    bgImage ? (
                        <div className="relative w-full h-full">
                            <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[2px]">
                                <div className="border-4 border-double border-tet-red/50 p-6 w-full h-full flex flex-col items-center justify-center">
                                    <p className="text-tet-red font-serif text-2xl font-bold mb-4">Chúc Mừng Năm Mới</p>
                                    <p className="text-text-main font-hand text-3xl mb-6 leading-relaxed">
                                        {wish || "Lời chúc sẽ hiện ở đây..."}
                                    </p>
                                    <p className="text-gray-600 text-sm font-bold mt-auto">Gửi: {recipient}</p>
                                    {qrImage && <img src={qrImage} className="w-16 h-16 mt-4 border border-gray-200 rounded" alt="QR" />}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-300 flex flex-col items-center">
                            <ImageIcon className="w-16 h-16 mb-4 opacity-50"/>
                            <p className="font-serif">Chưa có hình nền</p>
                        </div>
                    )
                ) : (
                   <canvas ref={canvasRef} className="w-full h-full object-contain" />
                )}
            </div>

            <div className="flex gap-4 mt-8 w-full max-w-md">
                {step === 1 ? (
                    <button 
                        disabled={!bgImage || !wish}
                        onClick={() => setStep(2)}
                        className="flex-1 py-4 bg-tet-gold text-white font-bold rounded-xl shadow-lg hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Hoàn tất & Review
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => setStep(1)}
                            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold transition-colors"
                        >
                            Chỉnh sửa
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex-1 py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-all flex justify-center items-center gap-2"
                        >
                            <Download className="w-5 h-5" /> Tải Thiệp Về
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CardCreator;