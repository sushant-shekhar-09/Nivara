import subprocess
import time
import requests
import json
import asyncio
import websockets
import os
import shutil
import sys

out_dir = 'D:/Projects/Mental Health Assistance ML-Project/marketing/nivara-launch-film/output/project'
if os.path.exists(out_dir):
    shutil.rmtree(out_dir)
os.makedirs(out_dir, exist_ok=True)

user_data = 'C:/temp/chrome_profile_master'
if os.path.exists(user_data):
    try:
        shutil.rmtree(user_data)
    except:
        pass
os.makedirs(user_data, exist_ok=True)

chrome_cmd = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '--headless=new',
    '--remote-debugging-port=9222',
    f'--user-data-dir={user_data}',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    'http://localhost:9000/'
]

print("Launching Chrome...", flush=True)
proc = subprocess.Popen(chrome_cmd)
time.sleep(3)

async def main():
    print("Connecting to CDP...", flush=True)
    res = requests.get('http://127.0.0.1:9222/json')
    pages = [p for p in res.json() if p.get('type') == 'page' and 'localhost:9000' in p.get('url', '')]
    if not pages:
        print("Error: No Motion Canvas page found in Chrome!", flush=True)
        return
    
    ws_url = pages[0]['webSocketDebuggerUrl']
    print(f"Debugger WS URL: {ws_url}", flush=True)

    async with websockets.connect(ws_url, max_size=10**8) as ws:
        # Wait up to 10s for UI to show RENDER button
        button_found = False
        for attempt in range(10):
            msg = {
                'id': attempt + 1,
                'method': 'Runtime.evaluate',
                'params': {
                    'expression': """
                        (() => {
                            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'RENDER');
                            if (btn) {
                                btn.click();
                                return 'CLICKED_RENDER';
                            }
                            return 'WAITING';
                        })()
                    """,
                    'returnByValue': True
                }
            }
            await ws.send(json.dumps(msg))
            resp = json.loads(await ws.recv())
            val = resp.get('result', {}).get('result', {}).get('value', '')
            if val == 'CLICKED_RENDER':
                print("Successfully triggered RENDER!", flush=True)
                button_found = True
                break
            print(f"Attempt {attempt+1}: UI still loading ({val}), waiting...", flush=True)
            await asyncio.sleep(1)

        if not button_found:
            print("Failed to find RENDER button after 10 attempts", flush=True)
            return

        # Poll frame export progress
        last_count = 0
        stable_count = 0
        start_time = time.time()
        while True:
            await asyncio.sleep(2)
            elapsed = time.time() - start_time
            current_frames = len(os.listdir(out_dir)) if os.path.exists(out_dir) else 0

            # Query UI state
            msg = {
                'id': 100 + int(elapsed),
                'method': 'Runtime.evaluate',
                'params': {
                    'expression': """
                        (() => {
                            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('RENDER') || b.innerText.includes('CANCEL') || b.innerText.includes('PAUSE'));
                            return btn ? btn.innerText.trim() : 'UNKNOWN';
                        })()
                    """,
                    'returnByValue': True
                }
            }
            await ws.send(json.dumps(msg))
            resp = json.loads(await ws.recv())
            btn_state = resp.get('result', {}).get('result', {}).get('value', 'UNKNOWN')

            print(f"[{elapsed:.1f}s] Frames: {current_frames} | Button: {btn_state}", flush=True)

            if current_frames > 200 and btn_state == 'RENDER':
                print(f"Render completed! Total frames: {current_frames}", flush=True)
                break

            if current_frames > 200 and current_frames == last_count:
                stable_count += 1
                if stable_count >= 8 and btn_state != 'PAUSE':
                    print(f"Frame count stabilized at {current_frames}. Concluding.", flush=True)
                    break
            else:
                stable_count = 0
            
            last_count = current_frames
            if elapsed > 180: # Safety timeout
                print("Reached maximum time limit of 180s.", flush=True)
                break

try:
    asyncio.run(main())
finally:
    proc.terminate()
    print("Chrome terminated cleanly.", flush=True)
