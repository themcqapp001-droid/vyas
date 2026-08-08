import csv
import json
import os

csv_path = os.path.join("public", "gate_metadata.csv")
out_dir = os.path.join("public", "gate_data")

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

# Initialize subject chunks
subject_data = {str(i): [] for i in range(1, 11)}

with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    next(reader) # skip header
    for row in reader:
        if len(row) < 3 or not row[0].strip():
            continue
            
        q_id = row[0].strip()
        ans = row[1].strip()
        tags_raw = row[2:]
        
        # Parse tags
        all_tags = []
        for tag_col in tags_raw:
            all_tags.extend([t.strip().lower() for t in tag_col.replace(",", " ").split() if t.strip()])
            
        diff = "normal"
        if "easy" in all_tags: diff = "easy"
        if "hard" in all_tags: diff = "hard"
        
        is_numerical = any("numerical" in t for t in all_tags)
        
        # Get subject ID from q_id (e.g. "1.1.2" -> "1")
        subj_id = q_id.split(".")[0]
        
        q_obj = {
            "id": q_id,
            "ans": ans,
            "tags": all_tags,
            "difficulty": diff,
            "isNumerical": is_numerical
        }
        
        if subj_id in subject_data:
            subject_data[subj_id].append(q_obj)

# Write chunks
for subj_id, data in subject_data.items():
    out_file = os.path.join(out_dir, f"{subj_id}.json")
    with open(out_file, "w", encoding="utf-8") as out_f:
        json.dump(data, out_f)
        
print("Data successfully chunked into public/gate_data/")
