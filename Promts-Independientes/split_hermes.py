from PIL import Image
import numpy as np

img = Image.open('kiro-introduction-starter-kit/assets/Hermes.png')
w, h = img.size

# Detected sprite boundaries from analysis:
# Sprite 1: rows 20 to 567
# Sprite 2: rows 623 to 1025
# Sprite 3: rows 1084 to 1470
# All in cols 214 to 744

sprites = [
    (20, 567),   # idle
    (623, 1025), # jump
    (1084, 1470) # fall
]

names = ['hermes_idle', 'hermes_jump', 'hermes_fall']

# Add some padding around each sprite
padding = 10

for idx, (top, bottom) in enumerate(sprites):
    # Crop with padding
    crop_top = max(0, top - padding)
    crop_bottom = min(h, bottom + padding)
    
    frame = img.crop((0, crop_top, w, crop_bottom))
    frame.save(f'kiro-introduction-starter-kit/assets/{names[idx]}.png')
    print(f"Saved {names[idx]}.png ({frame.size[0]}x{frame.size[1]})")

print("\nDone! All 3 sprites extracted correctly.")
