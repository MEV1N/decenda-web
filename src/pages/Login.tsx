import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [teamName, setTeamName] = useState('');
    const [password, setPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'create') {
                const res = await api.post('/auth/create', { teamName, password });
                login(res.data.token, res.data.team);
                navigate('/');
            } else {
                const res = await api.post('/auth/join', { inviteCode });
                login(res.data.token, res.data.team);
                navigate('/');
            }
        } catch (err: any) {
            console.error("LOGIN ERROR:", err);
            const errorData = err.response?.data?.error;
            const errMsg = typeof errorData === 'string'
                ? errorData
                : (errorData?.message ? errorData.message : 'Authentication failed (500)');
            setError(errMsg);
            alert("Login Failed: " + errMsg + "\nCheck console for details.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-sm p-8 bg-zinc-900 border border-zinc-800 rounded-md shadow-[0_0_15px_rgba(139,0,0,0.1)]">
                <h2 className="text-2xl font-bold text-accent mb-6 text-center tracking-widest uppercase">Decenda Database</h2>

                <div className="flex border-b border-zinc-800 mb-6 font-mono text-sm">
                    <button
                        onClick={() => { setMode('create'); setError(''); }}
                        className={`flex-1 pb-2 uppercase tracking-wider transition-colors ${mode === 'create' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-white'}`}
                    >
                        Create
                    </button>
                    <button
                        onClick={() => { setMode('join'); setError(''); }}
                        className={`flex-1 pb-2 uppercase tracking-wider transition-colors ${mode === 'join' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-white'}`}
                    >
                        Join
                    </button>
                </div>

                {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {mode === 'create' ? (
                        <>
                            <input
                                className="bg-black border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-accent font-mono text-sm"
                                type="text"
                                placeholder="Team Name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                required
                            />
                            <input
                                className="bg-black border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-accent font-mono text-sm"
                                type="password"
                                placeholder="Team Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </>
                    ) : (
                        <input
                            className="bg-black border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-accent font-mono text-sm text-center tracking-[4px]"
                            type="text"
                            placeholder="6-Digit Invite Code"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            maxLength={6}
                            required
                        />
                    )}
                    <button type="submit" className="mt-4 bg-accent hover:bg-red-800 text-white font-bold py-3 rounded tracking-wide transition-colors uppercase">
                        {mode === 'create' ? 'Create Team' : 'Join Team'}
                    </button>
                </form>
            </div>
        </div>
    );
}
