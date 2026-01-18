import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../api';
import { MapPin, CheckCircle, Upload, AlertCircle, Clock, Award, Briefcase, User, Calendar } from 'lucide-react';

export const VolunteerLayout = () => {
    const { volunteerData } = useGlobal();

    // Simple improved routing
    if (!volunteerData) return <ProfileForm />;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 pt-6">
                <VolunteerDashboard />
            </div>
        </div>
    );
};

const Navbar = () => {
    const { volunteerData } = useGlobal();
    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                    <User size={18} />
                </div>
                <span>NSS Volunteer</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-slate-500">
                    {volunteerData?.name}
                </div>
                <button onClick={() => window.location.reload()} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors">
                    Logout
                </button>
            </div>
        </nav>
    );
}

const SKILL_OPTIONS = ['teaching', 'medical', 'physical_labor', 'tech', 'management', 'art', 'cooking', 'logistics'];

const ProfileForm = () => {
    const { setVolunteerData } = useGlobal();
    const [form, setForm] = useState({ name: '', location: '', skills: [] });

    const toggleSkill = (skill) => {
        setForm(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await api.createVolunteer(form);
        setVolunteerData(res);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="card max-w-md w-full border-none shadow-xl shadow-brand-900/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Join the Mission</h1>
                    <p className="text-slate-500 mt-2">Create your volunteer profile to get matched with impactful activities.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="label-text">Full Name</label>
                        <input required className="input-field" placeholder="John Doe"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="label-text">Location</label>
                        <input required className="input-field" placeholder="City or Campus"
                            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div>
                        <label className="label-text mb-3 block">Your Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {SKILL_OPTIONS.map(skill => (
                                <button type="button" key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                                    ${form.skills.includes(skill)
                                            ? 'bg-brand-50 border-brand-200 text-brand-700 ring-2 ring-brand-500/20'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                >
                                    {skill.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 text-lg shadow-xl shadow-brand-500/20 mt-4">
                        Start Volunteering
                    </button>
                </form>
            </div>
        </div>
    );
};

const VolunteerDashboard = () => {
    const { volunteerData, activities, refreshData } = useGlobal();

    // Filter activities assigned to me
    const myActivities = activities.filter(a => a.assigned_volunteers.includes(volunteerData.id));

    // Quick Stats
    const totalHours = myActivities.reduce((acc, curr) => acc + (curr.status === 'VERIFIED' ? curr.estimated_hours : 0), 0);
    const completedTasks = myActivities.filter(a => a.status === 'VERIFIED').length;

    return (
        <div className="space-y-8 animate-slide-up">

            {/* Stats Header */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 text-white shadow-lg shadow-brand-500/20">
                    <p className="text-brand-100 text-sm font-medium mb-1">Total Impact</p>
                    <p className="text-3xl font-bold flex items-end gap-1">
                        {totalHours} <span className="text-base font-normal opacity-80 mb-1">hrs</span>
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Missions</p>
                    <p className="text-3xl font-bold text-slate-800 flex items-end gap-1">
                        {completedTasks} <span className="text-base font-normal text-slate-400 mb-1">completed</span>
                    </p>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-slate-400" />
                    My Assignments
                </h2>

                {myActivities.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No active assignments</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">You're all caught up! Wait for your Programme Officer to assign new tasks.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myActivities.map(activity => (
                            <ActivityCard key={activity.id} activity={activity} onSuccess={refreshData} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ActivityCard = ({ activity, onSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            const res = await api.uploadProof(activity.id, file);
            if (!res.success) {
                setError(res.message);
            } else {
                onSuccess();
            }
        } finally {
            setUploading(false);
        }
    };

    const statusConfig = {
        'ASSIGNED': { color: 'bg-blue-50 text-blue-700', label: 'In Progress', icon: Clock },
        'PROOF_SUBMITTED': { color: 'bg-yellow-50 text-yellow-700', label: 'Pending Approval', icon: Clock },
        'VERIFIED': { color: 'bg-emerald-50 text-emerald-700', label: 'Completed', icon: CheckCircle },
    };

    const status = statusConfig[activity.status] || { color: 'bg-slate-100', label: activity.status, icon: Clock };
    const StatusIcon = status.icon;

    return (
        <div className="card border-none ring-1 ring-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                    <StatusIcon size={12} /> {status.label}
                </span>
                <span className="text-xs font-medium text-slate-400">
                    {activity.estimated_hours}h credit
                </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">{activity.title}</h3>

            <div className="flex flex-col gap-2 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    {activity.location}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
                {activity.status === 'ASSIGNED' && (
                    <div>
                        <label className={`
                            btn-primary w-full cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden
                            ${uploading ? 'opacity-70 pointer-events-none' : ''}
                        `}>
                            {uploading ? (
                                <>Verifying Geo-Tags...</>
                            ) : (
                                <><Upload size={18} /> Upload Proof Photo</>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                        </label>
                        {error && (
                            <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 animate-fade-in">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}
                    </div>
                )}

                {activity.status === 'PROOF_SUBMITTED' && (
                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500 text-sm font-medium">Proof submitted successfully.</p>
                        <p className="text-xs text-slate-400 mt-1">Waiting for PO verification.</p>
                    </div>
                )}

                {activity.status === 'VERIFIED' && (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 py-3 rounded-xl">
                        <Award size={20} /> Service Hours Credited
                    </div>
                )}
            </div>
        </div>
    );
};