import subprocess
import os
import shutil
from PIL import Image, ImageDraw

base_dir = 'D:/Projects/Mental Health Assistance ML-Project/marketing/nivara-launch-film'
frames_dir = os.path.join(base_dir, 'output/project')
audio_path = os.path.join(base_dir, 'src/audio/master_preview_48k.wav')
output_video = os.path.join(base_dir, 'renders/v2/Nivara_Launch_Film_V2_16x9.mp4')
contact_sheet_path = os.path.join(base_dir, 'renders/v2/preview_contact_sheet.jpg')
artifact_dir = r'C:\Users\Sushant Shekhar\.gemini\antigravity\brain\76dcdf55-a66f-4ec2-99d8-5c3fd007f353'

ffmpeg_path = r'C:\Users\Sushant Shekhar\AppData\Local\Programs\Python\Python311\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'

# 1. Check frame count
frames = sorted(os.listdir(frames_dir))
total_frames = len(frames)
print(f"Total exported frames: {total_frames} (Range: {frames[0]} to {frames[-1]})", flush=True)

# 2. Encode Master MP4 at 60 fps
cmd = [
    ffmpeg_path, '-y',
    '-framerate', '60',
    '-i', os.path.join(frames_dir, '%06d.png'),
    '-i', audio_path,
    '-t', '45.00',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-crf', '17',
    '-preset', 'slow',
    '-c:a', 'aac',
    '-b:a', '320k',
    '-ar', '48000',
    '-movflags', '+faststart',
    output_video
]
print("Encoding Master MP4 with FFmpeg...", flush=True)
subprocess.run(cmd, check=True)
print(f"Successfully encoded: {output_video}", flush=True)

# 3. Create 3x3 Preview Contact Sheet
key_indices = [120, 330, 480, 640, 950, 1320, 1800, 2250, 2600]
# Clamp to available frames
key_indices = [min(idx, total_frames - 1) for idx in key_indices]

labels = [
    "01 - The Hook (02.0s): 'Some things are hard to put into words.'",
    "02 - Academic Tension (05.5s): Deadline & Unsent Draft Cards",
    "03 - Silence & Wave (08.0s): The Unheard Acoustic Signal",
    "04 - Signature Reveal (10.6s): Nivara Botanical Emblem Bloom",
    "05 - Dual Modes (15.8s): Conversational Voice AI Assistant",
    "06 - Screening Action (22.0s): PSS-10 Interaction & Haptic Click",
    "07 - TreeSHAP (30.0s): Explainable Feature Attributions (AUC 0.8328)",
    "08 - Governance (37.5s): Institutional Privacy & k >= 5 Shield",
    "09 - Brand Close (43.3s): 'A quieter first step toward well-being.'"
]

cols, rows = 3, 3
thumb_w, thumb_h = 560, 315
pad = 14
header_h = 30
canvas_w = cols * thumb_w + (cols + 1) * pad
canvas_h = rows * (thumb_h + header_h) + (rows + 1) * pad

sheet = Image.new('RGB', (canvas_w, canvas_h), '#12110F')
draw = ImageDraw.Draw(sheet)

for idx, (f_num, label) in enumerate(zip(key_indices, labels)):
    c = idx % cols
    r = idx // cols
    x = pad + c * (thumb_w + pad)
    y = pad + r * (thumb_h + header_h + pad)
    
    fname = f"{f_num:06d}.png"
    fpath = os.path.join(frames_dir, fname)
    if os.path.exists(fpath):
        img = Image.open(fpath).convert('RGB')
        img = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(img, (x, y + header_h))
    
    draw.text((x + 6, y + 7), label, fill='#F5F1E9')

sheet.save(contact_sheet_path, quality=95)
print(f"Contact sheet saved to: {contact_sheet_path}", flush=True)

# 4. Copy to Artifact Directory for UI view
shutil.copyfile(contact_sheet_path, os.path.join(artifact_dir, 'preview_contact_sheet.jpg'))
shutil.copyfile(os.path.join(base_dir, 'renders/v2/Nivara_Launch_Film_V2.srt'), os.path.join(artifact_dir, 'Nivara_Launch_Film_V2.srt'))
print("Copied preview contact sheet and SRT to artifacts directory!", flush=True)

# 5. Telemetry
stat = os.stat(output_video)
print(f"Master Video Size: {stat.st_size / (1024*1024):.2f} MB", flush=True)
