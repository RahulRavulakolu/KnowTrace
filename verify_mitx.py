import json
import urllib.request

mitx_candidates = [
    ("Lec 1", "ytpJdnlu9ug"),
    ("Lec 2", "2PhfMXXvAio"),
    ("Lec 3", "bvaTm5mQ4pM"),
    ("Lec 4", "MjbuarJ7SE0"),
    ("Lec 5", "RvRKT-URzrk"),
    ("Lec 6", "WPSeyjX1-4s"),
    ("Lec 7", "9H6MYZQBE74"),
    ("Lec 8", "-DP1i2ZU9gk"),
    ("Lec 9", "fD_mBEh_kCQ"),
    ("Lec 10", "o9nW0TuXXE4"),
    ("Lec 11", "7lQXYl_L28Q"),
    ("Lec 12", "67U1m350n2c"),
]

for title, vid in mitx_candidates:
    try:
        url = (
            f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        res = urllib.request.urlopen(req)
        d = json.loads(res.read())
        print(f"[OK] {title}: {vid} -> {d.get('title')}")
    except Exception as e:
        print(f"[FAIL] {title}: {vid} -> {e}")
