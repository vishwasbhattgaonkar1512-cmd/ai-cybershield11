import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY missing in .env")

def get_ai_tips(password_score: int, is_email_leaked: bool, phishing_risk: bool) -> str:
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # OpenRouter recommends these headers for analytics/ranking:
        # "HTTP-Referer": "https://your-website-url.com", 
        # "X-Title": "My Security App"
    }

    # Better system prompt: Enforces formatting directly via AI instead of code replacements
    system_prompt = (
        "You are a top-tier cybersecurity expert. "
        "Analyze the user's specific security vulnerabilities and provide exactly 3 actionable, practical tips. "
        "Rule 1: Format the output as a list using exactly 3 bullet points. "
        "Rule 2: You MUST use the '•' character for bullets. Do NOT use hyphens or numbers. "
        "Rule 3: Keep it concise. No introductory or concluding text."
    )

    severity = "HIGH" if is_email_leaked or phishing_risk or password_score <= 1 else "LOW"

    # Contextualize the variables so the AI gives highly specific advice
    user_prompt = (
        f"User Security Profile:\n"
        f"- Password Strength: {password_score}/4 (0=Very Weak, 4=Strong)\n"
        f"- Email Found in Data Breaches: {'Yes' if is_email_leaked else 'No'}\n"
        f"- High Phishing Risk Detected: {'Yes' if phishing_risk else 'No'}\n"
        f"- Overall Risk Severity: {severity}\n\n"
        f"Give me 3 security tips tailored to these exact metrics."
    )

    payload = {
        "model": "openai/gpt-4o-mini", # Upgraded to a better, cheaper, and faster model
        "messages":[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3, # Low temp keeps the AI focused and factual
        "max_tokens": 150
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        data = response.json()

        # ❌ HANDLE API HTTP ERRORS FIRST
        if response.status_code != 200:
            error_msg = data.get("error", {}).get("message", "Unknown API Error")
            return f"AI API Error ({response.status_code}): {error_msg}"

        # ✅ SAFE PARSING
        if data.get("choices") and data["choices"]:
            content = data["choices"][0].get("message", {}).get("content", "").strip()
            
            if content:
                return content

        return "AI returned an empty response."

    except requests.exceptions.Timeout:
        return "AI Error: The request timed out. Please try again later."
    except requests.exceptions.RequestException as e:
        return f"AI Error: Network request failed - {str(e)}"
    except Exception as e:
        return f"AI Error: Unexpected issue occurred - {str(e)}"