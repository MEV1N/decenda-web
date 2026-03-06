import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface LocationData {
    id: string;
    name: string;
    is_starting: boolean;
    unlocked: boolean;
}

interface LiveChallenge {
    id: string;
    title: string;
    description: string;
    file_url: string;
    is_bonus: boolean;
    points: number;
    is_locked: boolean;
    locked_instruction?: string | null;
    created_at: string;
    has_solved?: boolean;
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
    const [coords] = useState(LOCATION_COORDS);

    const [liveChallenges, setLiveChallenges] = useState<LiveChallenge[]>([]);
    const [showLiveChallenges, setShowLiveChallenges] = useState(false);
    const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
    const [flagInputs, setFlagInputs] = useState<Record<string, string>>({});
    const [submittingFlag, setSubmittingFlag] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimerText = (createdAt: string) => {
        const expiry = new Date(createdAt).getTime() + 20 * 60 * 1000;
        const remaining = expiry - currentTime;
        if (remaining <= 0) return 'EXPIRED';
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const prevChallengeIds = useRef<Set<string>>(new Set());

    const navigate = useNavigate();
    const { addToast } = useToast();
    useAuth();


    const isPolling = useRef(false);

    useEffect(() => {
        let mounted = true;

        async function initializeBoard() {
            try {
                setLoading(true);
                const res = await api.get('/game/init');
                if (!mounted) return;

                // 1. Process Map
                const mapData = res.data;
                const locs: LocationData[] = mapData.locations
                    .filter((loc: any) => loc.id !== 'prologue')
                    .map((loc: any) => ({
                        ...loc,
                        unlocked: loc.is_starting || loc.unlocked // Use the pre-calculated unlocked flag from server
                    }));
                setLocations(locs);

                // 2. Process Live Challenges
                const challenges: LiveChallenge[] = mapData.liveChallenges;
                setLiveChallenges(challenges);
                prevChallengeIds.current = new Set(challenges.map(c => c.id));

            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        async function pollLiveChallenges() {
            if (isPolling.current) return;
            isPolling.current = true;
            try {
                const res = await api.get('/game/live-challenges');
                if (!mounted) return;

                const challenges: LiveChallenge[] = res.data;
                setLiveChallenges(challenges);

                // Check for new challenges
                if (prevChallengeIds.current.size > 0) {
                    const newChallenges = challenges.filter(c => !prevChallengeIds.current.has(c.id));
                    if (newChallenges.length > 0) {
                        addToast('NEW CASE FILE RECEIVED', 'warning');
                    }
                }
                prevChallengeIds.current = new Set(challenges.map(c => c.id));
            } catch {
                // Silently fail polling to not disrupt user
            } finally {
                isPolling.current = false;
            }
        }

        initializeBoard();
        const interval = setInterval(pollLiveChallenges, 30000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [addToast]);

    const submitLiveFlag = async (challengeId: string) => {
        const flag = flagInputs[challengeId];
        if (!flag) {
            addToast('Please enter a passcode.', 'warning');
            return;
        }

        setSubmittingFlag(true);
        try {
            const res = await api.post('/game/submit-live-flag', { challengeId, flag });
            addToast(res.data.message || 'Passcode accepted!', 'success');

            // Mark locally as solved
            setLiveChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, has_solved: true } : c));
            setFlagInputs(prev => ({ ...prev, [challengeId]: '' }));

        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to submit passcode.', 'error');
        } finally {
            setSubmittingFlag(false);
        }
    };

    const handleAuthenticatedDownload = async (fileUrl: string) => {
        // Static public files (manually uploaded to public/) — direct link
        if (!fileUrl.startsWith('/api/')) {
            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = fileUrl.split('/').pop() || 'case-file';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        }
        // API-served files — use native fetch with auth token
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(fileUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'case-file';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            addToast('Failed to download file. Please try again.', 'error');
        }
    };

    const handleLocationClick = (loc: LocationData) => {
        if (loc.unlocked) {
            navigate(`/location/${loc.id}`);
        } else {
            addToast(`Location "${loc.name}" is currently locked. Collect more evidence.`, 'warning');
        }
    };

    if (loading) return <div className="text-center mt-20 text-dimmed">Loading Investigation Board...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden p-4 md:p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-2 mb-4 shrink-0">
                <div className="flex items-end gap-6">
                    <h2 className="text-3xl font-heading font-bold text-accent uppercase tracking-widest">Investigation Board</h2>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowLiveChallenges(true)}
                        className="bg-yellow-900/50 border border-yellow-700 hover:bg-yellow-800/80 text-yellow-100 font-bold py-2 px-6 rounded uppercase tracking-wider text-sm transition-colors flex items-center gap-2"
                    >
                        <span>New Case Files</span>
                        {liveChallenges.length > 0 && (
                            <span className="bg-yellow-500 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {liveChallenges.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/location/prologue')}
                        className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded uppercase tracking-wider text-sm transition-colors flex items-center gap-2"
                    >
                        <span>Access Prologue (CSP #112)</span>
                    </button>
                </div>
            </div>

            <div className="relative w-full border border-zinc-800 rounded-lg overflow-auto bg-black flex-1 custom-scrollbar">
                {/* Min-width ensures the map doesn't get too squished on mobile and allows scrolling */}
                <div className="relative min-w-[800px] w-full h-full min-h-[600px]">
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
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 group ${loc.unlocked ? 'z-20' : 'z-10 opacity-60'}`}
                                style={{ top: locCoords.top, left: locCoords.left }}
                            >
                                {/* Marker Pin */}
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${loc.unlocked ? 'bg-black border-red-600 shadow-red-900/50 hover:bg-red-950' : 'bg-zinc-900 border-zinc-700'}`}>
                                    <div className={`w-3 h-3 rounded-full ${loc.unlocked ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                </div>

                                {/* Label */}
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

            {/* Live Challenges Modal */}
            {showLiveChallenges && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative"
                    >
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                            <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-widest">Live Case Files</h3>
                            <button onClick={() => setShowLiveChallenges(false)} className="text-dimmed hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-6 overflow-auto custom-scrollbar flex-1 space-y-4">
                            {liveChallenges.length === 0 ? (
                                <p className="text-dimmed text-center py-8">No live case files available at this time.</p>
                            ) : (
                                liveChallenges.map(challenge => {
                                    const isExpanded = expandedChallengeId === challenge.id;

                                    return (
                                        <div key={challenge.id} className={`rounded border transition-all duration-300 ${challenge.is_locked ? 'bg-zinc-950/50 border-zinc-800 opacity-50 grayscale' : (challenge.is_bonus ? 'bg-yellow-950/20 border-yellow-900/50' : 'bg-black border-zinc-800')} relative`}>
                                            {challenge.is_locked && (
                                                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none overflow-hidden">
                                                    <span className="text-3xl font-black text-red-900/40 uppercase tracking-widest rotate-6">CORRUPTED FILE</span>
                                                </div>
                                            )}

                                            {/* Collapsed Header (Click to expand) */}
                                            <button
                                                onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                                                className="w-full text-left p-5 flex justify-between items-center focus:outline-none"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <h4 className={`text-xl font-bold uppercase tracking-wider ${challenge.is_locked ? 'text-zinc-600 line-through' : (challenge.is_bonus ? 'text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'text-accent')}`}>
                                                        {challenge.title}
                                                    </h4>
                                                    {challenge.has_solved && (
                                                        <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest">Solved</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {challenge.is_bonus && !challenge.is_locked && (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest animate-pulse">Expires in</span>
                                                            <span className="text-xs font-mono font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                                                                {getTimerText(challenge.created_at)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className={`text-sm font-mono font-bold ${challenge.is_locked ? 'text-zinc-700' : 'text-accent/80'}`}>{challenge.points} PTS</span>
                                                    <span className="text-dimmed ml-2">{isExpanded ? '▲' : '▼'}</span>
                                                </div>
                                            </button>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    className="px-5 pb-5 pt-2 border-t border-zinc-900/50"
                                                >
                                                    {challenge.is_locked ? (
                                                        <div className="mb-4 bg-red-950/20 border border-red-900 rounded p-4 relative z-20 mt-2">
                                                            <h5 className="text-red-500 font-bold uppercase mb-2 text-xs tracking-wider">SYSTEM DECRYPTION ERROR</h5>
                                                            <p className="text-red-400 text-sm font-mono whitespace-pre-wrap">{challenge.locked_instruction || "ACCESS DENIED. AWAIT FURTHER INSTRUCTIONS."}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm mb-6 whitespace-pre-wrap text-dimmed leading-relaxed">{challenge.description}</p>
                                                    )}

                                                    {!challenge.is_locked && (
                                                        <div className="flex flex-col md:flex-row gap-4 items-end mt-4 pt-4 border-t border-zinc-900">
                                                            <div className="flex-1 w-full">
                                                                {challenge.has_solved ? (
                                                                    <div className="p-3 bg-green-950/30 border border-green-900/50 rounded flex items-center justify-center">
                                                                        <span className="text-green-500 font-bold tracking-widest uppercase text-sm">Passcode Accepted. Points Awarded.</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="ENTER FILE PASSCODE"
                                                                            value={flagInputs[challenge.id] || ''}
                                                                            onChange={(e) => setFlagInputs(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                                                                            className="flex-1 bg-black border border-zinc-800 rounded px-4 py-2 text-accent font-mono text-sm focus:outline-none focus:border-accent"
                                                                            onKeyDown={(e) => e.key === 'Enter' && submitLiveFlag(challenge.id)}
                                                                        />
                                                                        <button
                                                                            onClick={() => submitLiveFlag(challenge.id)}
                                                                            disabled={submittingFlag || !flagInputs[challenge.id]}
                                                                            className="bg-accent hover:bg-accent/80 text-black font-bold px-6 rounded uppercase tracking-wider text-sm disabled:opacity-50 transition-colors"
                                                                        >
                                                                            {submittingFlag ? '...' : 'Submit'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                                                <button
                                                                    onClick={() => handleAuthenticatedDownload(challenge.file_url)}
                                                                    className={`px-4 py-2 rounded text-xs uppercase font-bold tracking-wider transition-colors inline-flex items-center gap-2 ${challenge.is_bonus ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                                                                >
                                                                    Download Assets
                                                                </button>
                                                                <span className="text-[10px] text-zinc-600 font-mono">ISSUED: {new Date(challenge.created_at).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
