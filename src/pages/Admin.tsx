import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface LiveChallenge {
    id: string;
    title: string;
    description: string;
    file_url: string;
    is_bonus: boolean;
    points: number;
    is_locked: boolean;
    locked_instruction?: string | null;
    flag_hash?: string | null;
    created_at: string;
}

interface Hint {
    id: string;
    challenge_id: string;
    hint_text: string;
    penalty_points: number;
}

interface StoryChallenge {
    id: string;
    location_id: string;
    title: string;
    description: string;
    flag_hash: string;
    points: number;
    instance_required: boolean;
    unlocksLocations: string[];
    unlocksPoints: boolean;
    is_locked: boolean;
    locked_instruction?: string | null;
    thumbnail_url?: string | null;
    hints: Hint[];
}

interface LocationData {
    id: string;
    name: string;
    challenges: StoryChallenge[];
}

export default function Admin() {
    const { team } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [challenges, setChallenges] = useState<LiveChallenge[]>([]);
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [activeTab, setActiveTab] = useState<'live' | 'story'>('live');

    // Live Form State
    const [editId, setEditId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState<number>(0);
    const [file, setFile] = useState<File | null>(null);
    const [flagHash, setFlagHash] = useState('');
    const [isBonus, setIsBonus] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [lockedInstruction, setLockedInstruction] = useState('');
    const [thumbnail, setThumbnail] = useState<File | null>(null);

    // Story Form State
    const [storyEditId, setStoryEditId] = useState<string | null>(null);
    const [storyFile, setStoryFile] = useState<File | null>(null);
    const [storyLocId, setStoryLocId] = useState('');
    const [storyTitle, setStoryTitle] = useState('');
    const [storyDesc, setStoryDesc] = useState('');
    const [storyFlag, setStoryFlag] = useState('');
    const [storyPoints, setStoryPoints] = useState(0);
    const [storyInstance, setStoryInstance] = useState(false);
    const [storyUnlocksPts, setStoryUnlocksPts] = useState(false);
    const [storyUnlocksLocs, setStoryUnlocksLocs] = useState<string[]>([]);
    const [storyLocked, setStoryLocked] = useState(false);
    const [storyLockInst, setStoryLockInst] = useState('');
    const [storyThumbnail, setStoryThumbnail] = useState<File | null>(null);
    const [storyHints, setStoryHints] = useState<Hint[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (team?.role !== 'ADMIN') {
            navigate('/');
            addToast('Access denied.', 'error');
            return;
        }
        fetchChallenges();
    }, [team, navigate, addToast]);

    const fetchChallenges = async () => {
        try {
            const res = await api.get('/admin/all-data');
            setChallenges(res.data.liveChallenges);
            setLocations(res.data.locations);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditClick = (challenge: LiveChallenge) => {
        setEditId(challenge.id);
        setTitle(challenge.title);
        setDescription(challenge.description);
        setPoints(challenge.points);
        setIsBonus(challenge.is_bonus);
        setIsLocked(challenge.is_locked);
        setLockedInstruction(challenge.locked_instruction || '');
        setFlagHash(challenge.flag_hash || '');
        setFile(null); // Clear file input since they might not want to re-upload
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStoryEditClick = (challenge: StoryChallenge) => {
        setStoryEditId(challenge.id);
        setStoryLocId(challenge.location_id);
        setStoryTitle(challenge.title);
        setStoryDesc(challenge.description);
        setStoryPoints(challenge.points);
        setStoryFlag(challenge.flag_hash);
        setStoryInstance(challenge.instance_required);
        setStoryUnlocksPts(challenge.unlocksPoints);
        setStoryUnlocksLocs(challenge.unlocksLocations);
        setStoryLocked(challenge.is_locked);
        setStoryLockInst(challenge.locked_instruction || '');
        setStoryHints(challenge.hints || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditId(null);
        setTitle('');
        setDescription('');
        setPoints(0);
        setFile(null);
        setThumbnail(null);
        setFlagHash('');
        setIsBonus(false);
        setIsLocked(false);
        setLockedInstruction('');
    };

    const resetStoryForm = () => {
        setStoryEditId(null);
        setStoryLocId('');
        setStoryTitle('');
        setStoryDesc('');
        setStoryPoints(0);
        setStoryFlag('');
        setStoryInstance(false);
        setStoryUnlocksPts(false);
        setStoryUnlocksLocs([]);
        setStoryLocked(false);
        setStoryLockInst('');
        setStoryThumbnail(null);
        setStoryHints([]);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        // If creating a new challenge, file is required. If editing, it's optional.
        if (!title || !description || (!file && !editId)) {
            addToast('Please fill all required fields', 'warning');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('flag_hash', flagHash);
        formData.append('is_bonus', isBonus ? 'true' : 'false');
        formData.append('points', points.toString());
        formData.append('is_locked', isLocked ? 'true' : 'false');
        if (lockedInstruction) {
            formData.append('locked_instruction', lockedInstruction);
        }
        if (file) {
            formData.append('file', file);
        }
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }

        try {
            if (editId) {
                await api.put(`/admin/live-challenge/${editId}`, formData);
                addToast('Case file updated successfully', 'success');
            } else {
                await api.post('/admin/live-challenge', formData);
                addToast('Case file deployed successfully', 'success');
            }

            resetForm();
            fetchChallenges();
        } catch (err: any) {
            console.error(err);
            const serverMsg = err?.response?.data?.detail || err?.response?.data?.error || '';
            addToast(`Failed to ${editId ? 'update' : 'deploy'} case file${serverMsg ? ': ' + serverMsg : ''}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this case file?')) return;
        try {
            await api.delete(`/admin/live-challenge/${id}`);
            addToast('Case file deleted', 'info');
            fetchChallenges();
        } catch (err) {
            console.error(err);
            addToast('Failed to delete case file', 'error');
        }
    };

    const handleStoryUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!storyTitle || !storyDesc || !storyLocId || !storyEditId) {
            addToast('Please select a story challenge to edit first', 'warning');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('id', storyEditId);
            formData.append('location_id', storyLocId);
            formData.append('title', storyTitle);
            formData.append('description', storyDesc);
            formData.append('flag_hash', storyFlag);
            formData.append('points', storyPoints.toString());
            formData.append('instance_required', storyInstance ? 'true' : 'false');
            formData.append('unlocksLocations', JSON.stringify(storyUnlocksLocs));
            formData.append('unlocksPoints', storyUnlocksPts ? 'true' : 'false');
            formData.append('is_locked', storyLocked ? 'true' : 'false');
            if (storyLockInst) formData.append('locked_instruction', storyLockInst);
            if (storyFile) formData.append('file', storyFile);
            if (storyThumbnail) formData.append('thumbnail', storyThumbnail);

            await api.post('/admin/challenge', formData);
            addToast('Story Case file updated successfully', 'success');
            resetStoryForm();
            fetchChallenges();
        } catch (err: any) {
            console.error(err);
            const serverMsg = err?.response?.data?.error || '';
            addToast(`Failed to update story case file${serverMsg ? ': ' + serverMsg : ''}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddHint = async () => {
        if (!storyEditId) return;
        try {
            const res = await api.post('/admin/hint', {
                challenge_id: storyEditId,
                hint_text: 'New hint text...',
                penalty_points: 10
            });
            setStoryHints([...storyHints, res.data]);
            addToast('Hint added', 'success');
        } catch (err) {
            addToast('Failed to add hint', 'error');
        }
    };

    const handleUpdateHint = async (hintId: string, text: string, points: number) => {
        try {
            await api.post('/admin/hint', {
                id: hintId,
                hint_text: text,
                penalty_points: points
            });
            addToast('Hint autosaved', 'success');
        } catch (err) {
            addToast('Failed to save hint', 'error');
        }
    };

    const handleDeleteHint = async (hintId: string) => {
        if (!confirm('Delete this hint?')) return;
        try {
            await api.delete(`/admin/hint/${hintId}`);
            setStoryHints(storyHints.filter(h => h.id !== hintId));
            addToast('Hint deleted', 'info');
        } catch (err) {
            addToast('Failed to delete hint', 'error');
        }
    };

    if (team?.role !== 'ADMIN') return null;

    const handleDeleteStory = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this story challenge?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/challenge/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                addToast('Story challenge deleted', 'success');
                fetchChallenges();
            } else {
                const data = await response.json();
                addToast(data.error || 'Failed to delete challenge', 'error');
            }
        } catch (error) {
            addToast('Network error', 'error');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden p-4 md:p-8 w-full max-w-7xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-accent uppercase tracking-widest border-b border-zinc-800 pb-2 mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <span>Admin Station</span>
                <div className="flex gap-4 text-sm font-sans font-bold overflow-x-auto pb-1">
                    <button onClick={() => setActiveTab('live')} className={`px-4 py-2 uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${activeTab === 'live' ? 'border-accent text-white' : 'border-transparent text-dimmed hover:text-white'}`}>Live Case Files</button>
                    <button onClick={() => setActiveTab('story')} className={`px-4 py-2 uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${activeTab === 'story' ? 'border-accent text-white' : 'border-transparent text-dimmed hover:text-white'}`}>Story Case Files</button>
                </div>
            </h2>

            {activeTab === 'live' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 custom-scrollbar overflow-auto">
                    <form onSubmit={handleUpload} className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded relative">
                        <h3 className="text-xl font-heading font-bold text-white mb-4 uppercase tracking-wider">{editId ? 'Edit Live Challenge' : 'Deploy Live Challenge'}</h3>
                        {editId && (
                            <button type="button" onClick={resetForm} className="absolute top-6 right-6 text-xs text-dimmed hover:text-white border border-zinc-700 px-2 py-1 rounded">Cancel Edit</button>
                        )}
                        <div>
                            <label className="block text-xs uppercase text-dimmed mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                                placeholder="e.g. Operation Goldenrod"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-dimmed mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-accent min-h-[100px]"
                                placeholder="Context and details..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-dimmed mb-1">Points</label>
                                <input
                                    type="number"
                                    value={points}
                                    onChange={e => setPoints(parseInt(e.target.value) || 0)}
                                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-dimmed mb-1">Passcode/Flag</label>
                                <input
                                    type="text"
                                    value={flagHash}
                                    onChange={e => setFlagHash(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-zinc-500 font-mono text-sm focus:outline-none focus:border-accent"
                                    placeholder="Enter exact flag"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isBonus"
                                    checked={isBonus}
                                    onChange={e => setIsBonus(e.target.checked)}
                                    className="accent-yellow-500 w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="isBonus" className="text-sm font-bold text-yellow-500 uppercase cursor-pointer">
                                    Golden Jackpot
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isLocked"
                                    checked={isLocked}
                                    onChange={e => setIsLocked(e.target.checked)}
                                    className="accent-red-600 w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="isLocked" className="text-sm font-bold text-red-500 uppercase cursor-pointer flex items-center gap-1">
                                    [LOCKED] / MALFUNCTION
                                    {isLocked && <span className="text-xs text-dimmed">(Hidden from players)</span>}
                                </label>
                            </div>
                        </div>

                        {isLocked && (
                            <div>
                                <label className="block text-xs uppercase text-red-400 mb-1">Lock Instruction (Shown to players)</label>
                                <textarea
                                    value={lockedInstruction}
                                    onChange={e => setLockedInstruction(e.target.value)}
                                    className="w-full bg-red-950/20 border border-red-900 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500 min-h-[60px]"
                                    placeholder="e.g. SYSTEM ERROR: DECRYPTION FAILED. AWAIT FURTHER INSTRUCTIONS."
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-dimmed mb-1">
                                    {editId ? 'Replace Case File (Optional)' : 'Case File'}
                                </label>
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="w-full text-dimmed file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-dimmed mb-1">
                                    Thumbnail Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setThumbnail(e.target.files?.[0] || null)}
                                    className="w-full text-dimmed file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 font-bold uppercase tracking-wider rounded transition-colors mt-6 ${loading ? 'bg-zinc-800 text-dimmed cursor-not-allowed' : (editId ? 'bg-blue-900 border border-blue-700 hover:bg-blue-800 text-white' : 'bg-accent hover:bg-red-800 text-white')}`}
                        >
                            {loading ? 'Processing...' : (editId ? 'Update Case File' : 'Deploy Case File')}
                        </button>
                    </form>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 uppercase tracking-wider">Active Live Challenges</h3>
                        <div className="space-y-4">
                            {challenges.length === 0 ? (
                                <p className="text-dimmed text-sm">No live challenges currently deployed.</p>
                            ) : (
                                challenges.map(challenge => (
                                    <div key={challenge.id} className={`p-4 border rounded relative overflow-hidden ${challenge.is_locked ? 'border-zinc-800 bg-zinc-950 opacity-60' : (challenge.is_bonus ? 'border-yellow-900/50 bg-yellow-950/20' : 'border-zinc-800 bg-black')}`}>
                                        {challenge.is_locked && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-4xl font-black text-red-900/30 uppercase tracking-widest rotate-12">LOCKED</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div>
                                                <h4 className={`font-bold ${challenge.is_locked ? 'text-dimmed line-through' : (challenge.is_bonus ? 'text-yellow-500' : 'text-white')}`}>
                                                    {challenge.title}
                                                </h4>
                                                <span className="text-xs text-accent font-mono font-bold">{challenge.points} PTS</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(challenge)}
                                                    className="text-xs text-blue-400 hover:text-white uppercase tracking-wider px-2 py-1 border border-blue-900 rounded hover:bg-blue-900 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(challenge.id)}
                                                    className="text-xs text-red-500 hover:text-white uppercase tracking-wider px-2 py-1 border border-red-900 rounded hover:bg-red-900 transition-colors"
                                                >
                                                    Del
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-dimmed mb-3 whitespace-pre-wrap relative z-10">{challenge.description}</p>
                                        <div className="flex justify-between items-center text-xs relative z-10">
                                            <span className="text-dimmed">Deployed: {new Date(challenge.created_at).toLocaleString()}</span>
                                            <a
                                                href={api.defaults.baseURL?.replace('/api', '') + challenge.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${challenge.is_locked ? 'text-zinc-600 pointer-events-none' : 'text-accent hover:underline'}`}
                                            >
                                                View File
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'story' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 custom-scrollbar overflow-auto">
                    <form onSubmit={handleStoryUpload} className={`space-y-4 bg-zinc-900 border p-6 rounded relative transition-colors ${storyEditId ? 'border-blue-900 shadow-[0_0_15px_rgba(30,58,138,0.2)]' : 'border-zinc-800 opacity-50 pointer-events-none'}`}>
                        <h3 className="text-xl font-heading font-bold text-white mb-4 uppercase tracking-wider">Edit Story Challenge</h3>
                        {storyEditId ? (
                            <button type="button" onClick={resetStoryForm} className="absolute top-6 right-6 text-xs text-blue-400 hover:text-white border border-blue-900 hover:bg-blue-900 transition-colors px-2 py-1 rounded uppercase tracking-wider">Cancel Edit</button>
                        ) : (
                            <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-black/40 rounded">
                                <span className="text-xl font-bold uppercase tracking-widest text-dimmed">Select a challenge to edit</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs uppercase text-dimmed mb-1">Title</label>
                            <input
                                type="text"
                                value={storyTitle}
                                onChange={e => setStoryTitle(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-dimmed mb-1">Description (Markdown Supported)</label>
                            <textarea
                                value={storyDesc}
                                onChange={e => setStoryDesc(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[150px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-dimmed mb-1">Points</label>
                                <input type="number" value={storyPoints} onChange={e => setStoryPoints(parseInt(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-dimmed mb-1">Flag Hash (No touch unless sure)</label>
                                <input type="text" value={storyFlag} onChange={e => setStoryFlag(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-zinc-500 focus:outline-none focus:border-blue-500 text-xs font-mono" />
                            </div>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-dimmed uppercase tracking-wider">File Attachment (Optional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.zip,.apk,.bmp"
                                    onChange={(e) => setStoryFile(e.target.files ? e.target.files[0] : null)}
                                    className="bg-black border border-zinc-700 rounded p-2 text-white font-mono text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-dimmed uppercase tracking-wider">Thumbnail Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setStoryThumbnail(e.target.files ? e.target.files[0] : null)}
                                    className="bg-black border border-zinc-700 rounded p-2 text-white font-mono text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Hint Management */}
                        <div className="border-t border-zinc-800 pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-white">Hints Management</h4>
                                <button type="button" onClick={handleAddHint} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded border border-zinc-700 transition-colors uppercase tracking-wider">+ Add Hint</button>
                            </div>
                            <div className="space-y-3">
                                {storyHints.length === 0 ? (
                                    <p className="text-xs text-dimmed italic">No hints added for this challenge.</p>
                                ) : (
                                    storyHints.map((hint, idx) => (
                                        <div key={hint.id || idx} className="bg-black/50 border border-zinc-800 p-3 rounded space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-accent uppercase font-bold tracking-widest">Hint {idx + 1}</span>
                                                <button type="button" onClick={() => handleDeleteHint(hint.id)} className="text-[10px] text-red-500 hover:text-red-400 uppercase font-bold">Delete</button>
                                            </div>
                                            <textarea
                                                value={hint.hint_text}
                                                onChange={(e) => {
                                                    const newHints = [...storyHints];
                                                    newHints[idx].hint_text = e.target.value;
                                                    setStoryHints(newHints);
                                                }}
                                                onBlur={() => handleUpdateHint(hint.id, hint.hint_text, hint.penalty_points)}
                                                className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[60px]"
                                                placeholder="Hint content..."
                                            />
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] text-dimmed uppercase">Penalty Points:</label>
                                                <input
                                                    type="number"
                                                    value={hint.penalty_points}
                                                    onChange={(e) => {
                                                        const newHints = [...storyHints];
                                                        newHints[idx].penalty_points = parseInt(e.target.value) || 0;
                                                        setStoryHints(newHints);
                                                    }}
                                                    onBlur={() => handleUpdateHint(hint.id, hint.hint_text, hint.penalty_points)}
                                                    className="bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white w-20 focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="storyLocked" checked={storyLocked} onChange={e => setStoryLocked(e.target.checked)} className="accent-red-600 w-4 h-4 cursor-pointer" />
                            <label htmlFor="storyLocked" className="text-sm font-bold text-red-500 uppercase cursor-pointer flex items-center gap-1">
                                [LOCKED] / MALFUNCTION
                            </label>
                        </div>
                        {storyLocked && (
                            <div>
                                <label className="block text-xs uppercase text-red-400 mb-1">Lock Instruction (Shown to players)</label>
                                <textarea
                                    value={storyLockInst}
                                    onChange={e => setStoryLockInst(e.target.value)}
                                    className="w-full bg-red-950/20 border border-red-900 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500 min-h-[60px]"
                                    placeholder="e.g. SYSTEM ERROR: DECRYPTION FAILED."
                                />
                            </div>
                        )}

                        <button type="submit" disabled={loading || !storyEditId} className={`w-full py-3 font-bold uppercase tracking-wider rounded transition-colors mt-6 ${loading ? 'bg-zinc-800 text-dimmed cursor-not-allowed' : 'bg-blue-900 border border-blue-700 hover:bg-blue-800 text-white'}`}>
                            {loading ? 'Processing...' : 'Update Story Case File'}
                        </button>
                    </form>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded overflow-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 uppercase tracking-wider">Map Locations</h3>
                        <div className="space-y-8 pb-10">
                            {locations.map(loc => (
                                <div key={loc.id} className="border border-zinc-800 rounded overflow-hidden">
                                    <div className="bg-black border-b border-zinc-800 px-4 py-3 sticky top-0 z-10">
                                        <h4 className="font-bold text-accent uppercase tracking-widest">{loc.name}</h4>
                                    </div>
                                    <div className="p-4 space-y-3 bg-zinc-950/50">
                                        {loc.challenges.length === 0 ? (
                                            <p className="text-dimmed text-sm italic">No challenges in this location.</p>
                                        ) : (
                                            loc.challenges.map(chal => (
                                                <div key={chal.id} className={`p-3 border rounded relative overflow-hidden ${chal.is_locked ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 bg-black'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className={`font-bold uppercase tracking-wider ${chal.is_locked ? 'text-red-500' : 'text-white'}`}>{chal.title}</h5>
                                                            <span className="text-xs text-accent font-mono font-bold">{chal.points} PTS</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleStoryEditClick(chal)}
                                                                className={`text-xs uppercase tracking-wider px-3 py-1 border rounded transition-colors ${storyEditId === chal.id ? 'bg-blue-900 text-white border-blue-700' : 'text-blue-400 border-blue-900 hover:bg-blue-900 hover:text-white'}`}
                                                            >
                                                                {storyEditId === chal.id ? 'Editing' : 'Edit'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStory(chal.id)}
                                                                className="text-xs text-red-500 hover:text-white uppercase tracking-wider px-2 py-1 border border-red-900 rounded hover:bg-red-900 transition-colors"
                                                            >
                                                                Del
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-dimmed line-clamp-2 leading-relaxed">{chal.description}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div >
            )
            }
        </div >
    );
}
