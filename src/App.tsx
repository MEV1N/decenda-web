import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Map from './pages/Map';
import Location from './pages/Location';
import Leaderboard from './pages/Leaderboard';
import Prologue from './pages/Prologue';

function ProtectedRoute({ children, allowPrologue = false }: { children: React.ReactNode, allowPrologue?: boolean }) {
  const { isAuthenticated, team } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (team && !team.has_seen_prologue && !allowPrologue) {
    return <Navigate to="/prologue" />;
  }

  return <>{children}</>;
}

function MainLayout() {
  const { isAuthenticated, logout, team } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/50 backdrop-blur-md z-50">
        <h1 className="text-2xl font-heading font-bold text-accent tracking-[5px]">DECENDA</h1>
        {isAuthenticated && (
          <nav className="flex gap-4 items-center">
            {team?.invite_code && (
              <div
                className="group relative flex items-center justify-center text-xs text-accent font-bold uppercase transition-all bg-red-950/30 px-3 py-1 rounded border border-red-900 mr-2 cursor-help w-[140px] h-[26px]"
              >
                <span className="absolute transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                  SHOW TEAM CODE
                </span>
                <span className="absolute transition-opacity duration-300 opacity-0 group-hover:opacity-100 font-mono tracking-widest text-white">
                  {team.invite_code}
                </span>
              </div>
            )}
            <Link to="/leaderboard" className="text-xs text-dimmed hover:text-white uppercase transition-colors">
              Leaderboard
            </Link>
            <button onClick={logout} className="text-xs text-dimmed hover:text-white uppercase transition-colors ml-4 border-l border-zinc-800 pl-4">
              Log out
            </button>
          </nav>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/prologue" element={<ProtectedRoute allowPrologue><Prologue /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Map /></ProtectedRoute>} />
          <Route path="/location/:id" element={<ProtectedRoute><Location /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Minimalistic Vignette / Fog Overlay handled in global CSS or wrapper if needed, but flex-1 is fine for now */}
      <div className="pointer-events-none fixed inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-40"></div>
    </div>
  );
}

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
