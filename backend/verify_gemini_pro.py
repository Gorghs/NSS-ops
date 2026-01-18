import google.generativeai as genai
import sys

API_KEY = "AIzaSyDPjUUp_SsckH_AkffzzfeRmVk_WZb4wkQ"
genai.configure(api_key=API_KEY)

try:
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content("test")
    print("VERIFIED_SUCCESS_GEMINI_PRO")
except Exception as e:
    print(f"VERIFIED_FAILURE_GEMINI_PRO: {e}")
