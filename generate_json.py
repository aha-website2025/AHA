import os
import json

PROJECTS_DIR = "projects"
OUTPUT_FILE = "projects.json"
BASE_URL = "https://junothecat.github.io/housing-catalogue"

def read_project_data(project_path, folder_name):
    info_path = os.path.join(project_path, "info.txt")
    image_path = os.path.join(project_path, "image.jpg")

    if not os.path.exists(info_path) or not os.path.exists(image_path):
        return None

    with open(info_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]

    if len(lines) < 2:
        return None

    title = lines[0]
    location = lines[1]

    return {
        "title": title,
        "location": location,
        "image":f"{BASE_URL}/{PROJECTS_DIR}/{folder_name}/image.jpg"


    }

def build_json():
    projects = []

    for folder in os.listdir(PROJECTS_DIR):
        path = os.path.join(PROJECTS_DIR, folder)
        if os.path.isdir(path):
            data = read_project_data(path, folder)
            if data:
                projects.append(data)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(projects, f, indent=2, ensure_ascii=False)

    print(f"✅ Compiled {len(projects)} projects into {OUTPUT_FILE}")

if __name__ == "__main__":
    build_json()
