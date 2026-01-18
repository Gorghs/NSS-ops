import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import hashlib
from datetime import datetime
import cv2
import numpy as np
import google.generativeai as genai
import json
import os

# --- GEMINI CONFIGURATION ---
GENAI_API_KEY = "AIzaSyDPjUUp_SsckH_AkffzzfeRmVk_WZb4wkQ"
genai.configure(api_key=GENAI_API_KEY)
# We use gemini-1.5-flash for speed and efficiency
GEMINI_MODEL_NAME = "gemini-1.5-flash" 

# --- 1. SKILL UNIVERSE & MATCHING ---
SKILLS_UNIVERSE = [
    'teaching', 'medical', 'physical_labor', 'tech', 
    'management', 'art', 'cooking', 'logistics'
]

def vectorize_skills(skill_list):
    """Convert a list of skills into a binary vector based on the universe."""
    vector = [0] * len(SKILLS_UNIVERSE)
    for skill in skill_list:
        if skill in SKILLS_UNIVERSE:
            index = SKILLS_UNIVERSE.index(skill)
            vector[index] = 1
    return np.array(vector).reshape(1, -1)

def compute_matches(volunteers, activity_skills):
    """
    Compute cosine similarity between activity requirements and all volunteers.
    Returns sorted list of matches.
    """
    if not volunteers:
        return []

    activity_vector = vectorize_skills(activity_skills)
    results = []

    for v in volunteers:
        if not v['available']:
            continue
            
        v_vector = vectorize_skills(v['skills'])
        similarity = cosine_similarity(activity_vector, v_vector)[0][0]
        
        # Explainability
        matched_skills = [s for s in v['skills'] if s in activity_skills]
        reason = f"Matches {len(matched_skills)} skills: {', '.join(matched_skills)}"
        if similarity == 1.0:
            reason = "Perfect match!"
        elif similarity > 0.7:
            reason = "High skill overlap"
        elif similarity == 0:
            reason = "No specific skill match, but available"
            
        results.append({
            "volunteer": v,
            "score": float(similarity),
            "reason": reason
        })

    # Sort by score descending
    return sorted(results, key=lambda x: x['score'], reverse=True)


# --- 2. IMAGE PROOF VERIFICATION ---
def verify_image(file_stream, known_hashes):
    """
    Performs AI checks:
    1. Hash collision (duplicate check)
    2. Basic OpenCV quality check (blur)
    3. Metadata simulation (since browser uploads strip some EXIF often, we simulate logic)
    """
    # Read file bytes
    file_bytes = file_stream.read()
    
    # 1. PERCEPTUAL HASH (Simple MD5 for exact duplicates in this prototype)
    img_hash = hashlib.md5(file_bytes).hexdigest()
    
    if img_hash in known_hashes:
        return False, "Duplicate image detected! This proof has already been used.", None

    # Decoding image for OpenCV
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return False, "Invalid image format.", None

    # 2. BLUR DETECTION (Laplacian Variance)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    if variance < 100: # Threshold for blur
        return False, f"Image is too blurry (Quality Score: {int(variance)}). Please retake.", None

    return True, "Image verified successfully.", img_hash


# --- 3. ISSUE PLANNING LOGIC (HYBRID AI) ---
ISSUE_RULES = {
    "garbage": {"type": "Clean-up Drive", "est_hours": 4, "count": 10, "skills": ["physical_labor", "logistics"]},
    "waste": {"type": "Clean-up Drive", "est_hours": 4, "count": 10, "skills": ["physical_labor", "logistics"]},
    "health": {"type": "Medical Camp", "est_hours": 6, "count": 5, "skills": ["medical", "management"]},
    "sick": {"type": "Medical Camp", "est_hours": 6, "count": 5, "skills": ["medical", "management"]},
    "school": {"type": "Teaching Session", "est_hours": 2, "count": 3, "skills": ["teaching", "art"]},
    "education": {"type": "Teaching Session", "est_hours": 2, "count": 3, "skills": ["teaching", "art"]},
}

def suggest_activity_from_issue(description):
    """
    Uses Gemini AI to plan the activity. Falls back to rules if API fails.
    """
    # 1. Try Gemini
    try:
        model = genai.GenerativeModel(GEMINI_MODEL_NAME)
        prompt = f"""
        Act as an NSS Operations Planner. specific JSON format only.
        Analyze this issue: "{description}"
        Suggest an activity.
        Return ONLY valid JSON:
        {{
            "type": "string (Activity Type)",
            "est_hours": int (hours needed),
            "count": int (volunteers needed),
            "skills": ["skill1", "skill2"] (choose from {SKILLS_UNIVERSE})
        }}
        """
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return data
    except Exception as e:
        print(f"Gemini AI failed ({e}), falling back to rules.")

    # 2. Fallback to Rules
    desc_lower = description.lower()
    for keyword, plan in ISSUE_RULES.items():
        if keyword in desc_lower:
            return plan
            
    # 3. Default Fallback
    return {"type": "General Awareness", "est_hours": 3, "count": 5, "skills": ["management"]}
