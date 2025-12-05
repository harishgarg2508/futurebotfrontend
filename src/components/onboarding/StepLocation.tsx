import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

interface StepLocationProps {
  onNext: (location: LocationData) => void;
  onBack: () => void;
}

const StepLocation: React.FC<StepLocationProps> = ({ onNext, onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    const searchLocation = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        setResults(response.data);
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchLocation, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: any) => {
    const location = {
      name: result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    };
    setSelectedLocation(location);
    setQuery(result.display_name.split(',')[0]); // Show short name
    setResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) {
      onNext(selectedLocation);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center w-full max-w-md p-8 space-y-8"
    >
      <h2 className="text-3xl font-light text-center text-white font-serif">
        And where did you take your first breath?
        <br />
        <span className="text-sm text-gray-400 mt-2 block">We need coordinates for the stars.</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="w-full space-y-6 relative">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-vedic-gold w-6 h-6" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedLocation(null);
            }}
            placeholder="Search City (e.g. Chandigarh)"
            className="w-full p-4 pl-14 text-xl text-center glass-input rounded-xl"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-vedic-gold w-5 h-5 animate-spin" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && !selectedLocation && (
          <div className="absolute z-10 w-full mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full p-3 text-left hover:bg-white/10 text-gray-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
              >
                <span className="font-medium text-vedic-gold block">{result.display_name.split(',')[0]}</span>
                <span className="text-xs text-gray-500 truncate block">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {selectedLocation && (
          <div className="text-center text-sm text-green-400 bg-green-400/10 p-2 rounded-lg border border-green-400/20">
            ✓ Location Confirmed: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 p-4 glass-button rounded-xl text-gray-400 hover:text-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!selectedLocation}
            className="flex-1 p-4 flex items-center justify-center space-x-2 glass-button rounded-xl disabled:opacity-50"
          >
            <span>Awaken the Oracle</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StepLocation;
