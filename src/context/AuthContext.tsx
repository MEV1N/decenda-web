import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface Team {
    id: string;
    name: string;
    role: string;
    invite_code: string;
    has_seen_prologue: boolean;
}

interface AuthContextType {
    team: Team | null;
    token: string | null;
    login: (token: string, team: Team) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [team, setTeam] = useState<Team | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            const savedTeam = localStorage.getItem('team');
            if (savedTeam) {
                const parsedTeam = JSON.parse(savedTeam);
                if (!parsedTeam.invite_code) {
                    // Old session detected without invite_code. Force re-login.
                    localStorage.removeItem('token');
                    localStorage.removeItem('team');
                    setToken(null);
                    setTeam(null);
                    window.location.href = '/#/login';
                    return;
                }
                setTeam(parsedTeam);
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = (newToken: string, newTeam: Team) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('team', JSON.stringify(newTeam));
        setToken(newToken);
        setTeam(newTeam);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('team');
        setToken(null);
        setTeam(null);
        window.location.href = '/#/login';
    };

    return (
        <AuthContext.Provider value={{ team, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
