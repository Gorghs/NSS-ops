const API_URL = "http://localhost:5000/api";

export const api = {
    reset: () => fetch(`${API_URL}/reset`, { method: "POST" }).then(r => r.json()),

    getStatus: () => fetch(`${API_URL}/status`).then(r => r.json()),

    // Volunteers
    createVolunteer: (data) => fetch(`${API_URL}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getVolunteers: () => fetch(`${API_URL}/volunteers`).then(r => r.json()),

    // Activities
    createActivity: (data) => fetch(`${API_URL}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getActivities: () => fetch(`${API_URL}/activities`).then(r => r.json()),

    assignVolunteers: (activityId, volunteerIds) => fetch(`${API_URL}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: activityId, volunteer_ids: volunteerIds })
    }).then(r => r.json()),

    verifyActivity: (activityId, approve) => fetch(`${API_URL}/verify-activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: activityId, approve })
    }).then(r => r.json()),

    // AI
    getMatches: (activityId) => fetch(`${API_URL}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: activityId })
    }).then(r => r.json()),

    planIssue: (description) => fetch(`${API_URL}/plan-issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
    }).then(r => r.json()),

    uploadProof: (activityId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("activity_id", activityId);
        return fetch(`${API_URL}/upload-proof`, {
            method: "POST",
            body: formData
        }).then(r => r.json());
    },

    // System
    toggleDisasterMode: (active) => fetch(`${API_URL}/disaster-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active })
    }).then(r => r.json()),

    getStats: () => fetch(`${API_URL}/stats`).then(r => r.json()),
};
