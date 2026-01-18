import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../api';
import {
    Plus, Users, Brain, ShieldAlert, BarChart3, Check, X, Zap,
    MapPin, Clock, Search, Calendar, ChevronRight, LayoutDashboard,
    FileEdit, ClipboardList, Lightbulb, CheckCircle
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const POLayout = () => {
    const { disasterMode, refreshData } = useGlobal();
    const [activeTab, setActiveTab] = useState('dashboard');

    const toggleDisaster = async () => {
        await api.toggleDisasterMode(!disasterMode);
        refreshData();
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'create_activity', label: 'Create Activity', icon: FileEdit },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'planning', label: 'AI Planning', icon: Lightbulb },
    ];

    return (
        <div className={`min-h-screen flex flex-col md:flex-row ${disasterMode ? 'bg-red-50' : 'bg-slate-50'}`}>
            
            {/* Sidebar Navigation */}
            <aside className={`w-full md:w-72 flex-shrink-0 z-20 transition-colors duration-300
                ${disasterMode ? 'bg-red-900 text-red-50' : 'bg-slate-900 text-slate-300'}`}>
                
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl
                            ${disasterMode ? 'bg-red-500 text-white' : 'bg-brand-500 text-white'}`}>
                            {disasterMode ? <ShieldAlert size={20} /> : <Brain size={20} />}
                        </div>
                        <div>
                            <h1 className="font-bold text-white tracking-tight leading-none">NSS OPS</h1>
                            <p className="text-xs opacity-60 font-mono mt-1">v2.0 PROTOTYPE</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                        ${isActive 
                                            ? (disasterMode ? 'bg-red-800 text-white shadow-lg' : 'bg-brand-600 text-white shadow-lg shadow-brand-900/20') 
                                            : 'hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
                                    <span className="font-medium">{tab.label}</span>
                                    {isActive && <ChevronRight size={16} className="ml-auto opacity-60" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                   <button onClick={toggleDisaster}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg
                        ${disasterMode 
                            ? 'bg-white text-red-600 hover:bg-red-50' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white'}`}>
                        <Zap size={16} />
                        {disasterMode ? 'DEACTIVATE EMERGENCY' : 'EMERGENCY MODE'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto">
                <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl bg-white/80">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace('_', ' ')}</h2>
                        <p className="text-slate-500 text-sm">Overview of your unit's performance</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Clock size={14} />
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border-2 border-white shadow-sm ring-2 ring-slate-100">
                            PO
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                    {activeTab === 'dashboard' && <PODashboard />}
                    {activeTab === 'create_activity' && <ActivityCreator onSuccess={() => setActiveTab('assignments')} />}
                    {activeTab === 'assignments' && <AssignmentManager />}
                    {activeTab === 'planning' && <AIPlanner onRequestCreate={() => setActiveTab('create_activity')} />}
                </div>
            </main>
        </div>
    );
};

