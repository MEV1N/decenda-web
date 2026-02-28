import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    points: number;
    solvesCount: number;
    lastSolve: string | null;
}

export default function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await api.get('/leaderboard');
                setEntries(res.data);
            } catch (err) {
                console.error('Failed to load leaderboard', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-heading font-bold text-accent uppercase tracking-widest">Global Rankings</h1>
                <button onClick={() => navigate('/')} className="text-dimmed hover:text-white uppercase text-xs tracking-wider border border-zinc-800 px-4 py-2 bg-black/50 hover:bg-zinc-900 transition-colors">
                    Return to Board
                </button>
            </div>

            {loading ? (
                <div className="text-center text-dimmed">Loading records...</div>
            ) : (
                <div className="w-full overflow-x-auto shadow-2xl">
                    <table className="w-full text-left font-mono text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-accent bg-black/60 text-accent">
                                <th className="p-4 uppercase tracking-wider">Rank</th>
                                <th className="p-4 uppercase tracking-wider">Team Name</th>
                                <th className="p-4 uppercase tracking-wider">Score</th>
                                <th className="p-4 uppercase tracking-wider">Solves</th>
                                <th className="p-4 uppercase tracking-wider">Last Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, idx) => (
                                <tr
                                    key={entry.id}
                                    className={`border-b border-zinc-800 ${idx % 2 === 0 ? 'bg-zinc-900/40' : 'bg-black/40'} hover:bg-red-900/10 transition-colors`}
                                >
                                    <td className="p-4 font-bold text-dimmed">#{entry.rank}</td>
                                    <td className="p-4 text-white uppercase">{entry.name}</td>
                                    <td className="p-4 text-accent font-bold">{entry.points}</td>
                                    <td className="p-4 text-zinc-400">{entry.solvesCount}</td>
                                    <td className="p-4 text-zinc-500 text-xs">
                                        {entry.lastSolve ? new Date(entry.lastSolve).toLocaleString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-dimmed">No cleared agents found in the system.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
