import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const prologueText = "Gravenfall City had never demanded attention; it lingered in the margins of maps and memory, a place of dim sodium light, rust-scarred canals, and rail lines that screamed through sleepless nights. People moved through it without noticing its weight until the past month, when something unseen began pressing down on the eastern districts. Bodies appeared in alleyways and abandoned structures, some found too late, some only suggested by blood that belonged nowhere and footprints that began without ending. The deaths were quiet, and that quiet unsettled the city more than violence ever could. When three killings occurred within hours on the third night — different neighborhoods, different victims, no witnesses, no shared pattern the city did not panic; it held its breath. The case was transferred to the investigator who trusted doubt more than instinct, a man who dismantled certainty until truth remained. Yet the evidence refused alignment: no shared routines, no contact points, no forensic continuity, no motive. For the first time in years, he could not feel the shape of the killer. Silence replaced instinct, and silence was dangerous. When instinct failed, memory answered. His eyes moved to an older section of the wall where forgotten files remained pinned not for relevance but for history, and one thin folder sat slightly apart unassuming, dust-lined, and pivotal. CSP-112 was the case that built his reputation and taught him that deception hides inside clarity; its evidence had aligned too perfectly, its timelines matched too precisely, until tiny fractures surfaced a timestamp misplaced by a minute, a misspelling repeated across reports, an apartment number reversed and copied as if truth had been duplicated instead of witnessed. It was not a case of lies, but of replicated lies, where truth was not hidden but diluted. And now, faced with murders defined by absence rather than pattern, he felt that same distortion pressing at the edges of understanding, as though CSP-112 had not ended at all, but had been waiting beneath the surface for its echo to return.";

export default function Prologue() {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const navigate = useNavigate();
    const { login, token, team } = useAuth();
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        let currentIndex = 0;

        const typeWriter = setInterval(() => {
            if (currentIndex < prologueText.length) {
                setDisplayedText(prev => prev + prologueText[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(typeWriter);
                setIsTyping(false);
            }
        }, 30); // Faster speed for letters

        return () => clearInterval(typeWriter);
    }, []);

    const skipTyping = () => {
        setDisplayedText(prologueText);
        setIsTyping(false);
    };

    const handleContinue = async (destination: string) => {
        if (!team || !token) return;
        setUpdating(true);
        try {
            await api.post('/game/prologue');
            // Update the context's team to have has_seen_prologue: true
            login(token, { ...team, has_seen_prologue: true });
            navigate(destination);
        } catch (error) {
            console.error('Failed to update prologue status', error);
            // If it fails, let them proceed anyway to not block them
            login(token, { ...team, has_seen_prologue: true });
            navigate(destination);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-4xl p-8 bg-zinc-900/50 border border-zinc-800 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-bold text-accent mb-6 text-center tracking-widest uppercase">Decenda Database - Secure Entry</h2>

                <div className="text-zinc-300 font-mono text-sm leading-relaxed mb-8 min-h-[300px]">
                    {displayedText}
                    {isTyping && <span className="animate-pulse">_</span>}
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                    {isTyping ? (
                        <button
                            onClick={skipTyping}
                            className="text-zinc-500 hover:text-white uppercase tracking-widest text-sm transition-colors font-mono"
                        >
                            Skip
                        </button>
                    ) : (
                        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
                            <span className="text-zinc-400 font-mono text-sm text-center md:text-left">
                                You can try the prologue challenges if you want, or skip directly to the map as they do not provide any points.
                            </span>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => handleContinue('/')}
                                    disabled={updating}
                                    className="flex-1 md:flex-none border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded tracking-wide transition-colors uppercase font-mono text-sm disabled:opacity-50"
                                >
                                    Skip to Map
                                </button>
                                <button
                                    onClick={() => handleContinue('/location/prologue')}
                                    disabled={updating}
                                    className="flex-1 md:flex-none bg-accent hover:bg-red-800 text-white font-bold py-2 px-6 rounded tracking-wide transition-colors uppercase font-mono text-sm disabled:opacity-50"
                                >
                                    Play Prologue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
