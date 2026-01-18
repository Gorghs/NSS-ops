import google.generativeai as genai
import os

API_KEY = "AIzaSyDPjUUp_SsckH_AkffzzfeRmVk_WZb4wkQ"
genai.configure(api_key=API_KEY)

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")

print("\nTesting Generation...")
models = ["models/gemini-1.5-flash", "models/gemini-1.5-pro", "models/gemini-pro"]
for m in models:
    try:
        print(f"Trying {m}...")
        model = genai.GenerativeModel(m)
        response = model.generate_content("Hi")
        print(f"SUCCESS with {m}")
        break
    except Exception as e:
        print(f"Failed {m}: {e}")
