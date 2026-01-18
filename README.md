# NSS AI Operations Support System 


## 🚀 How to Run

1.  **Start Backend**
    ```bash
    cd backend
    python app.py
    ```
    *Runs on http://localhost:5000*

2.  **Start Frontend** (in a new terminal)
    ```bash
    cd frontend
    npm run dev
    ```
    *Runs on http://localhost:5173 (usually)*

3.  **Open Browser**
    Go to the URL shown by the frontend terminal (e.g., `http://localhost:5173`).

---

## 🧪 Demo Walkthrough

### 1. Role Selection
- Choose **Programme Officer (PO)** to manage activities.
- Choose **Volunteer** to join activities.
- *Tip: Open two browser windows (Incognito) to simulate both roles simultaneously.*

### 2. AI Matching (PO Mode)
1. Go to **Assignments** tab.
2. Find "Health Camp Pre-Check".
3. Click **AI Auto-Match**.
4. See ranked list of volunteers based on cosine similarity of skills.
5. Click **Assign**.

### 3. Proof Verification (Volunteer Mode)
1. Switch to **Volunteer** (create a profile if needed).
2. See the assigned activity in Dashboard.
3. Click **Upload Proof** (Upload any image).
4. AI calculates Hash & checks Blur.

### 4. AI Verification (PO Mode)
1. Switch back to **PO**.
2. See "Verification Required" on the activity.
3. Review the Hash/Status.
4. Click **Approve**.
5. Service hours are automatically credited to the volunteer.

### 5. AI Issue Planning (PO Mode)
1. Go to **AI Planning** tab.
2. Type an issue: *"There is a lot of plastic waste near the school playground"*
3. Click **Plan**.
4. AI Suggests: "Clean-up Drive" with specific skills and hours.

## ⚠️ Notes
- **Disaster Mode**: Toggling this sorts activities by urgency dynamically.
