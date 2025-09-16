#!/usr/bin/env python3
import fitz  # PyMuPDF
import os
from pathlib import Path

# Paths
PDF_DIR = "/mnt/c/Users/Flavio/Documents/PDF AEROSAFE"
OUTPUT_BASE = "/mnt/c/Claude_Code/01-projects/CC-011-aerosafe-redesign/DOCS/aerosafe-docs/static/img/docs"

# Mapping of PDF files to output directories
PDF_MAPPING = {
    "AMBITO-SANITARIO-1.pdf": "ambito-sanitario",
    "APPROFONDIMENTO-TECNOLOGIA-DFS.pdf": "tecnologia-dfs", 
    "CONSERVAZIONE-ORTOFRUTTA.pdf": "conservazione-ortofrutta",
    "DISINFEZIONE-SANIFICAZIONE-ODONTOIATRIA.pdf": "disinfezione-odontoiatria",
    "DISINFEZIONE-SANIFICAZIONE-VETERINARIA.pdf": "disinfezione-veterinaria",
    "IST-APPROFONDIMENTO-OFFERTA-AMBITO-FUNERARIO.pdf": "ambito-funerario",
    "PRESENTAZIONE-IST_LEE-PLUS.pdf": "lee-plus",
    "Presentazione-IST_Beverage-Industry.pdf": "beverage-industry",
    "Presentazione-IST_Collettivita.pdf": "collettivita",
    "Presentazione-IST_Container-e-Reefer.pdf": "container-reefer",
    "Presentazione-IST_Food-Industry.pdf": "food-industry",
    "Presentazione-IST_Navale.pdf": "navale",
    "Presentazione-IST_Trasporto-Pubblico.pdf": "trasporto-pubblico",
    "SCHEDA-PRODOTTO-DFS-1.pdf": "dfs-1",
    "SCHEDA-PRODOTTO-DFS-4.pdf": "dfs-4",
    "SCHEDA-PRODOTTO-LEE_PLUS-ANTIODOR.pdf": "lee-plus-antiodor",
    "SCHEDA-PRODOTTO-SANAPUR-ATOMIC.pdf": "sanapur-atomic",
    "SCHEDA-PRODOTTO-SILVER-SHIELD.pdf": "silver-shield",
    "SP-X-ODOR.pdf": "x-odor",
    "Tecnologia-DryFogS.pdf": "tecnologia-dryfogs"
}

def extract_images_from_pdf(pdf_path, output_dir):
    """Extract all images from a PDF file"""
    print(f"Processing: {pdf_path}")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Open PDF
    pdf_document = fitz.open(pdf_path)
    
    image_count = 0
    
    # Iterate through pages
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        
        # Get images on this page
        image_list = page.get_images(full=True)
        
        # Extract each image
        for img_index, img in enumerate(image_list):
            # Get image data
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Save image
            image_filename = f"page{page_num + 1}_img{img_index + 1}.{image_ext}"
            image_path = os.path.join(output_dir, image_filename)
            
            with open(image_path, "wb") as img_file:
                img_file.write(image_bytes)
            
            print(f"  Saved: {image_filename}")
            image_count += 1
    
    pdf_document.close()
    print(f"  Total images extracted: {image_count}\n")
    return image_count

def main():
    total_images = 0
    processed_pdfs = 0
    
    print("=== PDF Image Extraction Starting ===\n")
    
    for pdf_name, output_folder in PDF_MAPPING.items():
        pdf_path = os.path.join(PDF_DIR, pdf_name)
        output_dir = os.path.join(OUTPUT_BASE, output_folder)
        
        if os.path.exists(pdf_path):
            try:
                count = extract_images_from_pdf(pdf_path, output_dir)
                total_images += count
                processed_pdfs += 1
            except Exception as e:
                print(f"Error processing {pdf_name}: {e}\n")
        else:
            print(f"PDF not found: {pdf_path}\n")
    
    print(f"=== Extraction Complete ===")
    print(f"PDFs processed: {processed_pdfs}")
    print(f"Total images extracted: {total_images}")

if __name__ == "__main__":
    main()