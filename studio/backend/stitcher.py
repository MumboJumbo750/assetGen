from PIL import Image

def stitch_horizontal(images: list[Image.Image]) -> Image.Image:
    if not images:
        return None
    
    width, height = images[0].size
    total_width = width * len(images)
    
    sheet = Image.new("RGBA", (total_width, height))
    
    for idx, img in enumerate(images):
        sheet.paste(img, (idx * width, 0))
        
    return sheet

def stitch_grid(images: list[Image.Image], cols: int) -> Image.Image:
    if not images:
        return None
        
    width, height = images[0].size
    rows = (len(images) + cols - 1) // cols
    
    sheet = Image.new("RGBA", (width * cols, height * rows))
    
    for idx, img in enumerate(images):
        row = idx // cols
        col = idx % cols
        sheet.paste(img, (col * width, row * height))
        
    return sheet
