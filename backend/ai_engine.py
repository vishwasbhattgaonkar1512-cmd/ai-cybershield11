import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()
hf_token = os.getenv("HUGGINGFACE_TOKEN")

client = InferenceClient("Qwen/Qwen2.5-7B-Instruct", token=hf_token)

def get_ai_tips(password_score, is_email_leaked, phishing_risk):
    system_prompt = """You are an elite Cybersecurity Expert AI. 
Read the scan results and output 3 highly actionable, urgent tips to secure the user.
Use bullet points. Be specific, professional, and do not hallucinate."""

    user_context = f"""
    Security Scan Results:
    - Password Strength: {password_score}/4 (0=Terrible, 4=Uncrackable)
    - Email Breach Status: {"Leaked in a data breach!" if is_email_leaked else "Safe. No known breaches."}
    - Phishing/URL Risk: {"High Risk - Malicious URL!" if phishing_risk else "URL appears safe."}
    
    Give me an emergency security action plan.
    """

    messages =[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_context}
    ]

    try:
        response = client.chat_completion(
            messages=messages,
            max_tokens=250,
            temperature=0.2 
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"AI System Offline. Error: {e}"
