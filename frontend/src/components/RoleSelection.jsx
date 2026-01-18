import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import {
    Users, ShieldCheck, ArrowRight, Activity, Heart,
    Lock, Mail, ChevronLeft, Loader2
} from 'lucide-react';

export default function RoleSelection() {
    const { setRole, setVolunteerData } = useGlobal();
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState('selection'); // 'selection' | 'login-po' | 'login-volunteer'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (role, email) => {
        setIsLoading(true);
        setError(null);

        try {
            // Import api here or at top level if not circular
            const { api } = await import('../api');

            const res = await api.login(email, role);

            if (res.success) {
                if (role === 'volunteer') {
                    setVolunteerData(res.volunteer); // Set existing data!
                }
                setRole(role);
            } else {
                setError(res.error || "Login failed");
            }
        } catch (e) {
            console.error(e);
            setError("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">

            {/* Elegant Background - Optimized for Light Mode */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-50/50 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl opacity-40"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="container mx-auto px-6 h-screen flex flex-col">

                {/* Header */}
                <header className="py-8 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-600 p-2 rounded-xl text-white shadow-lg shadow-brand-600/20">
                            <Activity size={24} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-800">NSS OPS</span>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex items-center justify-center relative">

                    {/* View: Selection */}
                    {view === 'selection' && (
                        <div className="w-full max-w-6xl mx-auto animate-fade-in">
                            <div className="text-center mb-16 space-y-6">
                                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                                    Serve with <span className="text-brand-600 relative inline-block">
                                        Purpose.
                                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                        </svg>
                                    </span> <br className="hidden md:block" />
                                    Manage with <span className="text-indigo-600">Intelligence.</span>
                                </h1>
                                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                                    The next-generation platform for National Service Scheme.
                                    Connecting volunteers with impact.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                <RoleCard
                                    title="Volunteer"
                                    description="Join missions, track hours, and make a difference in your community."
                                    icon={<Users size={48} />}
                                    color="brand"
                                    onClick={() => setView('login-volunteer')}
                                />
                                <RoleCard
                                    title="Programme Officer"
                                    description="Manage units, verify proofs, and generate AI-powered reports."
                                    icon={<ShieldCheck size={48} />}
                                    color="indigo"
                                    onClick={() => setView('login-po')}
                                />
                            </div>
                        </div>
                    )}

                    {/* View: Login (Volunteer or PO) */}
                    {(view === 'login-volunteer' || view === 'login-po') && (
                        <div className="w-full max-w-md animate-slide-up">
                            <button
                                onClick={() => setView('selection')}
                                className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium group"
                            >
                                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                Back to Selection
                            </button>

                            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50 ring-1 ring-slate-100">
                                <div className="text-center mb-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 transition-transform hover:rotate-6
                                        ${view === 'login-volunteer' ? 'bg-brand-100 text-brand-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {view === 'login-volunteer' ? <Heart size={32} fill="currentColor" /> : <ShieldCheck size={32} />}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {view === 'login-volunteer' ? 'Volunteer Login' : 'Officer Portal'}
                                    </h2>
                                    <p className="text-slate-500 mt-2">
                                        Please enter your credentials to continue.
                                    </p>
                                </div>

                                <form className="space-y-5" onSubmit={async (e) => {
                                    e.preventDefault();
                                    const email = e.target.email.value;
                                    await handleLogin(view === 'login-volunteer' ? 'volunteer' : 'po', email);
                                }}>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                name="email"
                                                type="email"
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 rounded-xl transition-all font-medium outline-none placeholder:text-slate-400 text-slate-900"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between ml-1">
                                            <label className="text-sm font-semibold text-slate-700">Password</label>
                                            <a href="#" className="text-xs font-semibold text-brand-600 hover:underline">Forgot?</a>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="password"
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 rounded-xl transition-all font-medium outline-none placeholder:text-slate-400 text-slate-900"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2
                                            ${view === 'login-volunteer' ? 'bg-brand-600 hover:bg-brand-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    >
                                        {isLoading ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <>
                                                Sign In <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-sm text-slate-400 font-medium">
                                        New here? <button onClick={() => setRole('volunteer')} className="text-slate-700 hover:text-brand-600 underline decoration-2 underline-offset-4">Create an account</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="py-6 text-center text-slate-400 text-sm font-medium flex items-center justify-center gap-1">
                    Made with <Heart size={16} className="text-red-500 fill-current" /> by <a href="https://www.linkedin.com/in/karthickv4" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Karthick</a>
                </footer>
            </div>
        </div>
    );
}

function RoleCard({ title, description, icon, color, onClick }) {
    const isBrand = color === 'brand';

    return (
        <button
            onClick={onClick}
            className={`group relative text-left p-8 rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden
                ${isBrand
                    ? 'bg-white border-slate-100 hover:border-brand-200'
                    : 'bg-white border-slate-100 hover:border-indigo-200'}`}
        >
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 translate-x-1/3 -translate-y-1/3
                ${isBrand ? 'bg-brand-600' : 'bg-indigo-600'}`}></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300
                    ${isBrand ? 'bg-brand-50 text-brand-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {React.cloneElement(icon, { size: 32 })}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700">
                    {title}
                </h3>

                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {description}
                </p>

                <div className={`mt-auto flex items-center font-bold text-lg transition-all group-hover:gap-2
                    ${isBrand ? 'text-brand-600' : 'text-indigo-600'}`}>
                    Access Portal <ArrowRight size={20} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
            </div>
        </button>
    );
}
