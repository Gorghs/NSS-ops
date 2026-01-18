import google.generativeai as genai
import sys

API_KEY = "AIzaSyDPjUUp_SsckH_AkffzzfeRmVk_WZb4wkQ"
genai.configure(api_key=API_KEY)

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("test")
    if response.text:
        print("VERIFIED_SUCCESS")
except Exception as e:
    print(f"VERIFIED_FAILURE: {e}")
