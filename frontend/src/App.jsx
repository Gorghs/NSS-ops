import React, { useState } from 'react';
import { GlobalProvider, useGlobal } from './context/GlobalContext';
import RoleSelection from './components/RoleSelection';
import { VolunteerLayout } from './components/VolunteerComponents';
import { POLayout } from './components/POComponents';

function AppContent() {
    const { role } = useGlobal();

    if (!role) return <RoleSelection />;
    if (role === 'volunteer') return <VolunteerLayout />;
    if (role === 'po') return <POLayout />;

    return <div>Error: Invalid Role</div>;
}

export default function App() {
    return (
        <GlobalProvider>
            <AppContent />
        </GlobalProvider>
    );
}
