
import os
import markdown
from htmldocx import HtmlToDocx

from docx import Document

def convert_md_to_docx(md_files):
    parser = HtmlToDocx()
    
    for md_file in md_files:
        if not os.path.exists(md_file):
            print(f"File not found: {md_file}")
            continue
            
        print(f"Converting {md_file}...")
        
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
            
        html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code', 'nl2br'])
        
        docx_file = os.path.splitext(md_file)[0] + '.docx'
        
        try:
            doc = Document()
            parser.add_html_to_document(html_content, doc)
            doc.save(docx_file)
            print(f"Successfully created: {docx_file}")
        except Exception as e:
            print(f"Error converting {md_file}: {e}")

if __name__ == "__main__":
    files_to_convert = [
        "MODELO_DE_DATOS_SISMEPA.md",
        "REQUISITOS_TECNICOS_SISMEPA.md",
        "DOCUMENTACION_SISMEPA.md",
        "MANUAL_DE_USUARIO_SISMEPA.md"
    ]
    
    base_dir = os.getcwd()
    abs_files = [os.path.join(base_dir, f) for f in files_to_convert]
    
    convert_md_to_docx(abs_files)
