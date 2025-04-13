import os
import json
import re

PROJECTS_DIR = "projects"
OUTPUT_FILE = "projects.json"
BASE_URL = "https://junothecat.github.io/housing-catalogue"


def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)  # remove punctuation
    text = re.sub(r'[\s-]+', '-', text)       # replace spaces/hyphens with single hyphen
    return text.strip('-')

def read_project_data(project_path, folder_name):
    info_path = os.path.join(project_path, "info.txt")
    image_path = os.path.join(project_path, "image.jpg")

    if not os.path.exists(info_path) or not os.path.exists(image_path):
        return None

    project_data = {}

    with open(info_path, 'r', encoding='utf-8') as f:
        for line in f:
            if ':' in line:
                key, value = line.strip().split(':', 1)
                project_data[key.strip()] = value.strip()

    if 'title' not in project_data or 'location' not in project_data:
        return None

    # Add image URL separately
    project_data["image"] = f"{BASE_URL}/{PROJECTS_DIR}/{folder_name}/image.jpg"

    # Add slug
    project_data["slug"] = slugify(project_data["title"])

    return project_data

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
