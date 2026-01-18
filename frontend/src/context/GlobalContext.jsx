import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [role, setRole] = useState(null); // 'volunteer' | 'po' | null
    const [volunteerData, setVolunteerData] = useState(null); // If role is volunteer
    const [disasterMode, setDisasterMode] = useState(false);

    // Shared Data Cache
    const [activities, setActivities] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [stats, setStats] = useState(null);

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
            refreshData
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
