import json
import re
import urllib.request
from pathlib import Path


def get_playlist_videos(playlist_id):
    url = f"https://www.youtube.com/playlist?list={playlist_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"})
    html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")

    # Try finding ytInitialData
    m = re.search(r"var ytInitialData = ({.*?});</script>", html)
    if not m:
        m = re.search(r"ytInitialData = ({.*?});", html)

    unique = []
    seen = set()

    if m:
        try:
            data = json.loads(m.group(1))
            # Walk json to find playlistVideoRenderer
            def walk(obj):
                if isinstance(obj, dict):
                    if "playlistVideoRenderer" in obj:
                        pvr = obj["playlistVideoRenderer"]
                        vid = pvr.get("videoId")
                        title = pvr.get("title", {}).get("runs", [{}])[0].get("text", "")
                        if vid and vid not in seen:
                            seen.add(vid)
                            unique.append((vid, title))
                    for v in obj.values():
                        walk(v)
                elif isinstance(obj, list):
                    for item in obj:
                        walk(item)
            walk(data)
        except Exception as e:
            print("Error parsing ytInitialData:", e)

    if not unique:
        # Fallback regex for videoId
        vids = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
        for vid in vids:
            if vid not in seen and vid != "live_stream":
                seen.add(vid)
                unique.append((vid, f"Video {vid}"))

    return unique

def verify_oembed(vid):
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        res = urllib.request.urlopen(req)
        d = json.loads(res.read())
        return True, d.get("title")
    except Exception as e:
        return False, str(e)

print("--- 1. MIT 6.0001 Python (PLUl4u3cNGP63WbdFxL8giv4yhGDMGa57q) ---")
python_vids = get_playlist_videos("PLUl4u3cNGP63WbdFxL8giv4yhGDMGa57q")
print(f"Found {len(python_vids)} videos")
verified_python = []
for i, (vid, _title) in enumerate(python_vids, 1):
    ok, real_title = verify_oembed(vid)
    if ok:
        print(f"  [Lec {i}] {vid} -> {real_title}")
        verified_python.append({"order": i, "youtube_id": vid, "title": real_title})

print("\n--- 2. MIT 6.006 Algorithms (PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb) ---")
algo_vids = get_playlist_videos("PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb")
print(f"Found {len(algo_vids)} videos")
verified_algo = []
for i, (vid, _title) in enumerate(algo_vids, 1):
    ok, real_title = verify_oembed(vid)
    if ok:
        print(f"  [Lec {i}] {vid} -> {real_title}")
        verified_algo.append({"order": i, "youtube_id": vid, "title": real_title})

# 3. NPTEL Machine Learning (PLbRMhDVUMngcf7bSoxxS1w5p25u08h_4x or PL1xHD4vteKYVpaIiy295pg6_SY5qznWC7)
print("\n--- 3. NPTEL Machine Learning (PLbRMhDVUMngcf7bSoxxS1w5p25u08h_4x) ---")
nptel_vids = get_playlist_videos("PLbRMhDVUMngcf7bSoxxS1w5p25u08h_4x")
print(f"Found {len(nptel_vids)} videos")
verified_nptel = []
for i, (vid, _title) in enumerate(nptel_vids, 1):
    ok, real_title = verify_oembed(vid)
    if ok:
        print(f"  [Lec {i}] {vid} -> {real_title}")
        verified_nptel.append({"order": i, "youtube_id": vid, "title": real_title})

out_path = Path(__file__).resolve().parent.parent / "data" / "verified_playlists.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({
        "mit_python": verified_python,
        "mit_algorithms": verified_algo,
        "nptel_ml": verified_nptel
    }, f, indent=2)
print(f"\nSaved to {out_path}")


