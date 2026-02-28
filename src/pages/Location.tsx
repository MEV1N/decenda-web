import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useToast } from '../context/ToastContext';

const getImageForLocation = (id?: string) => {
    switch (id) {
        case 'old_garage': return '/garage.png';
        case 'drainage_pit': return '/drainage.png';
        case 'residential_alley': return '/residential.png';
        case 'riverside_walkway': return '/riverside.png';
        case 'detective_office': return '/office.png';
        case 'town': return '/town.png';
        case 'police_annex': return '/police.png';
        case 'clinic': return '/clinic.png';
        case 'tram_station': return '/tramstation.png';
        case 'your_car': return '/car.png';
        case 'your_house': return '/house.png';
        case 'prologue': return '/prothumb.png';
        default: return '/garage.png';
    }
};

interface Challenge {
    id: string;
    title: string;
    description: string;
    points: number;
    instance_required: boolean;
    solved: boolean;
}

interface LocationData {
    id: string;
    name: string;
    description: string;
}

export default function Location() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [location, setLocation] = useState<LocationData | null>(null);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
    const [flagInput, setFlagInput] = useState('');
    const [submitMsg, setSubmitMsg] = useState('');
    const [revealedHints, setRevealedHints] = useState<number[]>([]);

    const { addToast } = useToast();

    useEffect(() => {
        async function fetchDetails() {
            try {
                const res = await api.get(`/game/location/${id}`);
                setLocation(res.data.location);
                setChallenges(res.data.challenges);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Access Denied');
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [id]);

    const submitFlag = async () => {
        if (!activeChallenge || !flagInput) return;
        try {
            const res = await api.post('/game/submit-flag', {
                challengeId: activeChallenge.id,
                flag: flagInput
            });
            setSubmitMsg(res.data.message);

            // Mark as solved
            setChallenges(prev => prev.map(c => c.id === activeChallenge.id ? { ...c, solved: true } : c));

            // Trigger toast if new locations unlocked
            if (res.data.newUnlocks && res.data.newUnlocks.length > 0) {
                addToast(`New case file(s) received! Check Uncovered Cases.`, 'success');
            }

            setTimeout(() => {
                setActiveChallenge(null);
                setRevealedHints([]);
            }, 1500);
        } catch (err: any) {
            setSubmitMsg(err.response?.data?.error || 'Incorrect');
        }
    };

    if (loading) return <div className="text-center mt-20 text-dimmed">Accessing records...</div>;
    if (error) return <div className="text-center mt-20 text-accent font-bold">{error}</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto z-10 relative">
            <button onClick={() => navigate('/')} className="text-dimmed hover:text-white mb-6 uppercase text-xs tracking-wider flex items-center gap-2">
                <span>←</span> <span>Return to Board</span>
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl font-heading font-bold text-accent mb-2 uppercase tracking-[4px]">{location?.name}</h1>

                {location && (
                    <div className="w-full h-64 mb-6 mt-4 overflow-hidden rounded border border-zinc-800 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 pointer-events-none"></div>
                        <img src={getImageForLocation(location.id)} alt={location.name} className="w-full h-full object-cover opacity-70 mix-blend-overlay" />
                    </div>
                )}

                <p className="text-dimmed mb-10 text-lg border-l-2 border-zinc-800 pl-4 py-2 italic font-serif">
                    {location?.description}
                </p>

                <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-zinc-400">Available Evidence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {challenges.map(chal => (
                        <div
                            key={chal.id}
                            onClick={() => setActiveChallenge(chal)}
                            className={`p-4 border ${chal.solved ? 'border-green-900 bg-green-900/10' : 'border-zinc-800 bg-zinc-900/50'} rounded-md cursor-pointer hover:border-accent transition-colors`}
                        >
                            <h3 className={`font-bold uppercase ${chal.solved ? 'text-green-500' : 'text-white'}`}>{chal.title}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-dimmed">{chal.points} pts</span>
                                {chal.solved && <span className="text-xs text-green-500 uppercase">Analyzed</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Challenge Modal */}
            <AnimatePresence>
                {activeChallenge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-zinc-900 border border-zinc-800 p-8 rounded shadow-2xl max-w-4xl w-full relative max-h-[90vh] flex flex-col"
                        >
                            <button
                                onClick={() => { setActiveChallenge(null); setFlagInput(''); setSubmitMsg(''); setRevealedHints([]); }}
                                className="absolute top-4 right-4 text-dimmed hover:text-white z-10 bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center border border-zinc-700 shadow-md"
                            >✕</button>

                            {/* Challenge Banner / Thumbnail */}
                            {(() => {
                                let overrideImage = getImageForLocation(location?.id);
                                if (activeChallenge.title === 'The Fourth Body') overrideImage = '/thumbnail/fourth.jpg';
                                else if (activeChallenge.title === 'Right leather glove') overrideImage = '/thumbnail/right glove.png';
                                else if (activeChallenge.title === 'Left leather glove') overrideImage = '/thumbnail/left glove.png'; // Assuming there's a left glove image if needed, or fallback
                                else if (activeChallenge.title === 'Faint chalk symbol') overrideImage = '/thumbnail/chalk symbol.png';
                                else if (activeChallenge.title === 'Dirty mirror') overrideImage = '/thumbnail/dirty mirror.png';
                                else if (activeChallenge.title === 'Boot prints in oil' || activeChallenge.title === 'Boot prints') overrideImage = '/thumbnail/boot_print.jpg';
                                else if (activeChallenge.title === 'Torn receipt') overrideImage = '/thumbnail/recipt.jpg';
                                // Add more mappings here as needed based on challenge titles

                                return (
                                    <div className="flex flex-col md:flex-row gap-8 w-full mt-8 md:h-[400px]">
                                        {/* Left Side: Thumbnail */}
                                        <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-4 h-full">
                                            <div className="w-full h-48 md:flex-1 overflow-hidden rounded border border-zinc-700 relative flex justify-center items-center bg-black/50">
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10 pointer-events-none"></div>
                                                <img src={overrideImage} alt={`${activeChallenge.title} Thumbnail`} className="max-w-full max-h-full object-contain z-0" />
                                            </div>

                                            {/* Hint Buttons beneath thumbnail */}
                                            {!activeChallenge.solved && (
                                                <div className="flex flex-col gap-2 relative z-10 shrink-0 mt-2">
                                                    <div className="flex flex-col items-center gap-2 w-full">
                                                        <span className="text-zinc-500 uppercase font-bold tracking-widest text-xs h-4">Hints</span>
                                                        <div className="flex justify-center gap-2 w-full h-10">
                                                            {[1, 2, 3].map((hintNum) => {
                                                                const isRevealed = revealedHints.includes(hintNum);
                                                                return (
                                                                    <button
                                                                        key={hintNum}
                                                                        onClick={() => setRevealedHints(isRevealed ? [] : [hintNum])} // Toggle the selected hint
                                                                        className={`w-10 h-10 flex items-center justify-center rounded text-sm font-bold transition-colors shrink-0 ${isRevealed
                                                                            ? 'bg-accent text-white border border-accent'
                                                                            : 'bg-zinc-800 text-dimmed border border-zinc-700 hover:text-white hover:border-zinc-500'
                                                                            }`}
                                                                    >
                                                                        {hintNum}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Hint Content Area - Fixed Height to prevent resizing */}
                                                    {revealedHints.length > 0 && (
                                                        <div className="w-full h-[60px] bg-black/50 border border-zinc-700 rounded p-3 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar shrink-0">
                                                            <span className="text-zinc-300 italic text-center text-xs">
                                                                {/* Later: Pull real hint text from the backend or challenge data */}
                                                                Hint {revealedHints[0]}: Look closer at the details.
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: Content */}
                                        <div className="w-full md:w-2/3 flex flex-col min-h-0 h-full">
                                            <h2 className="text-2xl font-bold text-accent mb-4 uppercase pr-8 shrink-0">{activeChallenge.title}</h2>

                                            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">

                                                {/* Special parchment content for The Ritual */}
                                                {activeChallenge.title === 'The Ritual' && (
                                                    <div className="mb-6 bg-red-950/20 border border-red-900 rounded p-5 font-serif leading-relaxed shadow-inner">
                                                        <p className="mb-4 text-red-300 italic text-sm">Among his papers lay a narrow scrap of parchment bearing a peculiar instruction:</p>
                                                        <blockquote className="border-l-2 border-red-800 pl-4 mb-4 text-white">
                                                            <p className="mb-1">"Take them two by two.</p>
                                                            <p className="mb-1">Raise the first eight degrees above the second.</p>
                                                            <p className="mb-1">Bind them into one voice."</p>
                                                        </blockquote>
                                                        <p className="mb-3 text-red-400 italic text-sm">Beneath it, a single line of notation:</p>
                                                        <pre className="bg-black border border-red-900 rounded p-3 text-xs text-red-400 font-mono whitespace-pre-wrap mb-4 overflow-x-auto">{`paper ''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1]))
    for i in range(0, len(flag), 2)])`}</pre>
                                                        <p className="mb-1 text-white text-sm">Two letters joined into one.</p>
                                                        <p className="mb-1 text-white text-sm">Lifted. Combined. Concealed.</p>
                                                        <p className="mt-3 text-red-300 italic text-sm">Just as he had done before.</p>
                                                        <div className="mt-5 pt-4 border-t border-red-900">
                                                            <a
                                                                href="/paper.txt"
                                                                download="paper.txt"
                                                                className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-white border border-red-900 hover:border-red-600 bg-black/60 px-4 py-2 rounded uppercase tracking-wider transition-colors"
                                                            >
                                                                <span>📄</span> paper
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Special clue block for Mercy */}
                                                {activeChallenge.title === 'Mercy' && (
                                                    <div className="mb-6 bg-red-950/20 border border-red-900 rounded p-5 font-serif leading-relaxed shadow-inner">
                                                        <p className="mb-4 text-red-300 italic text-sm">Scrawled in the margin of his sermon notes was a curious inscription — neither verse nor name, but this:</p>
                                                        <pre className="bg-black border border-red-900 rounded p-3 text-xs text-red-400 font-mono whitespace-pre-wrap mb-4 overflow-x-auto break-all">Y1hKd2UzUm9kbkV6Y1Y5bmRUTmZlVEExWjBCNmIzQXVjR2R6ZlE9PQ%3D%3D</pre>
                                                        <p className="mb-3 text-red-400 italic text-sm">Beneath it, in smaller hand:</p>
                                                        <blockquote className="border-l-2 border-red-800 pl-4 mb-4 text-white">
                                                            <p className="mb-1">I speak in tongues not once, but twice concealed.</p>
                                                            <p className="mb-1">Strip me of my bindings, and I will shed a layer.</p>
                                                            <p className="mb-1">Wash me clean of what the road has stained me with,</p>
                                                            <p className="mb-3">And my true voice shall answer.</p>
                                                            <p className="mb-1 text-red-300 italic">Those who seek mercy</p>
                                                            <p className="text-red-300 italic">Must first learn to decode it.</p>
                                                        </blockquote>
                                                    </div>
                                                )}

                                                {/* Special clue block for The Fourth Body */}
                                                {activeChallenge.title === 'The Fourth Body' && (
                                                    <div className="mb-6 bg-red-950/20 border border-red-900 rounded p-5 font-serif leading-relaxed shadow-inner">
                                                        <p className="mb-4 text-red-300 italic text-sm">Among the belongings recovered from the chamber was a single photograph.</p>
                                                        <p className="mb-3 text-white text-sm">Its label read only:</p>
                                                        <pre className="bg-black border border-red-900 rounded p-3 text-xs text-red-400 font-mono mb-4">fourth.jpg</pre>
                                                        <p className="mb-3 text-white text-sm">No inscription marked its reverse. No obvious tampering marred its surface.</p>
                                                        <p className="mb-4 text-red-300 italic text-sm">Yet something in it felt… deliberate.</p>
                                                        <p className="mb-3 text-white text-sm">Pinned beside it in the evidence folio was a slip of paper bearing these lines:</p>
                                                        <blockquote className="border-l-2 border-red-800 pl-4 mb-4 text-white">
                                                            <p className="mb-1">What is hidden is not always buried.</p>
                                                            <p className="mb-3">Some truths lie beneath the skin of things.</p>
                                                            <p className="mb-1">Turn the wheel of letters half a revolution,</p>
                                                            <p className="mb-3">And they shall face you anew.</p>
                                                            <p className="mb-1">Cleanse what has been twice wrapped and road-worn,</p>
                                                            <p className="mb-3">For meaning often travels masked.</p>
                                                            <p className="mb-1 text-red-300 italic">Seek not a key —</p>
                                                            <p className="text-red-300 italic">For sometimes the door was never locked.</p>
                                                        </blockquote>
                                                        <p className="mb-3 text-white text-sm">The image itself revealed nothing to the naked eye.</p>
                                                        <p className="mb-3 text-white text-sm">But the Shepherd was not a careless man.</p>
                                                        <p className="mb-5 text-red-500 italic text-sm">And he never left anything unguarded without purpose.</p>
                                                        <div className="pt-4 border-t border-red-900">
                                                            <a
                                                                href="/fourth.jpg"
                                                                download="fourth.jpg"
                                                                className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-white border border-red-900 hover:border-red-600 bg-black/60 px-4 py-2 rounded uppercase tracking-wider transition-colors"
                                                            >
                                                                <span>🖼</span> fourth.jpg
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {activeChallenge.solved ? (
                                                    activeChallenge.title === 'The Ritual' ? (
                                                        <div className="mb-6 bg-red-950/20 border border-red-900 rounded p-5 font-serif leading-relaxed shadow-inner">
                                                            <p className="mb-3 text-white text-sm">The candles found beside the bodies were of uncommon make—hand-poured, fashioned from a particular wax known to but a few craftsmen in the city.</p>
                                                            <p className="mb-3 text-white text-sm">Only one patron purchased such candles in notable quantity.</p>
                                                            <p className="mb-3 text-white text-sm">The account was registered under a charitable foundation dedicated to counsel and spiritual comfort.</p>
                                                            <p className="mb-3 text-white text-sm">The same institution overseen by the leader of the mourning circle.</p>
                                                            <p className="mb-3 text-red-300 text-sm">He possessed a voice of soothing timbre, eyes that reflected sympathy, and a handshake neither firm nor weak.</p>
                                                            <p className="mb-3 text-red-300 text-sm">The sort of gentleman to whom widows confess their despair.</p>
                                                            <p className="mb-3 text-red-300 text-sm">The sort who listens without interruption.</p>
                                                            <p className="mt-4 text-red-500 italic text-sm">And thereafter, decides.</p>
                                                        </div>
                                                    ) : activeChallenge.title === 'Mercy' ? (
                                                        <div className="mb-6 bg-red-950/20 border border-red-900 rounded p-5 font-serif leading-relaxed shadow-inner">
                                                            <p className="mb-3 text-white text-sm">Four departed souls. No apparent relation by blood, trade, nor acquaintance.</p>
                                                            <p className="mb-3 text-white text-sm">Yet inquiry revealed a common thread.</p>
                                                            <p className="mb-3 text-white text-sm">Each had, within a fortnight of their demise, attended a small assembly devoted to the consolation of the bereaved.</p>
                                                            <p className="mb-3 text-white text-sm">A private circle. Discreet. Of modest number.</p>
                                                            <p className="mb-3 text-white text-sm">The gentleman presiding over these gatherings described the deceased as "lost spirits." He maintained that he sought only to guide them toward peace.</p>
                                                            <p className="mb-3 text-red-300 italic text-sm">Guide them.</p>
                                                            <p className="mb-3 text-white text-sm">The word lingered unpleasantly in my thoughts.</p>
                                                            <p className="mt-4 text-red-500 italic text-sm">Like a shepherd tending his flock.</p>
                                                        </div>
                                                    ) : activeChallenge.title === 'The Fourth Body' ? (
                                                        <div className="mb-6 bg-red-950/20 border border-red-900 rounded p-5 font-serif leading-relaxed shadow-inner">
                                                            <p className="mb-3 text-white text-sm">At twelve minutes past the third hour after midnight, I was summoned once more.</p>
                                                            <p className="mb-3 text-white text-sm">Another residence of respectable standing. No shattered lock. No disturbed furnishings. No cry had pierced the night.</p>
                                                            <p className="mb-3 text-white text-sm">She had been laid upon the carpet with a care bordering upon reverence. Her hands were folded as though in prayer. The curtains were drawn tight against the indifferent moon. Her shoes were set neatly beside her.</p>
                                                            <p className="mb-1 text-white text-sm">A single candle rested near her temple.</p>
                                                            <p className="mb-3 text-red-400 font-bold text-sm">Unlit.</p>
                                                            <p className="mb-1 text-white text-sm">Upon the plastered wall, written in a steady hand:</p>
                                                            <p className="mb-3 text-red-300 italic text-sm">"I only free them."</p>
                                                            <p className="mb-3 text-white text-sm">The apothecary's examination revealed a draught of powerful sedatives, administered with exacting precision. There had been no struggle, no mark of violence.</p>
                                                            <p className="mb-3 text-white text-sm">They had admitted him willingly.</p>
                                                            <p className="mb-3 text-red-300 text-sm">That is the singular horror of it.</p>
                                                            <p className="mb-3 text-red-300 text-sm">He does not force entry.</p>
                                                            <p className="mt-4 text-red-500 italic text-sm">He is received as a guest.</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-zinc-300 font-serif mb-6 leading-relaxed bg-black/50 p-4 border border-zinc-800 rounded whitespace-pre-wrap">
                                                            {activeChallenge.description}
                                                        </p>
                                                    )
                                                ) : (
                                                    activeChallenge.title !== 'The Ritual' && activeChallenge.title !== 'Mercy' && activeChallenge.title !== 'The Fourth Body' && (
                                                        <div className="text-zinc-500 italic mb-6 bg-black/50 p-4 border border-zinc-800 rounded flex flex-col items-center justify-center min-h-[100px]">
                                                            <span className="text-accent uppercase font-bold tracking-widest text-xs mb-2">[ EVIDENCE ENCRYPTED ]</span>
                                                            <span className="text-sm">Submit the correct verification sequence to decrypt and read this file.</span>
                                                        </div>
                                                    )
                                                )}

                                                {activeChallenge.instance_required && (
                                                    <div className="mb-6">
                                                        <button className="bg-blue-900 hover:bg-blue-800 text-white text-xs px-4 py-2 rounded uppercase tracking-wider w-full">
                                                            Start Instance
                                                        </button>
                                                    </div>
                                                )}

                                                {activeChallenge.solved ? (
                                                    <div className="text-center p-4 bg-green-900/20 text-green-500 border border-green-900 rounded font-mono">
                                                        EVIDENCE ANALYZED
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-3">
                                                        <input
                                                            type="text"
                                                            value={flagInput}
                                                            onChange={e => setFlagInput(e.target.value)}
                                                            placeholder="dec{...}"
                                                            className="w-full bg-black border border-zinc-700 rounded p-3 text-white font-mono focus:outline-none focus:border-accent"
                                                        />
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-accent font-mono h-4">{submitMsg}</span>
                                                            <button
                                                                onClick={submitFlag}
                                                                className="bg-accent hover:bg-red-800 text-white px-6 py-2 rounded uppercase text-sm font-bold tracking-wide transition-colors"
                                                            >
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
