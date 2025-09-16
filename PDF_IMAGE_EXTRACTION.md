# PDF Image Extraction Guide

This document explains how to extract images from the AeroSafe PDF documents for use in the documentation.

## Directory Structure

Images from each PDF should be extracted to corresponding directories in `static/img/docs/`:

```
static/img/docs/
├── ambito-sanitario/          # AMBITO-SANITARIO-1.pdf
├── approfondimento-tecnologia-dfs/  # APPROFONDIMENTO-TECNOLOGIA-DFS.pdf
├── conservazione-ortofrutta/  # CONSERVAZIONE-ORTOFRUTTA.pdf
├── disinfezione-odontoiatria/ # DISINFEZIONE-SANIFICAZIONE-ODONTOIATRIA.pdf
├── disinfezione-veterinaria/  # DISINFEZIONE-SANIFICAZIONE-VETERINARIA.pdf
├── offerta-ambito-funerario/  # IST-APPROFONDIMENTO-OFFERTA-AMBITO-FUNERARIO.pdf
├── lee-plus/                  # PRESENTAZIONE-IST_LEE-PLUS.pdf
├── beverage-industry/         # Presentazione-IST_Beverage-Industry.pdf
├── collettivita/             # Presentazione-IST_Collettivita.pdf
├── container-reefer/         # Presentazione-IST_Container-e-Reefer.pdf
├── food-industry/            # Presentazione-IST_Food-Industry.pdf
├── navale/                   # Presentazione-IST_Navale.pdf
├── trasporto-pubblico/       # Presentazione-IST_Trasporto-Pubblico.pdf
├── sanapur/                  # SANAPUR_APPROFONDIMENTI.pdf
├── scheda-prodotto-dfs-1/    # SCHEDA-PRODOTTO-DFS-1.pdf
├── scheda-prodotto-dfs-4/    # SCHEDA-PRODOTTO-DFS-4.pdf
├── scheda-prodotto-h1-0/     # SCHEDA-PRODOTTO-H1.0.pdf
└── tecnologia-dryfogs/       # Tecnologia-DryFogS.pdf
```

## Source PDFs Location

Original PDFs are located at: `/mnt/c/Users/Flavio/Documents/PDF AEROSAFE/`

## Image Extraction Methods

### Method 1: Using pdfimages (Requires poppler-utils)

```bash
# Install poppler-utils (requires sudo access)
sudo apt-get update && sudo apt-get install -y poppler-utils

# Extract images from a PDF
pdfimages -all "/path/to/source.pdf" "/path/to/output/directory/image"
```

### Method 2: Using Python PyMuPDF

```python
import fitz  # PyMuPDF
import os
from PIL import Image

def extract_images_from_pdf(pdf_path, output_dir):
    """Extract all images from a PDF file"""
    doc = fitz.open(pdf_path)
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    image_count = 0
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        image_list = page.get_images()
        
        for img_index, img in enumerate(image_list):
            # Get image
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            
            # Save image
            if pix.n - pix.alpha < 4:  # GRAY or RGB
                img_name = f"page_{page_num+1}_img_{img_index+1}.png"
                img_path = os.path.join(output_dir, img_name)
                pix.pil_save(img_path, format="PNG")
                image_count += 1
            
            pix = None
    
    doc.close()
    return image_count

# Example usage
pdf_path = "/mnt/c/Users/Flavio/Documents/PDF AEROSAFE/DFS-1.pdf"
output_dir = "static/img/docs/scheda-prodotto-dfs-1/"
extract_images_from_pdf(pdf_path, output_dir)
```

### Method 3: Using pdf2image + PIL

```python
from pdf2image import convert_from_path
import os

def pdf_to_images(pdf_path, output_dir):
    """Convert PDF pages to images"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Convert PDF to images
    pages = convert_from_path(pdf_path, dpi=300)
    
    for i, page in enumerate(pages):
        image_name = f"page_{i+1}.png"
        image_path = os.path.join(output_dir, image_name)
        page.save(image_path, 'PNG')
    
    return len(pages)
```

## Image Naming Convention

For extracted images, use the following naming pattern:
- `page_X_img_Y.png` - For individual extracted images
- `page_X.png` - For full page captures
- `diagram_description.png` - For meaningful technical diagrams
- `product_name_angle.png` - For product photos

## Integration with Documentation

Once images are extracted, reference them in markdown files:

```markdown
![DFS-1 Device](/img/docs/scheda-prodotto-dfs-1/dfs1_device_front.png)

## Technical Diagram
![DryFogS Technology](/img/docs/tecnologia-dryfogs/dryfogs_process_diagram.png)
```

## Priority PDFs for Image Extraction

1. **APPROFONDIMENTO-TECNOLOGIA-DFS.pdf** - Technical diagrams
2. **PRESENTAZIONE-IST_LEE-PLUS.pdf** - Product images
3. **SCHEDA-PRODOTTO-DFS-1.pdf** - Product specifications
4. **SCHEDA-PRODOTTO-DFS-4.pdf** - Product specifications
5. **Tecnologia-DryFogS.pdf** - Technology diagrams
6. **CONSERVAZIONE-ORTOFRUTTA.pdf** - Application examples

## Implementation Status

- ✅ Directory structure created
- ❌ PDF image extraction tool installation (requires system permissions)
- ❌ Automated extraction script
- ❌ Image optimization and compression
- ❌ Integration with existing documentation

## Next Steps

1. Install required system tools (poppler-utils or python packages)
2. Create extraction scripts for each PDF
3. Extract and organize images
4. Update documentation files to reference extracted images
5. Optimize images for web delivery

---

*This guide was created as part of the AeroSafe documentation cleanup and consolidation project.*