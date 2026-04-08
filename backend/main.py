from fastapi import FastAPI
from pydantic import BaseModel
from zxcvbn import zxcvbn
from ai_engine import get_ai_tips
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import hashlib
import requests

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
GOOGLE_SAFE_API_KEY = os.getenv("GOOGLE_SAFE_API_KEY")

app = FastAPI(title="Cyber AI Defense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ─────────────────────────

class PasswordRequest(BaseModel):
    password: str

class EmailRequest(BaseModel):
    email: str

class URLRequest(BaseModel):
    url: str

class FullAnalysisRequest(BaseModel):
    password: str
    email: str
    url: str

# ── PASSWORD LEAK CHECK (HIBP) ─────────────────────────

def check_password_pwned(password: str) -> bool:
    sha1_password = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix = sha1_password[:5]
    suffix = sha1_password[5:]

    url = f"https://api.pwnedpasswords.com/range/{prefix}"

    try:
        response = requests.get(url, timeout=5)
        hashes = response.text.splitlines()

        for h in hashes:
            hash_suffix, count = h.split(":")
            if hash_suffix == suffix:
                return True

        return False

    except Exception:
        return False

# ── EMAIL BREACH CHECK (RapidAPI) ─────────────────────────

def check_email_leak(email: str) -> bool:
    url = "https://breachdirectory.p.rapidapi.com/"

    querystring = {"func": "auto", "term": email}

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "breachdirectory.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=5)
        data = response.json()

        return bool(data.get("result"))

    except Exception:
        return False

# ── GOOGLE SAFE BROWSING ─────────────────────────

def detect_phishing(url: str) -> bool:
    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_API_KEY}"

    payload = {
        "client": {
            "clientId": "cyber-ai",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }

    try:
        response = requests.post(api_url, json=payload, timeout=5)
        data = response.json()

        return "matches" in data

    except Exception:
        return False

# ── ROUTES ─────────────────────────

@app.get("/")
async def root():
    return {"message": "Cyber AI Defense API Running 🚀"}

# PASSWORD CHECK

@app.post("/check/password")
async def check_password(data: PasswordRequest):
    result = zxcvbn(data.password)
    is_pwned = check_password_pwned(data.password)

    return {
        "score": result["score"],
        "strength": result["feedback"],
        "is_leaked": is_pwned
    }

# EMAIL CHECK

@app.post("/check/email")
async def check_email(data: EmailRequest):
    is_leaked = check_email_leak(data.email)

    return {
        "email": data.email,
        "is_leaked": is_leaked
    }

# URL CHECK

@app.post("/check/url")
async def check_url(data: URLRequest):
    is_phishing = detect_phishing(data.url)

    return {
        "url": data.url,
        "is_phishing": is_phishing
    }

# FULL ANALYSIS

@app.post("/analyze")
async def analyze(data: FullAnalysisRequest):
    password_result = zxcvbn(data.password)
    password_score = password_result["score"]

    is_password_pwned = check_password_pwned(data.password)
    is_email_leaked = check_email_leak(data.email)
    is_phishing = detect_phishing(data.url)

    ai_advice = get_ai_tips(password_score, is_email_leaked, is_phishing)

    return {
        "password_score": password_score,
        "password_leaked": is_password_pwned,
        "email_leaked": is_email_leaked,
        "phishing_detected": is_phishing,
        "ai_advice": ai_advice
    }