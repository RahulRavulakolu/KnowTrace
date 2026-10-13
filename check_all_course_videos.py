import json
import urllib.request


def check(name, vid):
    try:
        url = (
            f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        res = urllib.request.urlopen(req)
        d = json.loads(res.read())
        print(f"[OK] {name}: {vid} -> {d.get('title')[:55]}")
        return True
    except Exception as e:
        print(f"[FAIL] {name}: {vid} -> {e}")
        return False


print("--- Testing NPTEL Machine Learning (IIT Madras) ---")
nptel_vids = [
    ("Lec 1 Intro to ML", "PPLop442CuU"),
    ("Lec 2 Probability & Linear Algebra", "1xT3f5p7zWw"),
    ("Lec 3 Linear Regression Intro", "4b4MUYve_U8"),
    ("Lec 4 Gradient Descent", "fC7V8QsPBec"),
    ("Lec 5 Normal Equations", "WpxfZwWp4o4"),
    ("Lec 6 Logistic Regression", "mD7_b7C_c8Y"),
    ("Lec 7 Maximum Likelihood", "WqG_Lq2E0Q0"),
    ("Lec 8 Regularization L1/L2", "KOTzK2u1u54"),
    ("Lec 9 Bias-Variance Tradeoff", "Y4qg0_68VbM"),
    ("Lec 10 Support Vector Machines", "1NxnPkZM9bc"),
    ("Lec 11 Kernels & Non-linear SVM", "3liCbRZPrGQ"),
    ("Lec 12 Decision Trees", "7VeUPuFGjhI"),
    ("Lec 13 Neural Networks Intro", "aircAruvnKk"),
    ("Lec 14 Backpropagation", "IHZwWFHWa-w"),
    ("Lec 15 Clustering & K-Means", "4b5d3muPQmA"),
    ("Lec 16 PCA Dimensionality Reduction", "FgakZw6K1QQ"),
]

for name, vid in nptel_vids:
    check(name, vid)

print("\n--- Testing MIT 6.0001 Python ---")
mitx_vids = [
    ("Lec 1 Computation", "ytpJdnlu9ug"),
    ("Lec 2 Branching & Loops", "2PhfMXXvAio"),
    ("Lec 3 String & Bisection", "jAoxb3-5kNo"),
    ("Lec 4 Decomposition & Functions", "MjbuarJ7SE0"),
    ("Lec 5 Tuples & Lists", "s9A8HvhE7w4"),
    ("Lec 6 Recursion & Dictionaries", "WPSeyjX1-4s"),
    ("Lec 7 Testing & Exceptions", "9H6MYZQBE74"),
    ("Lec 8 OOP", "fD_mBEh_kCQ"),
    ("Lec 9 Classes & Inheritance", "cKPlM9Q656U"),
    ("Lec 10 Efficiency Big-O", "o9nW0TuXXE4"),
    ("Lec 11 Searching & Sorting I", "7lQXYl_L28Q"),
    ("Lec 12 Searching & Sorting II", "67U1m350n2c"),
]

for name, vid in mitx_vids:
    check(name, vid)

print("\n--- Testing Algorithms & Data Structures ---")
algo_vids = [
    ("Lec 1 Peak Finding", "HtSuA80QTyo"),
    ("Lec 2 Models of Computation", "Zc54gFhdpLA"),
    ("Lec 3 Insertion & Merge Sort", "Kg4bqm1hzMQ"),
    ("Lec 4 Heaps and Heap Sort", "B7hVxCmfPtM"),
    ("Lec 5 Binary Search Trees", "9Jry5-82I68"),
    ("Lec 6 AVL Trees", "FNeL18KsWPc"),
    ("Lec 7 Counting & Radix Sort", "Nz1KZXbghj8"),
    ("Lec 8 Hashing Chaining", "0M_kIqhwbFo"),
    ("Lec 9 Table Doubling", "BRO7mVIFt08"),
    ("Lec 10 Open Addressing", "rvdSwCA9G3s"),
    ("Lec 11 BFS", "s-CYnVz-uh4"),
    ("Lec 12 DFS & Topological Sort", "AfSk24UTFS8"),
    ("Lec 13 Shortest Paths Dijkstra", "2E7MmKv0Y24"),
    ("Lec 14 Bellman-Ford", "ozsuci5pIso"),
    ("Lec 15 Dynamic Programming Intro", "OQ5jsbhAv_M"),
    ("Lec 16 DP Shortest Paths", "ENyox7kNKeY"),
]

for name, vid in algo_vids:
    check(name, vid)

print("\n--- Testing SWAYAM Python for Data Science ---")
swayam_vids = [
    ("Week 1 Python Intro", "rfscVS0vtbw"),
    ("Week 2 NumPy Computing", "QUT1VHiLmmI"),
    ("Week 3 Pandas DataFrames", "dcqPhpY7tWk"),
    ("Week 4 Matplotlib Visualization", "3Z84Btr5nQU"),
    ("Week 5 Scikit-Learn Machine Learning", "0B5eIE_1vpU"),
    ("Week 6 Case Studies & Projects", "k2P_pHQDlp0"),
]

for name, vid in swayam_vids:
    check(name, vid)

print("\n--- Testing Khan Academy Linear Algebra ---")
khan_vids = [
    ("Vectors & Spaces Intro", "fNk_zzaMoEs"),
    ("Linear Combinations & Span", "k7RM-ot2NWY"),
    ("Linear Independence", "uQhTuRlWM3E"),
    ("Matrix Transformations", "XkY2DOUCWMU"),
    ("Matrix Multiplication", "XkY2DOUCWMU"),
    ("Determinant Intuition", "Ip3X9LOh2dk"),
    ("Inverse Matrices", "uQhTuRlWM3E"),
    ("Eigenvalues & Eigenvectors", "PFDu9oVAE-g"),
]

for name, vid in khan_vids:
    check(name, vid)
