import os
import json
import re
from unidecode import unidecode

MODELS_DIR = "models"
OUTPUT_FILE = "json_models.json"
BASE_URL = "https://aha-website2025.github.io/AHA"

def slugify(text):
    text = unidecode(text).lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

def has_required_images(model_path):
    has_logo = False
    has_diagram = False

    for ext in ['jpg', 'jpeg', 'png']:
        if os.path.exists(os.path.join(model_path, f"logo.{ext}")):
            has_logo = True
        if os.path.exists(os.path.join(model_path, f"diagram.{ext}")):
            has_diagram = True

    return has_logo and has_diagram

def read_model_data(model_path, folder_name):
    info_path = os.path.join(model_path, "info.txt")

    if not os.path.exists(info_path) or not has_required_images(model_path):
        return None

    model_data = {}
    current_key = None
    buffer = []

    with open(info_path, 'r', encoding='utf-8') as f:
        for line in f:
            if ':' in line and not line.startswith(' ') and not line.strip().startswith('\t') and line.index(':') < 30:
                if current_key and buffer:
                    model_data[current_key] = ''.join(buffer).strip()
                    buffer = []

                key, value = line.strip().split(':', 1)
                key = key.strip()
                value = value.strip()

                if value:
                    model_data[key] = value
                    current_key = None
                else:
                    current_key = key
                    buffer = []
            elif current_key:
                buffer.append(line)

    if current_key and buffer:
        model_data[current_key] = ''.join(buffer).strip()

    if 'category' not in model_data:
        return None

    model_data["slug"] = slugify(model_data["category"])

    # Include logo and diagram image URLs
    for ext in ['jpg', 'jpeg', 'png']:
        logo_file = f"logo.{ext}"
        diagram_file = f"diagram.{ext}"
        if os.path.exists(os.path.join(model_path, logo_file)):
            model_data["logo_image"] = f"{BASE_URL}/{MODELS_DIR}/{folder_name}/{logo_file}"
        if os.path.exists(os.path.join(model_path, diagram_file)):
            model_data["diagram_image"] = f"{BASE_URL}/{MODELS_DIR}/{folder_name}/{diagram_file}"


    return model_data

def build_json():
    models = []

    for folder in os.listdir(MODELS_DIR):
        path = os.path.join(MODELS_DIR, folder)
        if os.path.isdir(path):
            data = read_model_data(path, folder)
            if data:
                models.append(data)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(models, f, indent=2, ensure_ascii=False)

    print(f"✅ Compiled {len(models)} models into {OUTPUT_FILE}")

if __name__ == "__main__":
    build_json()
