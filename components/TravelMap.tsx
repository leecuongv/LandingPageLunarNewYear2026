import React, { useState } from 'react';
import { getTravelSuggestions, TravelResult } from '../services/geminiService';
import { MapPin, Compass, ExternalLink } from 'lucide-react';

const TravelMap: React.FC = () => {
  const [interest, setInterest] = useState('');
  const [result, setResult] = useState<TravelResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!interest.trim()) return;
    setLoading(true);
    setResult(null);

    // Try to get geolocation
    let location;
    try {
        if (navigator.geolocation) {
             const pos: GeolocationPosition = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
             });
             location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }
    } catch (e) {
        // Ignore
    }

    const data = await getTravelSuggestions(interest, location);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="my-12 max-w-4xl mx-auto">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-secondary flex items-center justify-center gap-2">
          <MapPin className="w-8 h-8" /> Du Xuân Bốn Phương
        </h2>
        <p className="text-gray-500 mt-2 font-serif italic">Tìm chốn bình yên để khởi đầu năm mới (Google Maps).</p>
      </div>

      <div className="bg-white border border-gray-100 p-8 rounded-3xl paper-shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input 
                type="text" 
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Bạn muốn đi đâu? (VD: Chùa cổ, biển vắng, núi cao...)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-text-main focus:border-secondary outline-none transition-colors"
            />
            <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-secondary text-white hover:bg-green-600 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md"
            >
                {loading ? <Compass className="animate-spin" /> : 'Tìm địa điểm'}
            </button>
        </div>

        {result && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="prose prose-stone max-w-none">
                     <p className="whitespace-pre-line text-lg leading-relaxed text-gray-700">{result.text}</p>
                </div>

                {result.chunks.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {result.chunks.map((chunk, idx) => {
                            if (chunk.maps) {
                                return (
                                    <a 
                                        key={idx} 
                                        href={chunk.maps.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block p-5 bg-white border border-gray-100 hover:border-tet-gold hover:shadow-lg rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <h4 className="font-bold text-text-main group-hover:text-tet-gold truncate pr-2 text-lg">{chunk.maps.title}</h4>
                                            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        </div>
                                        {chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.snippet && (
                                            <div className="mt-3 relative pl-4 border-l-2 border-gray-200">
                                                <p className="text-sm text-gray-500 line-clamp-3 italic">
                                                    "{chunk.maps.placeAnswerSources[0].reviewSnippets[0].snippet}"
                                                </p>
                                            </div>
                                        )}
                                    </a>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TravelMap;