const PODashboard = () => {
    const { stats } = useGlobal();
    if (!stats) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
    );

    const chartData = {
        labels: ['Volunteers', 'Activities', 'Verified'],
        datasets: [{
            label: 'Unit Metrics',
            data: [stats.volunteers_count, stats.activities_created, stats.activities_verified],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981'],
            borderRadius: 6,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Volunteers" 
                    value={stats.volunteers_count} 
                    icon={<Users className="text-brand-600" size={24} />}
                    trend="+12% this month"
                    color="bg-brand-50"
                />
                <StatCard 
                    title="Hours Served" 
                    value={stats.total_hours} 
                    icon={<Clock className="text-emerald-600" size={24} />}
                    trend="+5% vs target"
                    color="bg-emerald-50"
                />
                <StatCard 
                    title="Active Tasks" 
                    value={stats.activities_created} 
                    icon={<MapPin className="text-violet-600" size={24} />}
                    trend="3 urgent"
                    color="bg-violet-50"
                />
                <StatCard 
                    title="Completions" 
                    value={stats.activities_verified} 
                    icon={<Check className="text-orange-600" size={24} />}
                    trend="98% approval rate"
                    color="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-slate-400" />
                        Performance Analytics
                    </h3>
                    <div className="h-64">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
                
                <div className="card bg-gradient-to-br from-brand-600 to-brand-800 text-white border-none">
                    <h3 className="font-bold text-lg mb-2 opacity-90">Quick Actions</h3>
                    <p className="text-brand-100 text-sm mb-6">Manage your unit efficiently.</p>
                    
                    <div className="space-y-3">
                        <button className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-xl transition flex items-center gap-3">
                            <Plus size={18} /> New Activity
                        </button>
                        <button className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-xl transition flex items-center gap-3">
                            <Users size={18} /> Manage Volunteers
                        </button>
                        <button className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-xl transition flex items-center gap-3">
                            <FileEdit size={18} /> Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="card hover:translate-y-[-2px] transition-transform duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
            {trend && <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{trend}</span>}
        </div>
        <div>
            <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

// --- MODULE 3: ACTIVITY CREATION ---
const ActivityCreator = ({ onSuccess, prefill }) => {
    const { refreshData } = useGlobal();
    const [form, setForm] = useState(prefill || {
        title: '', type: 'General', location: '', required_count: 5, estimated_hours: 3, skills_needed: []
    });

    const SKILLS = ['teaching', 'medical', 'physical_labor', 'tech'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.createActivity(form);
        await refreshData();
        onSuccess();
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="card">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Create New Activity</h2>
                        <p className="text-slate-500 text-sm">Define a new task for your volunteers.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="label-text">Activity Title</label>
                            <input className="input-field" placeholder="e.g. Campus Clean-up Drive" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        
                        <div>
                            <label className="label-text">Type</label>
                            <div className="relative">
                                <select className="input-field appearance-none" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option>General</option>
                                    <option>clean-up</option>
                                    <option>medical</option>
                                    <option>education</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="label-text">Location</label>
                            <div className="relative">
                                <input className="input-field pl-10" placeholder="Where is it?" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="label-text">Volunteers Needed</label>
                            <input type="number" className="input-field" required value={form.required_count} onChange={e => setForm({ ...form, required_count: e.target.value })} />
                        </div>
                        
                        <div>
                            <label className="label-text">Estimated Hours</label>
                            <input type="number" className="input-field" required value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="label-text mb-3 block">Required Skills</label>
                        <div className="flex flex-wrap gap-3">
                            {SKILLS.map(s => (
                                <label key={s} className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border
                                    ${form.skills_needed.includes(s) 
                                        ? 'bg-brand-50 border-brand-200 text-brand-700 ring-1 ring-brand-500' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}
                                `}>
                                    <input type="checkbox" className="hidden"
                                        checked={form.skills_needed.includes(s)}
                                        onChange={e => {
                                            const newSkills = e.target.checked
                                                ? [...form.skills_needed, s]
                                                : form.skills_needed.filter(k => k !== s);
                                            setForm({ ...form, skills_needed: newSkills });
                                        }}
                                    />
                                    <span className="capitalize font-medium">{s.replace('_', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" className="btn-secondary">Cancel</button>
                        <button className="btn-primary px-8">Create Activity</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MODULE 4 & 5: ASSIGNMENTS & MATCHING ---
const AssignmentManager = () => {
    const { activities, volunteers, refreshData } = useGlobal();
    const [matchingActivity, setMatchingActivity] = useState(null); // ID of act
    const [matches, setMatches] = useState([]);

    const handleMatch = async (actId) => {
        setMatchingActivity(actId);
        const res = await api.getMatches(actId);
        setMatches(res);
    };

    const confirmAssignment = async (actId, volunteerId) => {
        await api.assignVolunteers(actId, [volunteerId]);
        setMatchingActivity(null);
        refreshData();
    };

    const handleVerify = async (actId, approve) => {
        await api.verifyActivity(actId, approve);
        refreshData();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'CREATED': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'ASSIGNED': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PROOF_SUBMITTED': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'VERIFIED': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Activity Management</h2>
                <div className="flex gap-2">
                    <input placeholder="Search activities..." className="px-4 py-2 rounded-lg border border-slate-200 text-sm w-64" />
                </div>
            </div>

            <div className="grid gap-6">
                {activities.map(act => (
                    <div key={act.id} className="card relative overflow-hidden group">
                        {act.urgency > 1 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                URGENT
                            </div>
                        )}
                        
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-2 ${getStatusColor(act.status)}`}>
                                            {act.status.replace('_', ' ')}
                                        </span>
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">{act.title}</h3>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-slate-400" />
                                        <span>Needed: <strong className="text-slate-700">{act.required_count}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="truncate">{act.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Lightbulb size={16} className="text-slate-400" />
                                        <span>Skills: {act.skills_needed.join(', ')}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {act.status === 'CREATED' && (
                                        <button onClick={() => handleMatch(act.id)} className="btn-primary flex items-center gap-2 text-sm py-2">
                                            <Brain size={16} /> AI Auto-Match
                                        </button>
                                    )}

                                    {act.status === 'PROOF_SUBMITTED' && (
                                        <div className="flex items-center gap-3 w-full bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                            <ShieldAlert className="text-yellow-600 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-yellow-800">Verification Required</p>
                                                <p className="text-xs text-yellow-600 font-mono truncate max-w-[200px]">Hash: {act.proof_hash}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleVerify(act.id, true)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm">Approve</button>
                                                <button onClick={() => handleVerify(act.id, false)} className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50">Reject</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* MATCHING PANEL Overlay */}
                            {matchingActivity === act.id && (
                                <div className="w-full md:w-80 bg-brand-50 p-5 rounded-xl border border-brand-100 flex flex-col animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-brand-900 flex items-center gap-2 text-sm">
                                            <Brain size={16} /> AI Recommendations
                                        </h4>
                                        <button onClick={() => setMatchingActivity(null)} className="text-slate-400 hover:text-slate-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                                        {matches.map(({ volunteer, score, reason }) => (
                                            <div key={volunteer.id} className="bg-white p-3 rounded-lg shadow-sm border border-brand-100 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-bold text-slate-800 text-sm">{volunteer.name}</p>
                                                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded">{(score * 100).toFixed(0)}%</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2">{reason}</p>
                                                <button onClick={() => confirmAssignment(act.id, volunteer.id)} className="w-full py-1.5 bg-brand-600 text-white text-xs font-bold rounded hover:bg-brand-700 transition">
                                                    Assign Volunteer
                                                </button>
                                            </div>
                                        ))}
                                        {matches.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No matching volunteers found.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MODULE 8: AI ISSUE PLANNER ---
const AIPlanner = ({ onRequestCreate }) => {
    const [desc, setDesc] = useState('');
    const [plan, setPlan] = useState(null);

    const handlePlan = async () => {
        if (!desc) return;
        // Simulate loading state if needed
        const res = await api.planIssue(desc);
        setPlan(res);
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="card">
                <div className="mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                        <Lightbulb size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Community Issue Planner</h2>
                    <p className="text-slate-500">Describe a community issue (e.g., "garbage pile near school") and our AI will structure a complete response plan for your unit.</p>
                </div>
                
                <textarea
                    className="input-field h-40 mb-4 resize-none text-lg"
                    placeholder="Describe the issue here..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                />
                
                <button onClick={handlePlan} disabled={!desc} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg">
                    <Brain size={20} /> Analyze & Plan Strategy
                </button>
            </div>

            {plan ? (
                <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-500/10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    
                    <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle size={24} className="text-green-500" />
                        Suggested Operation Plan
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                        <PlanItem label="Activity Type" value={plan.type} />
                        <PlanItem label="Estimated Duration" value={`${plan.est_hours} Hours`} />
                        <PlanItem label="Team Size" value={`${plan.count} Volunteers`} />
                        <PlanItem label="Required Skills" value={plan.skills.join(', ')} />
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                        <p className="text-xs text-indigo-700 font-medium">* This plan is AI-generated based on historic issue data patterns.</p>
                    </div>

                    <button className="btn-secondary w-full" disabled>
                        Auto-Create Action (Demo)
                    </button>
                </div>
            ) : (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl p-12">
                    <Brain size={48} className="mb-4 opacity-50" />
                    <p className="text-center font-medium">AI Analysis Pending</p>
                </div>
            )}
        </div>
    );
};

const PlanItem = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-bold text-slate-800">{value}</span>
    </div>
);

export default POLayout;