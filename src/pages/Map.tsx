import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useToast } from '../context/ToastContext';

interface LocationData {
    id: string;
    name: string;
    is_starting: boolean;
    unlocked: boolean;
}

// Approximate starting coordinates - you may need to adjust these percentages 
// to perfectly align with the text on your specific map.png
const LOCATION_COORDS: Record<string, { top: string, left: string }> = {
    'old_garage': { top: '15%', left: '20%' },
    'drainage_pit': { top: '80%', left: '85%' },
    'residential_alley': { top: '35%', left: '30%' },
    'riverside_walkway': { top: '65%', left: '25%' },
    'detective_office': { top: '45%', left: '50%' },
    'town': { top: '50%', left: '75%' },
    'police_annex': { top: '60%', left: '60%' },
    'clinic': { top: '25%', left: '65%' },
    'tram_station': { top: '85%', left: '40%' },
    'your_car': { top: '55%', left: '15%' },
    'your_house': { top: '15%', left: '80%' },
    'prologue': { top: '5%', left: '5%' } // Example if ever added to map
};

export default function Map() {
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const coords = LOCATION_COORDS;

    const navigate = useNavigate();
    const { addToast } = useToast();

    // Prologue is now manually triggered via a button

    useEffect(() => {
        async function fetchMap() {
            try {
                const res = await api.get('/game/map');
                const locs: LocationData[] = res.data.locations
                    .filter((loc: any) => loc.id !== 'prologue')
                    .map((loc: any) => ({
                        ...loc,
                        unlocked: loc.is_starting || res.data.locations.some((l: any) => l.id === loc.id && loc.unlocked) // API returns unlocked flag
                    }));

                setLocations(locs);
            } catch (err: any) {
                console.error('Failed to load map', err);
                setError(err?.response?.data?.error || err.message || 'Failed to load map');
            } finally {
                setLoading(false);
            }
        }
        fetchMap();
    }, []);

    const handleLocationClick = (loc: LocationData) => {
        if (loc.unlocked) {
            navigate(`/location/${loc.id}`);
        } else {
            addToast(`Location "${loc.name}" is currently locked. Collect more evidence.`, 'warning');
        }
    };

    if (loading) return <div className="text-center mt-20 text-dimmed">Loading Investigation Board...</div>;
    if (error) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
            <div className="bg-red-950/30 border border-red-900 p-8 rounded max-w-md text-center">
                <h3 className="text-xl font-bold text-red-500 uppercase mb-4">Connection Lost</h3>
                <p className="text-white mb-4">The map data could not be retrieved from the server. This usually means the database connection has timed out or the backend is unreachable.</p>
                <p className="text-zinc-500 text-sm font-mono mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-red-900 hover:bg-red-800 text-white px-6 py-2 rounded uppercase tracking-wider text-sm transition-colors">
                    Retry Connection
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden p-4 md:p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-2 mb-4 shrink-0">
                <div className="flex items-end gap-6">
                    <h2 className="text-3xl font-heading font-bold text-accent uppercase tracking-widest">Investigation Board</h2>
                </div>

                <button
                    onClick={() => navigate('/location/prologue')}
                    className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded uppercase tracking-wider text-sm transition-colors flex items-center gap-2"
                >
                    <span>Access Prologue (CSP #112)</span>
                </button>
            </div>

            <div className={`relative w-full border border-zinc-800 rounded-lg overflow-auto bg-black flex-1 custom-scrollbar`}>
                <div className={`relative min-w-[800px] w-full h-full min-h-[600px]`}>
                    <img
                        src="/map.png"
                        alt="Gravenfall Map"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                    />

                    {locations.map((loc) => {
                        const locCoords = coords[loc.id] || { top: '50%', left: '50%' };

                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={loc.id}
                                onClick={() => handleLocationClick(loc)}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 group ${loc.unlocked ? 'z-20 hover:scale-110' : 'z-10 opacity-60'}`}
                                style={{ top: locCoords.top, left: locCoords.left }}
                            >
                                {/* Marker Pin */}
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${loc.unlocked ? 'bg-black border-red-600 shadow-red-900/50 hover:bg-red-950' : 'bg-zinc-900 border-zinc-700'}`}>
                                    <div className={`w-3 h-3 rounded-full ${loc.unlocked ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                </div>

                                {/* Label background */}
                                <div className={`mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap rounded border backdrop-blur-sm transition-all ${loc.unlocked
                                    ? 'bg-black/70 text-white border-zinc-700 group-hover:border-red-500 group-hover:text-red-400'
                                    : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                                    }`}>
                                    {loc.name}
                                    {!loc.unlocked && <span className="ml-2 text-red-900">🔒</span>}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
