from fastapi import FastAPI
from pydantic import BaseModel
from zxcvbn import zxcvbn
from ai_engine import get_ai_tips

app = FastAPI(title="Cyber AI Defense API")

@app.get("/")
async def root():
    return {"message": "Welcome to the Cyber AI API. Go to /docs to test the AI."}

class SecurityRequest(BaseModel):
    password: str
    email: str
    url: str

def check_email_leak(email: str) -> bool:
    if "leaked" in email.lower() or "test" in email.lower():
        return True
    return False

def detect_phishing(url: str) -> bool:
    suspicious_keywords =['free-money', 'login-update', 'secure-verify', 'bit.ly']
    if any(keyword in url.lower() for keyword in suspicious_keywords):
        return True
    return False

@app.post("/analyze")
async def analyze_security(data: SecurityRequest):
    password_results = zxcvbn(data.password)
    password_score = password_results['score']
    
    is_leaked = check_email_leak(data.email)
    is_phishing = detect_phishing(data.url)
    
    ai_advice = get_ai_tips(password_score, is_leaked, is_phishing)
    
    return {
        "status": "success",
        "metrics": {
            "password_score": password_score,
            "crack_time_estimate": password_results['crack_times_display']['offline_fast_hashing_1e10_per_second'],
            "is_email_leaked": is_leaked,
            "is_phishing_link": is_phishing
        },
        "ai_action_plan": ai_advice
    }