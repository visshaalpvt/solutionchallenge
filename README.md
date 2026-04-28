# SmartAlloc 🚀
### AI-Powered Humanitarian Logistics & Volunteer Coordination
**Google Solution Challenge 2024-25 Submission**

SmartAlloc is a real-time, AI-driven platform designed to bridge the gap between community needs and humanitarian action. By leveraging advanced Large Language Models (LLMs) and real-time geospatial data, SmartAlloc ensures that the right resources reach the right people at the right time.

---

## 📺 Project Demo
[![SmartAlloc Demo Video](https://img.shields.io/badge/YouTube-Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1sjZkY_6VERT6ycKs39ngxyj9bFiFDvbU/view?usp=sharing)
> **Note:** Click the badge above to view the 3-minute project walkthrough on Google Drive.

---

## 🔗 Live Links
*   **Working Prototype (MVP):** [https://googlesolutionchallenge-git-main-visshaalpvt.vercel.app/](https://googlesolutionchallenge-git-main-visshaalpvt.vercel.app/)  *(Replace with your final Vercel URL)*
*   **GitHub Repository:** [https://github.com/visshaalpvt/solutionchallenge](https://github.com/visshaalpvt/solutionchallenge)

---

## ✨ Key Features
*   **🤖 AI Priority Engine**: Automatically scores community needs based on urgency using Gemini 1.5 Pro and LLaMA 3.
*   **🛡️ Enterprise-Grade Security**: End-to-end AI API shielding via backend proxies and strict Role-Based Access Control (RBAC).
*   **🗺️ Geospatial Coordination**: Real-time map views for tracking humanitarian missions across different zones.
*   **📜 Merit-Based Rewards**: Automated, printable certificates for volunteers upon task completion, signed by the Project Director.
*   **⚡ Real-Time Sync**: Powered by Google Firebase for instant updates across all volunteer and admin dashboards.

---

## 🛠️ Tech Stack
*   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion (Animations).
*   **Backend**: Firebase Firestore, Firebase Auth, Vercel Serverless Functions.
*   **AI**: Google Gemini AI, Groq (LLaMA 3).
*   **Maps**: Leaflet / OpenStreetMap.

---

## 🔐 Security Architecture
SmartAlloc prioritizes data integrity and security:
1.  **Backend Proxying**: All AI API calls are routed through secure Vercel edge functions to prevent client-side API key leakage.
2.  **Strict Firestore Rules**: Role-based permissions prevent unauthorized data access (Volunteers can only see assigned tasks; Admins manage global state).
3.  **Rate Limiting**: Application-level throttling prevents spam and automated system abuse.

---

## 🚀 Installation & Setup
1.  Clone the repository:
    ```bash
    git clone https://github.com/visshaalpvt/solutionchallenge.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your `.env` variables (Firebase, Gemini, Groq).
4.  Run locally:
    ```bash
    npm run dev
    ```

---

**Developed with ❤️ for the Google Solution Challenge.**
