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
    'clinic': { top: '25%', left: '65%' },
    'detective_office': { top: '45%', left: '50%' },
    'drainage_pit': { top: '7.13%', left: '18.58%' },
    'old_garage': { top: '37.00%', left: '8.57%' },
    'police_annex': { top: '43.37%', left: '77.70%' },
    'prologue': { top: '5%', left: '5%' },
    'residential_alley': { top: '35%', left: '30%' },
    'riverside_walkway': { top: '21.37%', left: '13.66%' },
    'town': { top: '10.97%', left: '63.53%' },
    'tram_station': { top: '85%', left: '40%' },
    'your_car': { top: '60.70%', left: '56.27%' },
    'your_house': { top: '53.67%', left: '41.68%' }
};

export default function Map() {
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
    const [coords, setCoords] = useState(LOCATION_COORDS);

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
            } catch (err) {
                console.error('Failed to load map', err);
            } finally {
                setLoading(false);
            }
        }
        fetchMap();
    }, []);

    const handleLocationClick = (loc: LocationData, e: React.MouseEvent) => {
        if (editMode) {
            e.stopPropagation(); // Prevent moving the pin when just selecting it
            setSelectedLoc(loc.id);
            addToast(`Selected ${loc.name} for moving. Click anywhere on the map to place it.`, 'info');
            return;
        }

        if (loc.unlocked) {
            navigate(`/location/${loc.id}`);
        } else {
            addToast(`Location "${loc.name}" is currently locked. Collect more evidence.`, 'warning');
        }
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!editMode || !selectedLoc) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const leftPercent = ((x / rect.width) * 100).toFixed(2) + '%';
        const topPercent = ((y / rect.height) * 100).toFixed(2) + '%';

        const newCoords = {
            ...coords,
            [selectedLoc]: { top: topPercent, left: leftPercent }
        };

        setCoords(newCoords);
        setSelectedLoc(null);

        // Log to console for easy copy-pasting
        console.log("const LOCATION_COORDS: Record<string, { top: string, left: string }> = ", newCoords, ";");
        addToast(`Moved! Check browser console to copy the new coordinates.`, 'success');
    };

    if (loading) return <div className="text-center mt-20 text-dimmed">Loading Investigation Board...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden p-4 md:p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-2 mb-4 shrink-0">
                <div className="flex items-end gap-6">
                    <h2 className="text-3xl font-heading font-bold text-accent uppercase tracking-widest">Investigation Board</h2>
                    <button
                        onClick={() => {
                            setEditMode(!editMode);
                            setSelectedLoc(null);
                        }}
                        className={`mb-1 text-xs px-3 py-1 border rounded uppercase ${editMode ? 'bg-accent text-white border-accent' : 'bg-transparent text-dimmed border-zinc-700 hover:text-white'}`}
                    >
                        {editMode ? 'Exit Edit Mode' : 'Edit Alignments'}
                    </button>
                </div>

                <button
                    onClick={() => navigate('/location/prologue')}
                    className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded uppercase tracking-wider text-sm transition-colors flex items-center gap-2"
                >
                    <span>Access Prologue (CSP #112)</span>
                </button>
            </div>

            <div className={`relative w-full border rounded-lg overflow-auto bg-black flex-1 custom-scrollbar ${editMode ? 'border-accent shadow-[0_0_15px_rgba(153,27,27,0.3)]' : 'border-zinc-800'}`}>
                {/* Min-width ensures the map doesn't get too squished on mobile and allows scrolling */}
                <div
                    className={`relative min-w-[800px] w-full h-full min-h-[600px] ${editMode ? 'cursor-crosshair' : ''}`}
                    onClick={handleMapClick}
                >
                    <img
                        src="/map.png"
                        alt="Gravenfall Map"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                    />

                    {/* Add an overlay grid to help visualize? Nah, just markers */}

                    {locations.map((loc) => {
                        const locCoords = coords[loc.id] || { top: '50%', left: '50%' };
                        const isSelected = selectedLoc === loc.id;

                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: isSelected ? 1.2 : 1 }}
                                key={loc.id}
                                onClick={(e) => handleLocationClick(loc, e as any)}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 group ${loc.unlocked || editMode ? 'z-20' : 'z-10 opacity-60'} ${isSelected ? 'z-30' : ''}`}
                                style={{ top: locCoords.top, left: locCoords.left }}
                            >
                                {/* Marker Pin */}
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${isSelected ? 'bg-accent border-white animate-pulse' : (loc.unlocked ? 'bg-black border-red-600 shadow-red-900/50 hover:bg-red-950' : 'bg-zinc-900 border-zinc-700')}`}>
                                    <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : (loc.unlocked ? 'bg-red-500 animate-pulse' : 'bg-zinc-600')}`}></div>
                                </div>

                                {/* Label background (since map has text, this acts as a clickable helper, and highlights on hover) */}
                                <div className={`mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap rounded border backdrop-blur-sm transition-all ${isSelected
                                    ? 'bg-accent text-white border-white'
                                    : (loc.unlocked || editMode
                                        ? 'bg-black/70 text-white border-zinc-700 group-hover:border-red-500 group-hover:text-red-400'
                                        : 'bg-zinc-900/80 text-zinc-500 border-zinc-800')
                                    }`}>
                                    {loc.name}
                                    {!loc.unlocked && !editMode && <span className="ml-2 text-red-900">🔒</span>}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
