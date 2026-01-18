import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalProvider, useGlobal } from './context/GlobalContext';
import RoleSelection from './components/RoleSelection';
import { VolunteerLayout } from './components/VolunteerComponents';
import { POLayout } from './components/POComponents';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
    const { role } = useGlobal();
    if (!role) return <Navigate to="/login" replace />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
    return children;
};

// Main App Routing
function AppContent() {
    const { role } = useGlobal();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!role ? <RoleSelection /> : <Navigate to={role === 'volunteer' ? '/volunteer' : '/po'} />} />

            {/* Default redirect based on auth status */}
            <Route path="/" element={<Navigate to={role ? (role === 'volunteer' ? '/volunteer' : '/po') : '/login'} replace />} />

            {/* Protected Routes */}
            <Route path="/volunteer" element={
                <ProtectedRoute allowedRole="volunteer">
                    <VolunteerLayout />
                </ProtectedRoute>
            } />

            <Route path="/po" element={
                <ProtectedRoute allowedRole="po">
                    <POLayout />
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <GlobalProvider>
                <AppContent />
            </GlobalProvider>
        </BrowserRouter>
    );
}
