#!/usr/bin/env python3
"""
PDF Text Extractor
Extracts text from PDF files and converts to markdown format
"""

import os
import sys
import subprocess
import re
from pathlib import Path

def extract_text_with_pdftotext(pdf_path, output_path):
    """Extract text using pdftotext if available"""
    try:
        subprocess.run(['pdftotext', '-layout', pdf_path, output_path], check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def extract_text_with_python(pdf_path):
    """Extract text using python packages"""
    text = ""
    
    # Try pdfplumber first (most reliable)
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text if text.strip() else None
    except ImportError:
        pass
    except Exception as e:
        print(f"Error with pdfplumber: {e}")
    
    # Try pypdf as fallback
    try:
        import pypdf
        with open(pdf_path, 'rb') as file:
            pdf = pypdf.PdfReader(file)
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text if text.strip() else None
    except ImportError:
        pass
    except Exception as e:
        print(f"Error with pypdf: {e}")
    
    # Try PyPDF2 as last resort
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as file:
            pdf = PyPDF2.PdfReader(file)
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text if text.strip() else None
    except ImportError:
        pass
    except Exception as e:
        print(f"Error with PyPDF2: {e}")
    
    return None

def clean_text_to_markdown(text, title):
    """Convert extracted text to clean markdown format"""
    if not text:
        return f"# {title}\n\n*Unable to extract text from PDF*\n"
    
    # Basic cleaning
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Skip page numbers and common headers/footers
        if re.match(r'^\d+$', line) or len(line) < 3:
            continue
            
        # Convert potential headers (all caps or title case)
        if line.isupper() and len(line) > 5:
            cleaned_lines.append(f"## {line.title()}")
        elif line.count(' ') < 3 and len(line) > 10:  # Potential header
            cleaned_lines.append(f"### {line}")
        else:
            cleaned_lines.append(line)
    
    # Join with proper spacing
    markdown = f"# {title}\n\n"
    markdown += '\n\n'.join(cleaned_lines)
    
    return markdown

def process_pdf(pdf_path, output_dir):
    """Process a single PDF file"""
    pdf_name = Path(pdf_path).stem
    output_file = Path(output_dir) / f"{pdf_name}.md"
    
    print(f"Processing: {pdf_name}")
    
    # Try pdftotext first
    temp_txt = f"/tmp/{pdf_name}.txt"
    text = None
    
    if extract_text_with_pdftotext(pdf_path, temp_txt):
        try:
            with open(temp_txt, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
            os.remove(temp_txt)
        except Exception as e:
            print(f"Error reading temp file: {e}")
    
    # Fallback to python extraction
    if not text:
        text = extract_text_with_python(pdf_path)
    
    # Convert to markdown
    markdown = clean_text_to_markdown(text, pdf_name.replace('-', ' ').replace('_', ' ').title())
    
    # Save markdown file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    return output_file, len(text) if text else 0

def main():
    pdf_dir = "/mnt/c/Users/Flavio/Documents/PDF AEROSAFE/"
    output_dir = "/mnt/c/Claude_Code/01-projects/CC-011-aerosafe-redesign/DOCS/aerosafe-docs/extracted-pdfs"
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # List of PDFs to process
    pdfs = [
        "AMBITO-SANITARIO-1.pdf",
        "APPROFONDIMENTO-TECNOLOGIA-DFS.pdf", 
        "CONSERVAZIONE-ORTOFRUTTA.pdf",
        "DISINFEZIONE-SANIFICAZIONE-ODONTOIATRIA.pdf",
        "DISINFEZIONE-SANIFICAZIONE-VETERINARIA.pdf",
        "IST-APPROFONDIMENTO-OFFERTA-AMBITO-FUNERARIO.pdf",
        "PRESENTAZIONE-IST_LEE-PLUS.pdf",
        "Presentazione-IST_Beverage-Industry.pdf",
        "Presentazione-IST_Collettivita.pdf",
        "Presentazione-IST_Container-e-Reefer.pdf",
        "Presentazione-IST_Food-Industry.pdf",
        "Presentazione-IST_Navale.pdf",
        "Presentazione-IST_Trasporto-Pubblico.pdf"
    ]
    
    results = []
    
    for pdf_name in pdfs:
        pdf_path = os.path.join(pdf_dir, pdf_name)
        if os.path.exists(pdf_path):
            output_file, text_length = process_pdf(pdf_path, output_dir)
            results.append({
                'pdf': pdf_name,
                'output': output_file,
                'text_length': text_length,
                'status': 'success' if text_length > 0 else 'failed'
            })
        else:
            print(f"PDF not found: {pdf_name}")
            results.append({
                'pdf': pdf_name,
                'output': None,
                'text_length': 0,
                'status': 'not_found'
            })
    
    # Print results
    print("\n" + "="*50)
    print("EXTRACTION RESULTS")
    print("="*50)
    for result in results:
        status_symbol = "✓" if result['status'] == 'success' else "✗"
        print(f"{status_symbol} {result['pdf']}: {result['text_length']} characters")
    
    return results

if __name__ == "__main__":
    main()