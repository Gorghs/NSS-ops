import google.generativeai as genai
import sys

API_KEY = "AIzaSyDPjUUp_SsckH_AkffzzfeRmVk_WZb4wkQ"
genai.configure(api_key=API_KEY)

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"FOUND_MODEL: {m.name}")
            # Try to use it immediately
            try:
                model = genai.GenerativeModel(m.name)
                response = model.generate_content("test")
                print(f"VERIFIED_WORKING: {m.name}")
                sys.exit(0)
            except:
                print(f"FAILED_USING: {m.name}")
except Exception as e:
    print(f"ERROR: {e}")
