import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    // Initialize from localStorage if available
    const [role, setRole] = useState(() => localStorage.getItem('role') || null);
    const [volunteerData, setVolunteerData] = useState(() => {
        const saved = localStorage.getItem('volunteerData');
        return saved ? JSON.parse(saved) : null;
    });
    const [disasterMode, setDisasterMode] = useState(false);

    // Shared Data Cache
    const [activities, setActivities] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [stats, setStats] = useState(null);

    // Persist changes
    useEffect(() => {
        if (role) localStorage.setItem('role', role);
        else localStorage.removeItem('role');
    }, [role]);

    useEffect(() => {
        if (volunteerData) localStorage.setItem('volunteerData', JSON.stringify(volunteerData));
        else localStorage.removeItem('volunteerData');
    }, [volunteerData]);

    const refreshData = async () => {
        const [acts, vols, st, status] = await Promise.all([
            api.getActivities(),
            api.getVolunteers(),
            api.getStats(),
            api.getStatus()
        ]);
        setActivities(acts);
        setVolunteers(vols);
        setStats(st);
        setDisasterMode(status.disaster_mode);
    };

    const logout = () => {
        setRole(null);
        setVolunteerData(null);
        localStorage.removeItem('role');
        localStorage.removeItem('volunteerData');
    };

    useEffect(() => {
        // Initial load
        refreshData();
        // Poll every 5s for live updates
        const interval = setInterval(refreshData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <GlobalContext.Provider value={{
            role, setRole,
            volunteerData, setVolunteerData,
            disasterMode,
            activities, volunteers, stats,
            refreshData,
            logout
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
