from flask import Flask, request, jsonify
from flask_cors import CORS
import ai_engine
import datetime

app = Flask(__name__)
CORS(app)

# --- IN-MEMORY DATABASE (Resets on restart) ---
class InMemoryDB:
    def __init__(self):
        self.reset()
        self.seed()
    
    def reset(self):
        self.volunteers = []  # List of dicts
        self.activities = []  # List of dicts
        self.proof_hashes = set()
        self.service_hours = {} # {volunteer_id: total_hours}
        self.complaints = []
        self.disaster_mode = False
        self.v_id_counter = 1
        self.a_id_counter = 1

    def seed(self):
        # Mock Volunteers
        self.volunteers = [
            {"id": 1, "name": "Arjun Kumar", "skills": ["medical", "management"], "location": "North Campus", "available": True, "joined_at": datetime.datetime.now().isoformat()},
            {"id": 2, "name": "Sneha Reddy", "skills": ["teaching", "art"], "location": "South Campus", "available": True, "joined_at": datetime.datetime.now().isoformat()},
            {"id": 3, "name": "Raj Mulligan", "skills": ["physical_labor", "logistics"], "location": "Main Block", "available": True, "joined_at": datetime.datetime.now().isoformat()}
        ]
        self.v_id_counter = 4
        for v in self.volunteers:
            self.service_hours[v['id']] = 0

        # Mock Activities
        self.activities = [
            {
                "id": 1, "title": "Health Camp Pre-Check", "type": "medical", 
                "skills_needed": ["medical"], "location": "City Centre", 
                "required_count": 2, "estimated_hours": 5, "status": "CREATED", 
                "assigned_volunteers": [], "urgency": 1
            },
            {
                "id": 2, "title": "Campus Cleanup", "type": "clean-up", 
                "skills_needed": ["physical_labor"], "location": "Hostel Area", 
                "required_count": 10, "estimated_hours": 3, "status": "CREATED", 
                "assigned_volunteers": [], "urgency": 1
            }
        ]
        self.a_id_counter = 3

db = InMemoryDB()

# --- ROUTES ---

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "active", "disaster_mode": db.disaster_mode})

@app.route('/api/reset', methods=['POST'])
def reset_system():
    db.reset()
    return jsonify({"message": "System fully reset"})

# --- MODULE 2: VOLUNTEERS ---
@app.route('/api/volunteers', methods=['GET', 'POST'])
def manage_volunteers():
    if request.method == 'POST':
        data = request.json
        new_vol = {
            "id": db.v_id_counter,
            "name": data.get("name"),
            "skills": data.get("skills", []),
            "location": data.get("location"),
            "available": data.get("available", True),
            "joined_at": datetime.datetime.now().isoformat()
        }
        db.v_id_counter += 1
        db.volunteers.append(new_vol)
        db.service_hours[new_vol["id"]] = 0
        return jsonify(new_vol)
    
    return jsonify(db.volunteers)

# --- MODULE 3 & 5: ACTIVITIES ---
@app.route('/api/activities', methods=['GET', 'POST'])
def manage_activities():
    if request.method == 'POST':
        data = request.json
        new_act = {
            "id": db.a_id_counter,
            "title": data.get("title"),
            "type": data.get("type"),
            "skills_needed": data.get("skills_needed", []),
            "location": data.get("location"),
            "required_count": int(data.get("required_count", 0)),
            "estimated_hours": int(data.get("estimated_hours", 0)),
            "status": "CREATED", # CREATED, ASSIGNED, COMPLETED, VERIFIED
            "assigned_volunteers": [],
            "urgency": 10 if db.disaster_mode else 1
        }
        db.a_id_counter += 1
        db.activities.append(new_act)
        
        # Disaster mode auto-sort
        if db.disaster_mode:
            db.activities.sort(key=lambda x: x['urgency'], reverse=True)
            
        return jsonify(new_act)
    
    return jsonify(db.activities)

# --- MODULE 4: MATCHING ---
@app.route('/api/match', methods=['POST'])
def match_volunteers():
    data = request.json
    activity_id = data.get("activity_id")
    
    # Find activity
    activity = next((a for a in db.activities if a["id"] == activity_id), None)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404
        
    matches = ai_engine.compute_matches(db.volunteers, activity["skills_needed"])
    return jsonify(matches)

@app.route('/api/assign', methods=['POST'])
def assign_volunteers():
    data = request.json
    activity_id = data.get("activity_id")
    volunteer_ids = data.get("volunteer_ids", [])
    
    activity = next((a for a in db.activities if a["id"] == activity_id), None)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404
        
    activity["assigned_volunteers"] = volunteer_ids
    activity["status"] = "ASSIGNED"
    
    # Mark volunteers as busy? (Optional, skipping for simpler flow)
    return jsonify({"message": "Volunteers assigned", "activity": activity})

# --- MODULE 6: PROOF ---
@app.route('/api/upload-proof', methods=['POST'])
def upload_proof():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    activity_id = int(request.form.get("activity_id"))
    
    success, message, img_hash = ai_engine.verify_image(file.stream, db.proof_hashes)
    
    if success:
        db.proof_hashes.add(img_hash)
        # Update activity status
        activity = next((a for a in db.activities if a["id"] == activity_id), None)
        if activity:
            activity["status"] = "PROOF_SUBMITTED"
            activity["proof_hash"] = img_hash
            
    return jsonify({"success": success, "message": message})

@app.route('/api/verify-activity', methods=['POST'])
def verify_activity():
    data = request.json
    activity_id = data.get("activity_id")
    approve = data.get("approve") # bool
    
    activity = next((a for a in db.activities if a["id"] == activity_id), None)
    if not activity:
        return jsonify({"error": "Not found"}), 404
        
    if approve:
        activity["status"] = "VERIFIED"
        # Grant hours
        hours = activity["estimated_hours"]
        for vid in activity["assigned_volunteers"]:
            if vid in db.service_hours:
                db.service_hours[vid] += hours
    else:
        activity["status"] = "ASSIGNED" # Revert to assigned so they can try again?
        
    return jsonify({"success": True, "activity": activity})

# --- MODULE 8: ISSUE PLANNING ---
@app.route('/api/plan-issue', methods=['POST'])
def plan_issue():
    data = request.json
    description = data.get("description")
    suggestion = ai_engine.suggest_activity_from_issue(description)
    return jsonify(suggestion)

# --- MODULE 9: DISASTER MODE ---
@app.route('/api/disaster-mode', methods=['POST'])
def toggle_disaster():
    data = request.json
    db.disaster_mode = data.get("active", False)
    return jsonify({"disaster_mode": db.disaster_mode})

# --- MODULE 10: ANALYTICS ---
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_hours = sum(db.service_hours.values())
    return jsonify({
        "volunteers_count": len(db.volunteers),
        "activities_created": len(db.activities),
        "activities_verified": len([a for a in db.activities if a["status"] == "VERIFIED"]),
        "total_hours": total_hours,
        "proofs_rejected": 0 # Not tracking count for now, staying simple
    })

# --- MODULE 11: COMPLAINTS ---
@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    data = request.json
    db.complaints.append(data.get("text"))
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
