import os
from docx import Document

base_dir = r"C:\PROYECTOS\les\docs\z_docs_consultoria\docs_les_modulo_caja"
output_dir = r"C:\PROYECTOS\les\docs\extracted_text_caja"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

files = [f for f in os.listdir(base_dir) if f.endswith(".docx")]

for file in files:
    file_path = os.path.join(base_dir, file)
    print(f"Extracting {file}...")
    try:
        doc = Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        
        txt_name = file.replace(".docx", ".txt")
        txt_path = os.path.join(output_dir, txt_name)
        
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write("\n".join(full_text))
        
        print(f"Saved to {txt_name}")
    except Exception as e:
        print(f"Error reading {file}: {e}")
