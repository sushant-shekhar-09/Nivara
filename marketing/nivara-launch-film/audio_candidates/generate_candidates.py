import subprocess, os, wave

base_dir = r'D:\Projects\Mental Health Assistance ML-Project\marketing\nivara-launch-film\audio_candidates'
voices_dir = os.path.join(base_dir, 'voices')
ffmpeg = r'C:\Users\Sushant Shekhar\AppData\Local\Programs\Python\Python311\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'

# Script lines with explicit pauses between shots
lines = [
    # Shot 1: The Hook (0 - 3s)
    ('Some things are hard to put into words.', 1.4),
    # Shot 2: Tension (3 - 7s)
    ('And the first step should feel easier.', 1.6),
    # Shot 3: Reveal (7 - 10s)
    ('Meet Nivara.', 1.5),
    # Shot 4: Intro (10 - 18s)
    ('A more private way to begin a student well-being check-in.', 1.6),
    # Shot 5: Two Modes (18 - 25s)
    ('Talk it through. Or take it one question at a time.', 1.8),
    # Shot 6: Explainability (25 - 32s)
    ('Explore screening indicators, with explanations, not labels.', 1.8),
    # Shot 7: Institutional (32 - 38s)
    ('For campuses, a clearer view of well-being, with privacy safeguards built in.', 2.0),
    # Shot 8: Brand Close (38 - 45s)
    ('Nivara. Start with a check-in.', 2.5),
]

candidates = [
    ('candidate_01_amy', 'en_US-amy-medium.onnx', 1.05),     # warm, intimate female
    ('candidate_02_lessac', 'en_US-lessac-medium.onnx', 1.0), # clear, balanced editorial
    ('candidate_03_ryan', 'en_US-ryan-medium.onnx', 1.02),   # calm grounded modern male
]

for name, model_file, length_scale in candidates:
    model_path = os.path.join(voices_dir, model_file)
    cand_dir = os.path.join(base_dir, name)
    os.makedirs(cand_dir, exist_ok=True)
    
    line_files = []
    for i, (text, pause_sec) in enumerate(lines):
        line_wav = os.path.join(cand_dir, f'line_{i:02d}.wav')
        
        # Run piper
        piper_cmd = [
            'piper',
            '-m', model_path,
            '-f', line_wav,
            '--length-scale', str(length_scale),
        ]
        p = subprocess.Popen(piper_cmd, stdin=subprocess.PIPE, text=True)
        p.communicate(input=text)
        
        # Add exact pause at the end using ffmpeg apad
        padded_wav = os.path.join(cand_dir, f'line_{i:02d}_pad.wav')
        pad_cmd = [
            ffmpeg, '-y',
            '-i', line_wav,
            '-af', f'apad=pad_dur={pause_sec},aresample=48000',
            padded_wav
        ]
        subprocess.run(pad_cmd, capture_output=True)
        line_files.append(padded_wav)
    
    # Concatenate all lines together
    concat_list = os.path.join(cand_dir, 'concat.txt')
    with open(concat_list, 'w', encoding='utf-8') as f:
        for lf in line_files:
            clean_path = lf.replace('\\', '/')
            f.write(f"file '{clean_path}'\n")
            
    full_wav = os.path.join(base_dir, f'{name}_full_48k.wav')
    concat_cmd = [
        ffmpeg, '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', concat_list,
        '-c:a', 'pcm_s16le',
        '-ar', '48000',
        full_wav
    ]
    subprocess.run(concat_cmd, capture_output=True)
    
    # Check duration
    with wave.open(full_wav, 'r') as wf:
        dur = wf.getnframes() / float(wf.getframerate())
        print(f'SUCCESS: {name} generated! Total duration: {dur:.2f}s ({full_wav})')
