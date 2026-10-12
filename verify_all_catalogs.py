import json
import urllib.request


def verify(course_name, lectures):
    print(f"\n================ {course_name} ================")
    valid = []
    for num, title, vid in lectures:
        try:
            url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            res = urllib.request.urlopen(req)
            d = json.loads(res.read())
            print(f"[{num:02d}] OK: {title} ({vid}) -> {d.get('title')[:45]}")
            valid.append((num, title, vid))
        except Exception as e:
            print(f"[{num:02d}] FAIL: {title} ({vid}) -> {e}")
    print(f"Verified {len(valid)} / {len(lectures)} for {course_name}")
    return valid


# 1. NPTEL Machine Learning (IIT Madras)
nptel_lectures = [
    (1, "Lecture 1: Introduction to Machine Learning", "PPLop442CuU"),
    (2, "Lecture 2: Probability & Linear Algebra Review", "1xT3f5p7zWw"),
    (3, "Lecture 3: Linear Regression Formulation", "4b4MUYve_U8"),
    (4, "Lecture 4: Gradient Descent Optimization", "fC7V8QsPBec"),
    (5, "Lecture 5: Normal Equations Solution", "WpxfZwWp4o4"),
    (6, "Lecture 6: Logistic Regression Classification", "mD7_b7C_c8Y"),
    (7, "Lecture 7: Maximum Likelihood Estimation", "WqG_Lq2E0Q0"),
    (8, "Lecture 8: Regularization (L1 & L2)", "KOTzK2u1u54"),
    (9, "Lecture 9: Bias-Variance Tradeoff", "Y4qg0_68VbM"),
    (10, "Lecture 10: Support Vector Machines (SVM)", "1NxnPkZM9bc"),
    (11, "Lecture 11: Kernel Methods & Dual Formulation", "3liCbRZPrGQ"),
    (12, "Lecture 12: Decision Trees & Information Gain", "7VeUPuFGjhI"),
    (13, "Lecture 13: Neural Networks & Perceptron", "aircAruvnKk"),
    (14, "Lecture 14: Backpropagation Algorithm", "IHZwWFHWa-w"),
    (15, "Lecture 15: K-Means Clustering & EM", "4b5d3muPQmA"),
    (16, "Lecture 16: Dimensionality Reduction & PCA", "FgakZw6K1QQ"),
    (17, "Lecture 17: Reinforcement Learning Foundations", "2pWv7GOvuf0"),
    (18, "Lecture 18: Q-Learning & Course Wrap-up", "wN3rxIKm3kE"),
]
verify("NPTEL Machine Learning", nptel_lectures)

# 2. MITx 6.0001 / 6.00.1x Introduction to Computer Science in Python
mitx_lectures = [
    (1, "Lecture 1: What is Computation?", "ytpJdnlu9ug"),
    (2, "Lecture 2: Branching and Iteration", "2PhfMXXvAio"),
    (3, "Lecture 3: String Manipulation, Guess and Check, Bisection", "jAoxb3-5kNo"),
    (4, "Lecture 4: Decomposition, Abstractions, Functions", "MjbuarJ7SE0"),
    (5, "Lecture 5: Tuples, Lists, Aliasing, Mutability", "s9A8HvhE7w4"),
    (6, "Lecture 6: Recursion and Dictionaries", "WPSeyjX1-4s"),
    (7, "Lecture 7: Testing, Debugging, Exceptions", "9H6MYZQBE74"),
    (8, "Lecture 8: Object Oriented Programming", "fD_mBEh_kCQ"),
    (9, "Lecture 9: Python Classes and Inheritance", "cKPlM9Q656U"),
    (10, "Lecture 10: Understanding Program Efficiency", "o9nW0TuXXE4"),
    (11, "Lecture 11: Searching and Sorting Algorithms", "7lQXYl_L28Q"),
    (12, "Lecture 12: Searching and Sorting Part II", "67U1m350n2c"),
]
verify("MITx Python 6.0001", mitx_lectures)

# 3. MIT 6.006 Algorithms & Data Structures
algo_lectures = [
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
verify("MIT 6.006 Algorithms & Data Structures", algo_lectures)

# 4. SWAYAM Python for Data Science
swayam_lectures = [
    (1, "Week 1 Lecture 1: Python Basics & Syntax", "rfscVS0vtbw"),
    (2, "Week 1 Lecture 2: Data Structures in Python", "daefaLgNkw0"),
    (3, "Week 2 Lecture 1: NumPy Array Manipulation", "QUT1VHiLmmI"),
    (4, "Week 2 Lecture 2: Vectorization & Broadcasting", "4b5d3muPQmA"),
    (5, "Week 3 Lecture 1: Pandas DataFrames & Indexing", "dcqPhpY7tWk"),
    (6, "Week 3 Lecture 2: Data Cleaning & GroupBy", "ZyhVh-qRZPA"),
    (7, "Week 4 Lecture 1: Matplotlib & Seaborn Visualization", "3Z84Btr5nQU"),
    (8, "Week 4 Lecture 2: Scikit-Learn Machine Learning Pipeline", "0B5eIE_1vpU"),
]
verify("SWAYAM Python for Data Science", swayam_lectures)

# 5. Khan Academy Linear Algebra
khan_lectures = [
    (1, "Vectors and Spaces Introduction", "fNk_zzaMoEs"),
    (2, "Linear Combinations, Span, and Basis Vectors", "k7RM-ot2NWY"),
    (3, "Linear Independence and Subspaces", "uQhTuRlWM3E"),
    (4, "Linear Transformations & Matrices", "XkY2DOUCWMU"),
    (5, "Matrix Multiplication as Composition", "XkY2DOUCWMU"),
    (6, "The Determinant Formula and Geometric Meaning", "Ip3X9LOh2dk"),
    (7, "Inverse Matrices, Column Space and Null Space", "uQhTuRlWM3E"),
    (8, "Eigenvalues and Eigenvectors Intuition", "PFDu9oVAE-g"),
]
verify("Khan Academy Linear Algebra", khan_lectures)
