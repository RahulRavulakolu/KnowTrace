import urllib.request
import json

def test_vids(label, vids):
    print(f"\n=== {label} ===")
    success_count = 0
    valid_list = []
    for order, title, vid in vids:
        try:
            url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
            res = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}))
            d = json.loads(res.read())
            print(f"[{order}] OK: {title} ({vid}) -> {d.get('title')[:45]}")
            success_count += 1
            valid_list.append((order, title, vid))
        except Exception as e:
            print(f"[{order}] FAIL: {title} ({vid}) -> {e}")
    print(f"Passed: {success_count}/{len(vids)}")
    return valid_list

# 1. NPTEL Machine Learning (IIT Madras)
nptel_vids = [
    (1, "Lecture 1: Introduction to Machine Learning", "PPLop442CuU"),
    (2, "Lecture 2: Probability Review & Linear Algebra", "1xT3f5p7zWw"),
    (3, "Lecture 3: Linear Regression & Least Squares", "4b4MUYve_U8"),
    (4, "Lecture 4: Gradient Descent & Optimization", "fC7V8QsPBec"),
    (5, "Lecture 5: Normal Equations & Matrix Solutions", "KOTzK2u1u54"),
    (6, "Lecture 6: Logistic Regression", "mD7_b7C_c8Y"),
    (7, "Lecture 7: Maximum Likelihood Estimation", "WqG_Lq2E0Q0"),
    (8, "Lecture 8: Regularization (L1 & L2)", "KOTzK2u1u54"),
    (9, "Lecture 9: Support Vector Machines (SVM)", "1NxnPkZM9bc"),
    (10, "Lecture 10: Kernel Methods & Dual Formulation", "3liCbRZPrGQ"),
    (11, "Lecture 11: Decision Trees & Information Gain", "7VeUPuFGjhI"),
    (12, "Lecture 12: Neural Networks & Perceptron", "aircAruvnKk"),
    (13, "Lecture 13: Backpropagation & Training", "IHZwWFHWa-w"),
    (14, "Lecture 14: Clustering & K-Means", "4b5d3muPQmA"),
    (15, "Lecture 15: PCA Dimensionality Reduction", "FgakZw6K1QQ"),
    (16, "Lecture 16: Reinforcement Learning & Q-Learning", "2pWv7GOvuf0"),
]
test_vids("NPTEL Machine Learning", nptel_vids)

# 2. MITx 6.0001 Python
mitx_vids = [
    (1, "Lecture 1: What is Computation?", "ytpJdnlu9ug"),
    (2, "Lecture 2: Branching and Iteration", "2PhfMXXvAio"),
    (3, "Lecture 3: String Manipulation, Guess and Check", "MjbuarJ7SE0"),
    (4, "Lecture 4: Decomposition, Abstractions, Functions", "MjbuarJ7SE0"),
    (5, "Lecture 5: Tuples, Lists, Aliasing, Mutability", "ytpJdnlu9ug"),
    (6, "Lecture 6: Recursion and Dictionaries", "WPSeyjX1-4s"),
    (7, "Lecture 7: Testing, Debugging, Exceptions", "9H6MYZQBE74"),
    (8, "Lecture 8: Object Oriented Programming", "fD_mBEh_kCQ"),
    (9, "Lecture 9: Python Classes and Inheritance", "fD_mBEh_kCQ"),
    (10, "Lecture 10: Understanding Program Efficiency", "o9nW0TuXXE4"),
    (11, "Lecture 11: Searching and Sorting I", "7lQXYl_L28Q"),
    (12, "Lecture 12: Searching and Sorting II", "67U1m350n2c"),
]
test_vids("MITx Python 6.0001", mitx_vids)

# 3. MIT 6.006 Algorithms & Data Structures
algo_vids = [
    (1, "Lecture 1: Algorithmic Thinking, Peak Finding", "HtSuA80QTyo"),
    (2, "Lecture 2: Models of Computation, Document Distance", "Zc54gFhdpLA"),
    (3, "Lecture 3: Insertion Sort, Merge Sort", "Kg4bqm1hzMQ"),
    (4, "Lecture 4: Heaps and Heap Sort", "B7hVxCmfPtM"),
    (5, "Lecture 5: Binary Search Trees, BST Sort", "9Jry5-82I68"),
    (6, "Lecture 6: AVL Trees, AVL Sort", "FNeL18KsWPc"),
    (7, "Lecture 7: Counting Sort, Radix Sort, Lower Bounds", "Nz1KZXbghj8"),
    (8, "Lecture 8: Hashing with Chaining", "0M_kIqhwbFo"),
    (9, "Lecture 9: Table Doubling, Karp-Rabin", "BRO7mVIFt08"),
    (10, "Lecture 10: Open Addressing, Cryptographic Hashing", "rvdSwCA9G3s"),
    (11, "Lecture 11: Breadth-First Search (BFS)", "s-CYnVz-uh4"),
    (12, "Lecture 12: Depth-First Search (DFS), Topological Sort", "AfSk24UTFS8"),
    (13, "Lecture 13: Shortest Paths: Dijkstra Algorithm", "2E7MmKv0Y24"),
    (14, "Lecture 14: Shortest Paths: Bellman-Ford", "ozsuci5pIso"),
    (15, "Lecture 15: Dynamic Programming: Memoization", "OQ5jsbhAv_M"),
    (16, "Lecture 16: Dynamic Programming: Shortest Paths", "ENyox7kNKeY"),
    (17, "Lecture 17: Dynamic Programming: Text Justification", "ENyox7kNKeY"),
    (18, "Lecture 18: Computational Complexity & NP-Completeness", "moPtwx_pHLE"),
]
test_vids("MIT 6.006 Algorithms & Data Structures", algo_vids)
