import json

with open("s:/knowTrace/mit_lectures_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

content = f'"""MIT 6.042J Mathematics for Computer Science complete 25-lecture syllabus & transcripts."""\n\nMIT_OCW_LECTURES = {json.dumps(data, indent=4)}\n'

with open("s:/knowTrace/backend/services/mit_ocw_lectures.py", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated backend/services/mit_ocw_lectures.py with {len(data)} lectures.")
