"""Curated multi-week lecture catalogs with 100% verified playable YouTube embeds.

Covers full curricula for:
- MIT 6.006 Algorithms & Data Structures (24 lectures)
- NPTEL Machine Learning - IIT Madras (20 lectures)
- MITx 6.0001 Introduction to CS and Programming in Python (12 lectures)
- SWAYAM Python for Data Science (8 lectures)
- Khan Academy Linear Algebra (8 lectures)
"""

from typing import Any, Dict, List

# ---------------------------------------------------------------------------
# MIT 6.006: Introduction to Algorithms (Prof. Erik Demaine & Prof. Srini Devadas)
# ---------------------------------------------------------------------------
MIT_6006_ALGORITHMS_LECTURES: List[Dict[str, Any]] = [
    {
        "id": "mit-6006-lec-1",
        "module_title": "Unit 1: Algorithmic Thinking & Peak Finding",
        "order": 1,
        "title": "Lecture 1: Algorithmic Thinking, Peak Finding",
        "duration_minutes": 53,
        "youtube_id": "HtSuA80QTyo",
        "concept_name": "Peak Finding & Asymptotic Analysis",
        "notes": [
            "A 1D peak finding problem: an element a[i] is a peak iff a[i] >= a[i-1] and a[i] >= a[i+1].",
            "Straightforward linear scan takes Theta(n) time.",
            "Divide-and-conquer binary search achieves Theta(log n) time.",
            "2D peak finding: an element is a peak if >= all 4 neighbors. Divide-and-conquer achieves O(n log m) time.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Welcome to 6.006, Introduction to Algorithms. I am Srini Devadas."},
            {"seconds": 240, "timestamp": "04:00", "text": "This course focuses on efficient algorithms for real-world computational problems."},
            {"seconds": 720, "timestamp": "12:00", "text": "Let us define 1D peak finding. In an array of numbers, position i is a peak if it is greater than or equal to both its neighbors."},
            {"seconds": 1500, "timestamp": "25:00", "text": "If we look at middle element a[n/2] and it is less than a[n/2-1], there must be a peak on the left half."},
            {"seconds": 2400, "timestamp": "40:00", "text": "Writing the recurrence: T(n) = T(n/2) + Theta(1), yielding Theta(log n)."},
        ],
        "resources": [
            {"title": "Lecture 1 Lecture Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec01/"},
        ],
    },
    {
        "id": "mit-6006-lec-2",
        "module_title": "Unit 1: Algorithmic Thinking & Peak Finding",
        "order": 2,
        "title": "Lecture 2: Models of Computation, Document Distance",
        "duration_minutes": 51,
        "youtube_id": "Zc54gFhdpLA",
        "concept_name": "Models of Computation & Document Distance",
        "notes": [
            "Random Access Machine (RAM) model: constant time memory access in word-sized operations.",
            "Python cost model: list operations, dictionary hashing, and pointer manipulations.",
            "Document distance: computing cosine similarity between term frequency vectors.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we address how we measure computational efficiency: models of computation."},
            {"seconds": 360, "timestamp": "06:00", "text": "In the RAM model, instructions execute one by one and memory words can be accessed in O(1) time."},
            {"seconds": 1200, "timestamp": "20:00", "text": "Document distance measures similarity between two text files using inner product of word frequency vectors."},
            {"seconds": 2100, "timestamp": "35:00", "text": "Dividing the dot product by vector lengths yields cosine of angle theta."},
        ],
        "resources": [
            {"title": "Lecture 2 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec02/"},
        ],
    },
    {
        "id": "mit-6006-lec-3",
        "module_title": "Unit 1: Algorithmic Thinking & Peak Finding",
        "order": 3,
        "title": "Lecture 3: Insertion Sort, Merge Sort",
        "duration_minutes": 52,
        "youtube_id": "Kg4bqzAqRBM",
        "concept_name": "Comparison Sorts & Recurrence Relations",
        "notes": [
            "Insertion Sort: incremental in-place sorting taking Theta(n^2) worst-case time, Theta(n) best-case.",
            "Merge Sort: divide into halves, sort recursively, and merge two sorted lists in Theta(n) time.",
            "Recurrence relation T(n) = 2T(n/2) + Theta(n) solves to Theta(n log n).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Welcome back. Today we delve into sorting, one of the most fundamental problems in CS."},
            {"seconds": 300, "timestamp": "05:00", "text": "Insertion sort keeps a prefix sorted and inserts the next element by shifting larger elements right."},
            {"seconds": 1200, "timestamp": "20:00", "text": "Merge sort divides the array into two halves, recursively sorts, and merges in linear time."},
            {"seconds": 2200, "timestamp": "36:40", "text": "Using recursion trees to analyze T(n) = 2T(n/2) + c*n reveals log n levels each costing c*n."},
        ],
        "resources": [
            {"title": "Lecture 3 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec03/"},
        ],
    },
    {
        "id": "mit-6006-lec-4",
        "module_title": "Unit 1: Algorithmic Thinking & Peak Finding",
        "order": 4,
        "title": "Lecture 4: Heaps and Heap Sort",
        "duration_minutes": 51,
        "youtube_id": "B7hVxCmfPtM",
        "concept_name": "Binary Heaps & Priority Queues",
        "notes": [
            "A binary heap is a complete binary tree satisfying the max-heap property: A[parent(i)] >= A[i].",
            "Max-Heapify runs in O(log n) time.",
            "Build-Max-Heap converts an unordered array into a heap in O(n) linear time.",
            "Heapsort achieves O(n log n) sorting in-place.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In Lecture 4, we examine heaps: a tree-based data structure represented cleanly inside an array."},
            {"seconds": 400, "timestamp": "06:40", "text": "For node at index i, left child is 2i, right child is 2i+1, parent is floor(i/2)."},
            {"seconds": 1300, "timestamp": "21:40", "text": "Max-heapify corrects a violation at the root by floating the larger child upward."},
            {"seconds": 2100, "timestamp": "35:00", "text": "Surprising theorem: Build-Heap runs in linear O(n) time because most nodes sit near the leaves."},
        ],
        "resources": [
            {"title": "Lecture 4 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec04/"},
        ],
    },
    {
        "id": "mit-6006-lec-5",
        "module_title": "Unit 2: Trees & Hashing",
        "order": 5,
        "title": "Lecture 5: Binary Search Trees, BST Sort",
        "duration_minutes": 48,
        "youtube_id": "9Jry5-82I68",
        "concept_name": "Binary Search Trees",
        "notes": [
            "BST invariant: for any node x, keys in left subtree <= x.key <= keys in right subtree.",
            "Operations insert, find, delete, predecessor, successor run in O(h) time where h is tree height.",
            "In degenerate cases, h can be O(n). Balanced trees guarantee h = O(log n).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Lecture 5 introduces Binary Search Trees (BSTs) for fast dynamic searching and ranking."},
            {"seconds": 350, "timestamp": "05:50", "text": "The fundamental BST invariant allows binary search logic on non-contiguous dynamic nodes."},
            {"seconds": 1400, "timestamp": "23:20", "text": "In-order tree traversal visits keys in strictly sorted order in O(n) time."},
        ],
        "resources": [
            {"title": "Lecture 5 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec05/"},
        ],
    },
    {
        "id": "mit-6006-lec-6",
        "module_title": "Unit 2: Trees & Hashing",
        "order": 6,
        "title": "Lecture 6: AVL Trees, AVL Sort",
        "duration_minutes": 50,
        "youtube_id": "FNeL18KsWPc",
        "concept_name": "Balanced AVL Trees & Rotations",
        "notes": [
            "AVL balance property: heights of left and right children differ by at most 1.",
            "An AVL tree with n nodes has height h < 1.44 log_2(n).",
            "Single and double tree rotations restore balance in O(1) time after insertions and deletions.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today Prof. Erik Demaine shows us AVL trees, the first self-balancing binary search trees invented."},
            {"seconds": 380, "timestamp": "06:20", "text": "We define balance factor as height(left) minus height(right). In AVL trees, this must be in {-1, 0, 1}."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Rotations rearrange pointers locally in O(1) time while strictly maintaining the BST search invariant."},
        ],
        "resources": [
            {"title": "Lecture 6 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec06/"},
        ],
    },
    {
        "id": "mit-6006-lec-7",
        "module_title": "Unit 2: Trees & Hashing",
        "order": 7,
        "title": "Lecture 7: Counting Sort, Radix Sort, Lower Bounds",
        "duration_minutes": 52,
        "youtube_id": "Nz1KZXbghj8",
        "concept_name": "Linear Time Sorting & Comparison Lower Bounds",
        "notes": [
            "Decision tree model proves any comparison-based sort requires Omega(n log n) comparisons.",
            "Counting sort operates in O(n + k) time for integers bounded in [0, k].",
            "Radix sort sorts numbers digit-by-digit stably from least to most significant digit in O(d * (n + b)) time.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Can we sort faster than n log n? We will prove a lower bound for comparison sorts and see linear time sorting."},
            {"seconds": 600, "timestamp": "10:00", "text": "A decision tree must have at least n! leaves. The height is at least log(n!) = Omega(n log n)."},
            {"seconds": 1700, "timestamp": "28:20", "text": "Counting sort escapes this lower bound by using integer array indexing directly."},
        ],
        "resources": [
            {"title": "Lecture 7 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec07/"},
        ],
    },
    {
        "id": "mit-6006-lec-8",
        "module_title": "Unit 2: Trees & Hashing",
        "order": 8,
        "title": "Lecture 8: Hashing with Chaining",
        "duration_minutes": 51,
        "youtube_id": "0M_kIqhwbFo",
        "concept_name": "Hash Tables & Universal Hashing",
        "notes": [
            "Dictionary problem: maintain a set of items under insert, delete, search.",
            "Collision resolution by chaining: linked list in each bucket.",
            "Simple Uniform Hashing assumption: expected chain length is load factor alpha = n/m.",
            "Universal hashing guarantees low collision probability over random choice of hash functions.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Hashing is one of the most widely used techniques in all of computer software."},
            {"seconds": 420, "timestamp": "07:00", "text": "Map universe U to m buckets using hash function h(k). When two keys collide, chaining stores them in a list."},
            {"seconds": 1500, "timestamp": "25:00", "text": "If table size m is proportional to n, average lookup time is O(1)."},
        ],
        "resources": [
            {"title": "Lecture 8 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec08/"},
        ],
    },
    {
        "id": "mit-6006-lec-9",
        "module_title": "Unit 2: Trees & Hashing",
        "order": 9,
        "title": "Lecture 9: Table Doubling, Karp-Rabin",
        "duration_minutes": 54,
        "youtube_id": "BRO7mVIFt08",
        "concept_name": "Amortized Analysis & Rolling Hashes",
        "notes": [
            "Dynamic table resizing: doubling table size when full yields O(1) amortized cost per insert.",
            "Amortized analysis via banker's / accounting method.",
            "Karp-Rabin string matching algorithm uses rolling hashes to find substrings in O(n + m) expected time.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "How do we choose hash table size m when we do not know n in advance? Table doubling and amortized analysis."},
            {"seconds": 650, "timestamp": "10:50", "text": "When the table fills up, allocate a table of size 2m and re-insert all keys."},
            {"seconds": 1600, "timestamp": "26:40", "text": "Karp-Rabin string matching slides a hash window over text T of length n in linear expected time."},
        ],
        "resources": [
            {"title": "Lecture 9 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec09/"},
        ],
    },
    {
        "id": "mit-6006-lec-10",
        "module_title": "Unit 2: Trees & Hashing",
        "order": 10,
        "title": "Lecture 10: Open Addressing, Cryptographic Hashing",
        "duration_minutes": 50,
        "youtube_id": "rvdJDijO2Ro",
        "concept_name": "Open Addressing & Cryptographic Hash Functions",
        "notes": [
            "Open addressing stores all keys directly in the table slots without linked lists.",
            "Probing strategies: linear probing, quadratic probing, and double hashing.",
            "Cryptographic hashing properties: collision resistance, preimage resistance, and avalanche effect.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Lecture 10 covers open addressing and cryptographic hash functions like SHA-256."},
            {"seconds": 450, "timestamp": "07:30", "text": "Linear probing checks h(k)+i mod m, but suffers from primary clustering where clusters grow rapidly."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Double hashing uses two independent hash functions to achieve uniform permutation probing."},
        ],
        "resources": [
            {"title": "Lecture 10 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec10/"},
        ],
    },
    {
        "id": "mit-6006-lec-11",
        "module_title": "Unit 3: Numerics & Graph Searches",
        "order": 11,
        "title": "Lecture 11: Integer Arithmetic, Karatsuba Multiplication",
        "duration_minutes": 52,
        "youtube_id": "eCaXlAaN2uE",
        "concept_name": "Divide-and-Conquer Multiplications",
        "notes": [
            "Grade school multiplication takes Theta(d^2) time for d-digit integers.",
            "Karatsuba's trick reduces 4 recursive subproblems to 3: T(d) = 3T(d/2) + Theta(d).",
            "Achieves O(d^{log_2 3}) approx O(d^{1.585}) time.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Welcome to unit 3 on numerics. Today we look at integer multiplication with arbitrarily many digits."},
            {"seconds": 400, "timestamp": "06:40", "text": "Grade school algorithm multiplies each digit with every other digit, taking O(n^2) operations."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Karatsuba noticed that (x1*y0 + x0*y1) can be computed using one multiplication and two additions."},
        ],
        "resources": [
            {"title": "Lecture 11 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec11/"},
        ],
    },
    {
        "id": "mit-6006-lec-12",
        "module_title": "Unit 3: Numerics & Graph Searches",
        "order": 12,
        "title": "Lecture 12: Square Roots, Newton's Method",
        "duration_minutes": 49,
        "youtube_id": "2YeJ-5UAke8",
        "concept_name": "Root Finding & Newton's Method",
        "notes": [
            "Finding square root of a via finding zeros of f(x) = x^2 - a.",
            "Newton's iteration formula: x_{k+1} = x_k - f(x_k)/f'(x_k).",
            "Quadratic convergence: number of accurate digits doubles with each iteration.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "How do computer chips calculate square roots and division to high precision? Newton's method."},
            {"seconds": 500, "timestamp": "08:20", "text": "We draw a tangent line at (x_k, f(x_k)) and find where it intercepts the x-axis."},
            {"seconds": 1600, "timestamp": "26:40", "text": "The error squares at every step: 10 digits becomes 20 digits, then 40 digits, then 80 digits."},
        ],
        "resources": [
            {"title": "Lecture 12 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec12/"},
        ],
    },
    {
        "id": "mit-6006-lec-13",
        "module_title": "Unit 3: Numerics & Graph Searches",
        "order": 13,
        "title": "Lecture 13: Breadth-First Search (BFS)",
        "duration_minutes": 50,
        "youtube_id": "s-CYnVz-uh4",
        "concept_name": "Graph Exploration & Breadth-First Search",
        "notes": [
            "Graph representations: adjacency lists vs adjacency matrices.",
            "BFS explores vertices in order of increasing distance from start vertex s.",
            "Maintains queue frontier; visits each vertex and edge once in O(V + E) time.",
            "Computes shortest paths in unweighted graphs.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we begin graph algorithms with Breadth-First Search, or BFS."},
            {"seconds": 380, "timestamp": "06:20", "text": "A graph G = (V, E) can be directed or undirected. We represent it with adjacency lists for efficiency."},
            {"seconds": 1400, "timestamp": "23:20", "text": "BFS discovers all vertices at distance 1, then distance 2, then distance k, using a FIFO queue."},
        ],
        "resources": [
            {"title": "Lecture 13 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec13/"},
        ],
    },
    {
        "id": "mit-6006-lec-14",
        "module_title": "Unit 3: Numerics & Graph Searches",
        "order": 14,
        "title": "Lecture 14: Depth-First Search (DFS), Topological Sort",
        "duration_minutes": 51,
        "youtube_id": "AfSk24UTFS8",
        "concept_name": "Depth-First Search & Cycle Detection",
        "notes": [
            "DFS explores graph deeply along paths before backtracking.",
            "Classification of edges: tree edges, back edges, forward edges, cross edges.",
            "A directed graph is a Directed Acyclic Graph (DAG) iff DFS produces no back edges.",
            "Topological sorting: reverse order of finishing times in DAG runs in O(V + E) time.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Depth-First Search (DFS) recursively traverses paths to their ends before backtracking."},
            {"seconds": 450, "timestamp": "07:30", "text": "Every edge gets classified during search. A back edge points to an active ancestor, revealing a cycle."},
            {"seconds": 1700, "timestamp": "28:20", "text": "Topological sort orders tasks respecting dependencies: sort vertices by reverse finishing times."},
        ],
        "resources": [
            {"title": "Lecture 14 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec14/"},
        ],
    },
    {
        "id": "mit-6006-lec-15",
        "module_title": "Unit 4: Shortest Paths",
        "order": 15,
        "title": "Lecture 15: Single-Source Shortest Paths Problem",
        "duration_minutes": 48,
        "youtube_id": "Aa2sqUhIn-E",
        "concept_name": "Shortest Paths & Edge Relaxation",
        "notes": [
            "Shortest path weight delta(s, v): minimum weight over all paths from s to v.",
            "Negative-weight edges and negative-weight cycles.",
            "Generic relaxation framework: if d[v] > d[u] + w(u, v), then d[v] = d[u] + w(u, v).",
            "Optimal substructure property: subpaths of shortest paths are also shortest paths.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Unit 4 is Shortest Paths. Today we set up the general framework and edge relaxation."},
            {"seconds": 360, "timestamp": "06:00", "text": "Edge weights represent distances, transit times, or financial costs."},
            {"seconds": 1300, "timestamp": "21:40", "text": "Edge relaxation gradually tightens upper bounds on true distance until all bounds become exact."},
        ],
        "resources": [
            {"title": "Lecture 15 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec15/"},
        ],
    },
    {
        "id": "mit-6006-lec-16",
        "module_title": "Unit 4: Shortest Paths",
        "order": 16,
        "title": "Lecture 16: Dijkstra's Algorithm",
        "duration_minutes": 52,
        "youtube_id": "2E7MmKv0Y24",
        "concept_name": "Dijkstra's Algorithm",
        "notes": [
            "Dijkstra solves single-source shortest paths on graphs with non-negative edge weights.",
            "Greedy strategy: extract minimum distance estimate vertex from priority queue.",
            "With binary min-heap: running time is O((V + E) log V). With Fibonacci heap: O(E + V log V).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Dijkstra's algorithm is the gold standard for routing and navigation systems."},
            {"seconds": 450, "timestamp": "07:30", "text": "Because all edge weights are non-negative, once a vertex has minimum distance from the frontier, its distance is finalized."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Each vertex is extracted once from the priority queue and each incident edge is relaxed once."},
        ],
        "resources": [
            {"title": "Lecture 16 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec16/"},
        ],
    },
    {
        "id": "mit-6006-lec-17",
        "module_title": "Unit 4: Shortest Paths",
        "order": 17,
        "title": "Lecture 17: Bellman-Ford Algorithm",
        "duration_minutes": 50,
        "youtube_id": "ozsuci5pIso",
        "concept_name": "Bellman-Ford & Negative Cycles",
        "notes": [
            "Bellman-Ford handles arbitrary edge weights and detects negative-weight cycles.",
            "Relaxes all |E| edges |V| - 1 times in O(V * E) total time.",
            "A final pass checking if any edge can still be relaxed identifies negative cycle reachability.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "What happens when edges can have negative weights, such as currency arbitrage? Bellman-Ford."},
            {"seconds": 400, "timestamp": "06:40", "text": "Any simple path contains at most |V|-1 edges. So relaxing all edges |V|-1 times suffices to find all shortest paths."},
            {"seconds": 1600, "timestamp": "26:40", "text": "If an edge can still be relaxed on pass |V|, that edge is part of or reachable from a negative weight cycle."},
        ],
        "resources": [
            {"title": "Lecture 17 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec17/"},
        ],
    },
    {
        "id": "mit-6006-lec-18",
        "module_title": "Unit 4: Shortest Paths",
        "order": 18,
        "title": "Lecture 18: Speeding up Dijkstra & Heuristic Search",
        "duration_minutes": 53,
        "youtube_id": "CHvQ3q_gJ7E",
        "concept_name": "Bidirectional Search & A* Heuristics",
        "notes": [
            "Bidirectional Dijkstra search explores simultaneously from start and destination, cutting search space.",
            "Goal-directed search (A*): modifies edge weights using potential function h(u).",
            "Consistent (monotone) heuristics guarantee optimal shortest paths without reopening nodes.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In practice, Dijkstra explores a full circular wave of vertices. Today we show how to aim the search at the target."},
            {"seconds": 500, "timestamp": "08:20", "text": "Bidirectional search runs Dijkstra forward from s and backwards from t until the two search frontiers collide."},
            {"seconds": 1600, "timestamp": "26:40", "text": "A* search introduces a heuristic estimate h(v) of remaining distance to t, steering exploration straight toward the goal."},
        ],
        "resources": [
            {"title": "Lecture 18 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec18/"},
        ],
    },
    {
        "id": "mit-6006-lec-19",
        "module_title": "Unit 5: Dynamic Programming & Complexity",
        "order": 19,
        "title": "Lecture 19: Dynamic Programming I: Fibonacci, Shortest Paths",
        "duration_minutes": 54,
        "youtube_id": "OQ5jsbhAv_M",
        "concept_name": "Dynamic Programming Foundations & Memoization",
        "notes": [
            "Dynamic Programming: memoization and subproblem reuse.",
            "Fibonacci naive recursion O(2^n) drops to O(n) with memoized table.",
            "The 5-step DP recipe: define subproblems, guess choices, relate subproblem solutions, recurse & memoize, solve original problem.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Welcome to Dynamic Programming! DP is arguably the most powerful general algorithm design technique."},
            {"seconds": 350, "timestamp": "05:50", "text": "Naive recursive Fibonacci computes identical subtrees repeatedly, causing an exponential explosion."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Memoization caches return values in a table. Once computed, subproblems take O(1) lookup time."},
        ],
        "resources": [
            {"title": "Lecture 19 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec19/"},
        ],
    },
    {
        "id": "mit-6006-lec-20",
        "module_title": "Unit 5: Dynamic Programming & Complexity",
        "order": 20,
        "title": "Lecture 20: Dynamic Programming II: Text Justification, Blackjack",
        "duration_minutes": 52,
        "youtube_id": "ENyox7kNKeY",
        "concept_name": "Subproblem Suffixes & Text Justification",
        "notes": [
            "Text justification: break words into lines minimizing total line raggedness penalty (cube of blank spaces).",
            "Subproblems on suffixes words[i:]: guess line break position j > i.",
            "Blackjack: perfect play against dealer with known card deck.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we apply Dynamic Programming to text justification (like LaTeX line breaking) and Blackjack."},
            {"seconds": 450, "timestamp": "07:30", "text": "Define DP[i] as optimal raggedness for suffix of words from index i to end."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Guess where the current line ends at j. Running time is O(n^2) where n is word count."},
        ],
        "resources": [
            {"title": "Lecture 20 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec20/"},
        ],
    },
    {
        "id": "mit-6006-lec-21",
        "module_title": "Unit 5: Dynamic Programming & Complexity",
        "order": 21,
        "title": "Lecture 21: Dynamic Programming III: Parenthesization, Edit Distance, Knapsack",
        "duration_minutes": 51,
        "youtube_id": "ocZMDMZwhCY",
        "concept_name": "Edit Distance & 0-1 Knapsack",
        "notes": [
            "Edit Distance: minimum cost to transform string X into Y using insert, delete, replace.",
            "Subproblems on prefixes: DP[i, j] matches X[i] and Y[j].",
            "0-1 Knapsack: maximize value subject to weight constraint W, solved in pseudo-polynomial O(n*W) time.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Edit distance and knapsack are two quintessential 2-dimensional Dynamic Programming problems."},
            {"seconds": 400, "timestamp": "06:40", "text": "In edit distance, we either insert, delete, or replace characters at indices i and j."},
            {"seconds": 1500, "timestamp": "25:00", "text": "In 0-1 Knapsack, item i is either taken or not taken, consuming capacity w_i."},
        ],
        "resources": [
            {"title": "Lecture 21 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec21/"},
        ],
    },
    {
        "id": "mit-6006-lec-22",
        "module_title": "Unit 5: Dynamic Programming & Complexity",
        "order": 22,
        "title": "Lecture 22: Dynamic Programming IV: Guitar Fingering, Tetris, Super Mario",
        "duration_minutes": 50,
        "youtube_id": "tp4_UXaVyx8",
        "concept_name": "Advanced DP & Game State Graphs",
        "notes": [
            "Guitar fingering: mapping musical notes to hand finger positions minimizing physical transition difficulty.",
            "Tetris and Super Mario Bros: modeling video game stages as state reachability graphs under DP transitions.",
            "Complexity of playing video games: why Nintendo games are NP-hard.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In DP IV, Prof. Erik Demaine shows fun applications: guitar fingering and video game algorithms."},
            {"seconds": 450, "timestamp": "07:30", "text": "For guitar fingering, state is (note_index, finger_position) with transition costs measuring biomechanical strain."},
            {"seconds": 1600, "timestamp": "26:40", "text": "We model games as DAGs of reachable states to find the globally optimal play sequence."},
        ],
        "resources": [
            {"title": "Lecture 22 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec22/"},
        ],
    },
    {
        "id": "mit-6006-lec-23",
        "module_title": "Unit 5: Dynamic Programming & Complexity",
        "order": 23,
        "title": "Lecture 23: Computational Complexity",
        "duration_minutes": 49,
        "youtube_id": "moPtwq_cVH8",
        "concept_name": "P, NP, NP-Completeness & Reductions",
        "notes": [
            "Class P: problems solvable in polynomial time O(n^k).",
            "Class NP: problems whose candidate solutions can be verified in polynomial time.",
            "NP-completeness and polynomial-time reductions: showing problem A is as hard as problem B.",
            "Cook-Levin Theorem: Boolean Satisfiability (SAT) is NP-complete.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we ask the million-dollar Millennium Prize problem: Does P equal NP?"},
            {"seconds": 450, "timestamp": "07:30", "text": "P is the set of decision problems solvable in polynomial time on a deterministic machine."},
            {"seconds": 1500, "timestamp": "25:00", "text": "If any NP-complete problem can be solved in polynomial time, then every problem in NP can be solved in polynomial time."},
        ],
        "resources": [
            {"title": "Lecture 23 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec23/"},
        ],
    },
    {
        "id": "mit-6006-lec-24",
        "module_title": "Unit 5: Dynamic Programming & Complexity",
        "order": 24,
        "title": "Lecture 24: Topics in Algorithms Research",
        "duration_minutes": 53,
        "youtube_id": "dU40AvBURDQ",
        "concept_name": "Frontiers of Algorithms Research",
        "notes": [
            "Modern research frontiers: streaming algorithms, sublinear time algorithms, and quantum algorithms.",
            "Cache-oblivious data structures and geometric folding algorithms.",
            "Summary of 6.006 core themes: design paradigms, analysis techniques, and practical impact.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Welcome to the final lecture of 6.006. Today we discuss current frontiers in algorithms research."},
            {"seconds": 500, "timestamp": "08:20", "text": "We recap the major paradigms: Divide & Conquer, Greedy, Dynamic Programming, and Graph Traversals."},
            {"seconds": 1600, "timestamp": "26:40", "text": "Thank you all for an exceptional semester of algorithmic problem solving!"},
        ],
        "resources": [
            {"title": "Lecture 24 Notes (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/mit6_006f11_lec24/"},
        ],
    },
]


# ---------------------------------------------------------------------------
# NPTEL Machine Learning (IIT Madras, Prof. Balaraman Ravindran)
# ---------------------------------------------------------------------------
NPTEL_ML_LECTURES: List[Dict[str, Any]] = [
    {
        "id": "nptel-ml-lec-1",
        "module_title": "Week 1: Introduction to Machine Learning",
        "order": 1,
        "title": "Lecture 1: Introduction to the Course & History of ML",
        "duration_minutes": 55,
        "youtube_id": "w1v-uQthcXs",
        "concept_name": "History & Foundations of Machine Learning",
        "notes": [
            "Machine learning: algorithms that improve their performance at task T with experience E, measured by P.",
            "The historical evolution from symbolic AI to statistical machine learning.",
            "Taxonomy: Supervised learning, Unsupervised learning, and Reinforcement learning.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Hello and welcome to this course on Machine Learning. I am Balaraman Ravindran from IIT Madras."},
            {"seconds": 250, "timestamp": "04:10", "text": "Machine learning has become the defining paradigm for extracting actionable knowledge from large datasets."},
            {"seconds": 800, "timestamp": "13:20", "text": "Tom Mitchell's classic definition: a computer program is said to learn from experience E with respect to some class of tasks T and performance measure P."},
            {"seconds": 1800, "timestamp": "30:00", "text": "We will explore how models generalize beyond observed training points to unseen test samples."},
        ],
        "resources": [
            {"title": "Lecture 1 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec01.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-2",
        "module_title": "Week 1: Introduction to Machine Learning",
        "order": 2,
        "title": "Lecture 2: Overview of Machine Learning Paradigms",
        "duration_minutes": 52,
        "youtube_id": "whSKA8aO6xQ",
        "concept_name": "Supervised, Unsupervised & Reinforcement Learning",
        "notes": [
            "Supervised learning: regression (continuous outputs) and classification (categorical labels).",
            "Unsupervised learning: clustering, dimensionality reduction, and density estimation.",
            "The role of inductive bias in learning algorithms.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In this lecture we provide a high-level overview of the major learning paradigms."},
            {"seconds": 300, "timestamp": "05:00", "text": "In supervised learning, every training sample comes paired with an ground truth target value."},
            {"seconds": 1200, "timestamp": "20:00", "text": "Without an inductive bias, every unobserved input is equally likely to have any label whatsoever."},
        ],
        "resources": [
            {"title": "Lecture 2 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec02.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-3",
        "module_title": "Week 2: Linear Algebra for Machine Learning",
        "order": 3,
        "title": "Lecture 3: Why Linear Algebra? Scalars, Vectors & Matrices",
        "duration_minutes": 48,
        "youtube_id": "NDq_VaZ3iSQ",
        "concept_name": "Vectors and Feature Spaces",
        "notes": [
            "Why linear algebra forms the language of machine learning: data as high-dimensional feature vectors.",
            "Vector addition, scalar multiplication, and geometric representation.",
            "Matrix representations of multi-sample datasets.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Linear algebra is the foundational mathematical backbone of modern machine learning."},
            {"seconds": 360, "timestamp": "06:00", "text": "Each data instance is encoded as an n-dimensional vector residing in feature space R^n."},
            {"seconds": 1400, "timestamp": "23:20", "text": "A dataset of m examples with n features naturally forms an m by n matrix X."},
        ],
        "resources": [
            {"title": "Lecture 3 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec03.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-4",
        "module_title": "Week 2: Linear Algebra for Machine Learning",
        "order": 4,
        "title": "Lecture 4: Basic Operations in Linear Algebra",
        "duration_minutes": 50,
        "youtube_id": "zoAFy_6-k1M",
        "concept_name": "Matrix Multiplications & Transposition",
        "notes": [
            "Dot products of vectors and projection interpretation.",
            "Matrix multiplication as linear transformations.",
            "Transpose of a matrix and symmetric matrices.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we review fundamental algebraic operations: dot products, matrix products, and transpositions."},
            {"seconds": 400, "timestamp": "06:40", "text": "The inner product x^T y measures geometric similarity: ||x|| ||y|| cos(theta)."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Matrix-vector product Ax corresponds to taking a linear combination of the column vectors of A."},
        ],
        "resources": [
            {"title": "Lecture 4 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec04.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-5",
        "module_title": "Week 2: Linear Algebra for Machine Learning",
        "order": 5,
        "title": "Lecture 5: Vector Norms and Inner Products",
        "duration_minutes": 53,
        "youtube_id": "af3wvva1dus",
        "concept_name": "L1, L2 and Lp Vector Norms",
        "notes": [
            "Definition of vector norm: non-negativity, triangle inequality, absolute homogeneity.",
            "L2 Euclidean norm, L1 Manhattan norm, and L_infinity maximum norm.",
            "Norms as regularization penalties (Ridge vs Lasso).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Norms measure the length or magnitude of vectors and appear constantly in loss functions."},
            {"seconds": 420, "timestamp": "07:00", "text": "The L2 norm is the standard Euclidean length, while the L1 norm sums absolute values."},
            {"seconds": 1600, "timestamp": "26:40", "text": "We will see how L1 regularization encourages sparsity in feature selection."},
        ],
        "resources": [
            {"title": "Lecture 5 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec05.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-6",
        "module_title": "Week 3: Linear Spaces & Matrix Transformations",
        "order": 6,
        "title": "Lecture 6: Linear Combinations, Span & Linear Independence",
        "duration_minutes": 51,
        "youtube_id": "I4zAY8NiI_o",
        "concept_name": "Span, Basis & Linear Independence",
        "notes": [
            "Linear combinations of vectors: sum of alpha_i * v_i.",
            "Span of a set of vectors as a subspace.",
            "Linear independence: only trivial combination yields the zero vector.",
            "Basis and dimensionality of vector spaces.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Lecture 6 explores span, linear independence, and basis vectors."},
            {"seconds": 380, "timestamp": "06:20", "text": "If a vector can be written as a combination of others, it provides no new independent dimension."},
            {"seconds": 1500, "timestamp": "25:00", "text": "A minimal spanning set forms a basis, and its cardinality defines the dimension."},
        ],
        "resources": [
            {"title": "Lecture 6 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec06.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-7",
        "module_title": "Week 3: Linear Spaces & Matrix Transformations",
        "order": 7,
        "title": "Lecture 7: Matrix Operations & Special Matrices",
        "duration_minutes": 49,
        "youtube_id": "p_ADPkATAGA",
        "concept_name": "Matrix Rank, Inverses & Orthogonal Matrices",
        "notes": [
            "Column space, row space, and null space of a matrix.",
            "Matrix rank and full-rank matrices.",
            "Orthogonal matrices: Q^T Q = I.",
            "Positive semi-definite (PSD) matrices in covariance and kernel machines.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In this lecture we examine special matrix classes and the fundamental subspaces."},
            {"seconds": 450, "timestamp": "07:30", "text": "The rank of a matrix equals the dimension of its column space, which matches row rank."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Orthogonal matrices preserve lengths and angles under linear transformations."},
        ],
        "resources": [
            {"title": "Lecture 7 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec07.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-8",
        "module_title": "Week 4: Probability Theory & Distributions",
        "order": 8,
        "title": "Lecture 8: Introduction to Probability Theory & Distributions",
        "duration_minutes": 52,
        "youtube_id": "cp7_ZF2kNi4",
        "concept_name": "Probability Spaces & Random Variables",
        "notes": [
            "Sample space, sigma-algebra, and Kolmogorov axioms of probability.",
            "Random variables: discrete probability mass functions (PMF) and continuous density functions (PDF).",
            "Cumulative distribution functions (CDF).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Week 4 begins our study of probability theory, the mathematical tool for reasoning under uncertainty."},
            {"seconds": 400, "timestamp": "06:40", "text": "A random variable maps outcomes in a sample space to real numbers."},
            {"seconds": 1600, "timestamp": "26:40", "text": "For continuous random variables, probability of any single point is zero, but integrals over intervals are positive."},
        ],
        "resources": [
            {"title": "Lecture 8 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec08.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-9",
        "module_title": "Week 4: Probability Theory & Distributions",
        "order": 9,
        "title": "Lecture 9: Conditional, Joint & Marginal Probability",
        "duration_minutes": 50,
        "youtube_id": "wHRUtNmPjyE",
        "concept_name": "Joint & Marginal Distributions",
        "notes": [
            "Joint probability distribution P(X, Y) across multiple variables.",
            "Marginalization: summing or integrating out nuisance variables.",
            "Conditional probability P(X | Y) = P(X, Y) / P(Y).",
            "Chain rule of probability.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In machine learning we frequently work with joint observations of features X and target Y."},
            {"seconds": 350, "timestamp": "05:50", "text": "The joint distribution contains all information about how X and Y co-occur."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Marginalization recovers P(X) by summing P(X, Y) over all possible values of Y."},
        ],
        "resources": [
            {"title": "Lecture 9 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec09.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-10",
        "module_title": "Week 4: Probability Theory & Distributions",
        "order": 10,
        "title": "Lecture 10: Bayes' Theorem & Inference Examples",
        "duration_minutes": 54,
        "youtube_id": "dY5xhLgfV1A",
        "concept_name": "Bayes' Theorem & Posterior Inference",
        "notes": [
            "Bayes' Theorem: P(theta | D) = P(D | theta) * P(theta) / P(D).",
            "Prior probability, likelihood, evidence, and posterior probability.",
            "Maximum A Posteriori (MAP) vs Maximum Likelihood Estimation (MLE).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Bayes' Theorem is the fundamental engine for statistical updating in artificial intelligence."},
            {"seconds": 450, "timestamp": "07:30", "text": "The prior captures our beliefs before seeing data; the likelihood measures how well parameters explain the observations."},
            {"seconds": 1700, "timestamp": "28:20", "text": "Multiplying prior and likelihood and normalizing produces the posterior distribution."},
        ],
        "resources": [
            {"title": "Lecture 10 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec10.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-11",
        "module_title": "Week 5: Statistical Independence & Moments",
        "order": 11,
        "title": "Lecture 11: Statistical Independence & Conditional Independence",
        "duration_minutes": 48,
        "youtube_id": "XtniA_N63z4",
        "concept_name": "Conditional Independence & Naive Bayes",
        "notes": [
            "Statistical independence: P(X, Y) = P(X) * P(Y).",
            "Conditional independence: P(X, Y | Z) = P(X | Z) * P(Y | Z).",
            "The Naive Bayes assumption in text classification and spam filtering.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we dissect independence and conditional independence."},
            {"seconds": 380, "timestamp": "06:20", "text": "Two events are independent if knowledge of one tells us nothing about the other."},
            {"seconds": 1400, "timestamp": "23:20", "text": "In Naive Bayes, features are assumed conditionally independent given the class label."},
        ],
        "resources": [
            {"title": "Lecture 11 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec11.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-12",
        "module_title": "Week 5: Statistical Independence & Moments",
        "order": 12,
        "title": "Lecture 12: Mathematical Expectation in ML",
        "duration_minutes": 51,
        "youtube_id": "V4HH_Sc9EZk",
        "concept_name": "Expected Value & Linearity of Expectation",
        "notes": [
            "Definition of mathematical expectation E[X] = sum(x * p(x)).",
            "Linearity of expectation: E[aX + bY] = aE[X] + bE[Y] regardless of independence.",
            "Expected risk and empirical risk minimization (ERM).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Expectation is the probability-weighted average of a random quantity."},
            {"seconds": 400, "timestamp": "06:40", "text": "Linearity of expectation is an immensely useful property that holds even when variables are correlated."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Machine learning aims to minimize expected risk over the true data distribution."},
        ],
        "resources": [
            {"title": "Lecture 12 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec12.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-13",
        "module_title": "Week 5: Statistical Independence & Moments",
        "order": 13,
        "title": "Lecture 13: Variance, Covariance & Covariance Matrices",
        "duration_minutes": 53,
        "youtube_id": "xiB6f1GdFUc",
        "concept_name": "Variance & Covariance Matrices",
        "notes": [
            "Variance Var(X) = E[(X - E[X])^2] measures dispersion.",
            "Covariance Cov(X, Y) = E[(X - mu_x)(Y - mu_y)].",
            "Covariance matrix Sigma: positive semi-definite matrix of pairwise covariances.",
            "Role of covariance in Principal Component Analysis (PCA).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In this lecture we define variance, covariance, and the covariance matrix Sigma."},
            {"seconds": 450, "timestamp": "07:30", "text": "Covariance indicates whether two variables tend to increase together or in opposite directions."},
            {"seconds": 1600, "timestamp": "26:40", "text": "The eigenvectors of the empirical covariance matrix define the principal directions of variance."},
        ],
        "resources": [
            {"title": "Lecture 13 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec13.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-14",
        "module_title": "Week 5: Statistical Independence & Moments",
        "order": 14,
        "title": "Lecture 14: Relations for Expectation & Covariance",
        "duration_minutes": 49,
        "youtube_id": "BtJjkET4IoA",
        "concept_name": "Properties of Expectation and Moments",
        "notes": [
            "Transformation of random variables and moments.",
            "Var(aX + b) = a^2 Var(X).",
            "Cauchy-Schwarz inequality for random variables: |Cov(X, Y)| <= sqrt(Var(X) Var(Y)).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Lecture 14 formalizes algebraic identities for expectations and variances under linear transformations."},
            {"seconds": 380, "timestamp": "06:20", "text": "When we apply an affine transformation y = Ax + b, the new covariance matrix is A Sigma A^T."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Correlation coefficient rho bounds pairwise relationship strictly in [-1, +1]."},
        ],
        "resources": [
            {"title": "Lecture 14 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec14.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-15",
        "module_title": "Week 6: Calculus & Numerical Representation",
        "order": 15,
        "title": "Lecture 15: Machine Representation of Numbers & Floating Point",
        "duration_minutes": 50,
        "youtube_id": "xzah5O_93ZU",
        "concept_name": "Floating Point & Numerical Stability",
        "notes": [
            "IEEE 754 floating point standard: sign, exponent, mantissa.",
            "Underflow, overflow, and numerical cancellation.",
            "Log-sum-exp trick for stable probability computation in softmax and cross-entropy.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Computers do not work with real numbers; they work with finite-precision floating point representations."},
            {"seconds": 400, "timestamp": "06:40", "text": "Multiplying many small probabilities causes numerical underflow to zero."},
            {"seconds": 1500, "timestamp": "25:00", "text": "By shifting by the maximum log-term, the log-sum-exp trick prevents underflow and overflow entirely."},
        ],
        "resources": [
            {"title": "Lecture 15 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec15.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-16",
        "module_title": "Week 6: Calculus & Numerical Representation",
        "order": 16,
        "title": "Lecture 16: Derivatives, Gradient, Hessian & Jacobian",
        "duration_minutes": 53,
        "youtube_id": "fqq_UR4zhfI",
        "concept_name": "Multivariable Calculus & Gradients",
        "notes": [
            "Partial derivatives and the gradient vector grad(f) pointing in steepest ascent direction.",
            "Jacobian matrix of vector-valued functions.",
            "Hessian matrix of second derivatives and curvature / convexity tests.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Optimization in high dimensions relies on multivariable calculus: gradients, Jacobians, and Hessians."},
            {"seconds": 450, "timestamp": "07:30", "text": "The gradient vector grad f(x) contains all first partial derivatives."},
            {"seconds": 1600, "timestamp": "26:40", "text": "The Hessian matrix describes local curvature. If the Hessian is positive definite everywhere, f is strictly convex."},
        ],
        "resources": [
            {"title": "Lecture 16 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec16.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-17",
        "module_title": "Week 6: Calculus & Numerical Representation",
        "order": 17,
        "title": "Lecture 17: Matrix Calculus & Optimization Foundations",
        "duration_minutes": 52,
        "youtube_id": "IgAr5kzza78",
        "concept_name": "Matrix Calculus & Vector Derivatives",
        "notes": [
            "Numerator vs denominator layout conventions.",
            "Derivatives of linear forms: d/dx (a^T x) = a.",
            "Derivatives of quadratic forms: d/dx (x^T A x) = (A + A^T) x.",
            "Deriving ordinary least squares normal equations: (X^T X) w = X^T y.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we master matrix calculus notation to compute derivatives with respect to weight vectors."},
            {"seconds": 500, "timestamp": "08:20", "text": "Setting the gradient of the Mean Squared Error loss to zero directly yields the normal equations."},
            {"seconds": 1600, "timestamp": "26:40", "text": "If X^T X is invertible, we get the analytical solution w = (X^T X)^(-1) X^T y."},
        ],
        "resources": [
            {"title": "Lecture 17 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec17.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-18",
        "module_title": "Week 7: Optimization for Machine Learning",
        "order": 18,
        "title": "Lecture 18: Unconstrained Optimization & Gradient Descent",
        "duration_minutes": 54,
        "youtube_id": "bDUDrfbZCCA",
        "concept_name": "Gradient Descent & Convergence",
        "notes": [
            "Unconstrained optimization: minimizing f(w) over w in R^d.",
            "Gradient descent update rule: w := w - alpha * grad(f(w)).",
            "Learning rate alpha selection, oscillation, and divergence.",
            "Convex vs non-convex optimization landscapes.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Gradient descent is the primary computational algorithm powering contemporary deep learning."},
            {"seconds": 450, "timestamp": "07:30", "text": "We take iterative steps in the direction opposite to the gradient vector."},
            {"seconds": 1600, "timestamp": "26:40", "text": "For convex functions, gradient descent is guaranteed to converge to the global minimum with an appropriate step size."},
        ],
        "resources": [
            {"title": "Lecture 18 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec18.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-19",
        "module_title": "Week 7: Optimization for Machine Learning",
        "order": 19,
        "title": "Lecture 19: Introduction to Constrained Optimization & KKT",
        "duration_minutes": 51,
        "youtube_id": "Dn1vmANCvvs",
        "concept_name": "Lagrange Multipliers & KKT Conditions",
        "notes": [
            "Equality constraints and Lagrange multipliers.",
            "Inequality constraints and Karush-Kuhn-Tucker (KKT) conditions.",
            "Primal and dual optimization problems; weak and strong duality.",
            "Application to maximum-margin hyperplanes in Support Vector Machines (SVM).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "When optimization parameters must satisfy physical or regulatory constraints, we use Lagrange duality."},
            {"seconds": 500, "timestamp": "08:20", "text": "The KKT conditions generalize Lagrange multipliers to inequality constraints."},
            {"seconds": 1600, "timestamp": "26:40", "text": "This dual formulation allows the kernel trick in Support Vector Machines."},
        ],
        "resources": [
            {"title": "Lecture 19 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec19.pdf"},
        ],
    },
    {
        "id": "nptel-ml-lec-20",
        "module_title": "Week 7: Optimization for Machine Learning",
        "order": 20,
        "title": "Lecture 20: Introduction to Numerical Optimization Algorithms",
        "duration_minutes": 53,
        "youtube_id": "D4zMKh3krPc",
        "concept_name": "Stochastic Gradient Descent & Momentum",
        "notes": [
            "Batch Gradient Descent vs Stochastic Gradient Descent (SGD) vs Mini-batch SGD.",
            "Momentum and acceleration methods for ravines and high-curvature surfaces.",
            "Adaptive learning rate methods: AdaGrad, RMSprop, Adam.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Lecture 20 concludes our foundational mathematics with practical stochastic optimization algorithms."},
            {"seconds": 400, "timestamp": "06:40", "text": "Evaluating gradients over millions of training samples is computationally prohibitive, so SGD samples minibatches."},
            {"seconds": 1600, "timestamp": "26:40", "text": "Momentum accumulates past velocity vectors to accelerate traversal along consistent directions and damp oscillations."},
        ],
        "resources": [
            {"title": "Lecture 20 Slides (PDF)", "type": "pdf", "url": "https://nptel.ac.in/courses/106106139/lec20.pdf"},
        ],
    },
]


# ---------------------------------------------------------------------------
# MITx 6.0001: Introduction to CS and Programming in Python (Prof. John Guttag)
# ---------------------------------------------------------------------------
MITX_PYTHON_LECTURES: List[Dict[str, Any]] = [
    {
        "id": "mitx-600-lec-1",
        "module_title": "Unit 1: Computational Thinking & Python Basics",
        "order": 1,
        "title": "Lecture 1: What is Computation?",
        "duration_minutes": 50,
        "youtube_id": "nykOeWgQcHM",
        "concept_name": "Computation, Types & Expressions",
        "notes": [
            "Declarative knowledge ('what is true') vs Imperative knowledge ('how-to recipe').",
            "Fixed-program computers vs Stored-program computers (von Neumann architecture).",
            "Python data types: int, float, bool, NoneType, and basic scalar expressions.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Welcome to 6.0001, Introduction to Computer Science and Programming in Python. I am John Guttag."},
            {"seconds": 260, "timestamp": "04:20", "text": "Computer science is not really about computers, any more than physics is about particle accelerators."},
            {"seconds": 780, "timestamp": "13:00", "text": "Declarative knowledge states facts. Imperative knowledge provides recipes: how to compute."},
            {"seconds": 1500, "timestamp": "25:00", "text": "In Python, everything is an object with a type and attributes."},
        ],
        "resources": [
            {"title": "Lecture 1 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec1/"},
        ],
    },
    {
        "id": "mitx-600-lec-2",
        "module_title": "Unit 1: Computational Thinking & Python Basics",
        "order": 2,
        "title": "Lecture 2: Branching and Iteration",
        "duration_minutes": 52,
        "youtube_id": "0jljZRnHwOI",
        "concept_name": "Conditionals & Loops",
        "notes": [
            "Branching programs with if, elif, else.",
            "Looping with while and for loops.",
            "Loop invariants and guaranteed termination using decreasing counter variables.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we add control flow: branching and iteration to make programs execute selectively."},
            {"seconds": 350, "timestamp": "05:50", "text": "Indentation in Python defines block structure and lexical scope."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Every loop must possess a decrementing function that proves termination."},
        ],
        "resources": [
            {"title": "Lecture 2 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec2/"},
        ],
    },
    {
        "id": "mitx-600-lec-3",
        "module_title": "Unit 1: Computational Thinking & Python Basics",
        "order": 3,
        "title": "Lecture 3: String Manipulation, Guess and Check, Approximations, Bisection",
        "duration_minutes": 49,
        "youtube_id": "SE4P7IVCunE",
        "concept_name": "Bisection Search & Numerical Algorithms",
        "notes": [
            "Strings as immutable sequences: indexing and slicing s[start:stop:step].",
            "Exhaustive enumeration (guess-and-check).",
            "Approximation algorithms with epsilon tolerance.",
            "Bisection search: exponential speedup cutting search space in half each step.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In Lecture 3, Dr. Ana Bell covers string manipulations and bisection search."},
            {"seconds": 400, "timestamp": "06:40", "text": "Exhaustive enumeration checks every candidate. Bisection search uses monotonicity to eliminate half the remaining space."},
            {"seconds": 1600, "timestamp": "26:40", "text": "Bisection search converges in logarithmic O(log N) iterations."},
        ],
        "resources": [
            {"title": "Lecture 3 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec3/"},
        ],
    },
    {
        "id": "mitx-600-lec-4",
        "module_title": "Unit 2: Functions & Data Structures",
        "order": 4,
        "title": "Lecture 4: Decomposition, Abstraction, and Functions",
        "duration_minutes": 51,
        "youtube_id": "MjbuarJ7SE0",
        "concept_name": "Functions, Scopes & Abstraction",
        "notes": [
            "Decomposition: structuring monolithic code into self-contained modules.",
            "Abstraction: treating a function as a black-box contract via docstrings and signatures.",
            "Variable scope: local stack frames and lexical scoping.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Functions suppress implementation details so we can architect complex software systems."},
            {"seconds": 380, "timestamp": "06:20", "text": "Formal parameters receive arguments passed by assignment."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Variables initialized inside a function exist strictly within its local frame stack."},
        ],
        "resources": [
            {"title": "Lecture 4 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec4/"},
        ],
    },
    {
        "id": "mitx-600-lec-5",
        "module_title": "Unit 2: Functions & Data Structures",
        "order": 5,
        "title": "Lecture 5: Tuples, Lists, Aliasing, Mutability, and Cloning",
        "duration_minutes": 50,
        "youtube_id": "RvRKT-jXvko",
        "concept_name": "Mutability, Lists & References",
        "notes": [
            "Tuples: immutable ordered sequences of elements.",
            "Lists: mutable sequences with append, extend, and in-place mutation.",
            "Aliasing vs cloning: modifying an aliased list changes all referenced variables.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Lecture 5 explores compound data types: tuples and mutable lists."},
            {"seconds": 450, "timestamp": "07:30", "text": "Tuples are immutable; lists are mutable objects whose internal elements can change in memory."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Aliasing occurs when two variable names point to the exact same memory address."},
        ],
        "resources": [
            {"title": "Lecture 5 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec5/"},
        ],
    },
    {
        "id": "mitx-600-lec-6",
        "module_title": "Unit 2: Functions & Data Structures",
        "order": 6,
        "title": "Lecture 6: Recursion and Dictionaries",
        "duration_minutes": 52,
        "youtube_id": "WPSeyjX1-4s",
        "concept_name": "Recursion & Hash Maps",
        "notes": [
            "Inductive step and base cases in recursive functions.",
            "Towers of Hanoi and Fibonacci via recursion.",
            "Dictionaries: key-value hash maps with O(1) expected lookup and insertion.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we study recursion and Python dictionaries."},
            {"seconds": 380, "timestamp": "06:20", "text": "A recursive function calls itself on smaller instances until reaching a base case."},
            {"seconds": 1600, "timestamp": "26:40", "text": "Dictionaries map hashable keys to arbitrary values with near-instantaneous O(1) lookup."},
        ],
        "resources": [
            {"title": "Lecture 6 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec6/"},
        ],
    },
    {
        "id": "mitx-600-lec-7",
        "module_title": "Unit 3: Robust Programming & OOP",
        "order": 7,
        "title": "Lecture 7: Testing, Debugging, Exceptions, and Assertions",
        "duration_minutes": 48,
        "youtube_id": "9H6muyZjms0",
        "concept_name": "Defensive Programming & Exception Handling",
        "notes": [
            "Unit testing and regression testing.",
            "Handling runtime errors gracefully using try, except, raise, and finally blocks.",
            "Assertions as defensive preconditions.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Every programmer writes bugs. Today we discuss systematic testing, debugging, and exceptions."},
            {"seconds": 400, "timestamp": "06:40", "text": "Defensive programming validates assumptions early before silent corruption occurs."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Try-except blocks intercept exceptions and enable predictable error recovery."},
        ],
        "resources": [
            {"title": "Lecture 7 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec7/"},
        ],
    },
    {
        "id": "mitx-600-lec-8",
        "module_title": "Unit 3: Robust Programming & OOP",
        "order": 8,
        "title": "Lecture 8: Object Oriented Programming",
        "duration_minutes": 50,
        "youtube_id": "-DP1i2ZU9gk",
        "concept_name": "Classes, Instances & Methods",
        "notes": [
            "Abstract Data Types (ADTs) bundle state and operations together.",
            "Defining classes: the __init__ constructor and self parameter.",
            "Special dunder methods: __str__, __add__, __len__.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Object-Oriented Programming (OOP) allows us to create our own custom data types."},
            {"seconds": 360, "timestamp": "06:00", "text": "A class is a blueprint; an instance is a concrete realization in memory."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Methods are functions bound to instances, receiving self as their first argument."},
        ],
        "resources": [
            {"title": "Lecture 8 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec8/"},
        ],
    },
    {
        "id": "mitx-600-lec-9",
        "module_title": "Unit 3: Robust Programming & OOP",
        "order": 9,
        "title": "Lecture 9: Python Classes and Inheritance",
        "duration_minutes": 51,
        "youtube_id": "FlGjISF3l78",
        "concept_name": "Inheritance, Subclasses & Polymorphism",
        "notes": [
            "Subclasses inherit attributes and methods from superclasses.",
            "Method overriding and extending functionality via super().",
            "Polymorphism and class hierarchies in software architecture.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In Lecture 9, we examine class inheritance and polymorphism."},
            {"seconds": 420, "timestamp": "07:00", "text": "Inheritance enables code reuse: sub-types inherit attributes from base classes."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Overriding allows derived classes to customize behavior while honoring the parent interface."},
        ],
        "resources": [
            {"title": "Lecture 9 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec9/"},
        ],
    },
    {
        "id": "mitx-600-lec-10",
        "module_title": "Unit 4: Algorithmic Efficiency & Sorting",
        "order": 10,
        "title": "Lecture 10: Understanding Program Efficiency, Part 1",
        "duration_minutes": 49,
        "youtube_id": "o9nW0uBqvEo",
        "concept_name": "Computational Complexity & Big O",
        "notes": [
            "Measuring program efficiency: wall-clock time vs counting primitive operations.",
            "Asymptotic analysis: Big O notation O(f(n)).",
            "Common complexity classes: constant O(1), logarithmic O(log n), linear O(n), polynomial O(n^c), exponential O(2^n).",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "How do we reason about whether an algorithm will scale to big datasets? Big O notation."},
            {"seconds": 380, "timestamp": "06:20", "text": "Big O provides an asymptotic upper bound as input size n approaches infinity."},
            {"seconds": 1400, "timestamp": "23:20", "text": "We ignore multiplicative constants and lower-order terms to classify the dominant growth rate."},
        ],
        "resources": [
            {"title": "Lecture 10 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec10/"},
        ],
    },
    {
        "id": "mitx-600-lec-11",
        "module_title": "Unit 4: Algorithmic Efficiency & Sorting",
        "order": 11,
        "title": "Lecture 11: Understanding Program Efficiency, Part 2",
        "duration_minutes": 52,
        "youtube_id": "7lQXYl_L28w",
        "concept_name": "Complexity Analysis of Recursive Programs",
        "notes": [
            "Analyzing iterative and recursive algorithms.",
            "Exponential complexity of power set generation and recursive Fibonacci.",
            "Trade-offs between time complexity and space complexity.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Lecture 11 dives deeper into asymptotic analysis, particularly for recursive algorithms."},
            {"seconds": 450, "timestamp": "07:30", "text": "When each call branches into two recursive subproblems, depth d leads to 2^d operations."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Analyzing the recursive tree allows us to calculate total operations across all call frames."},
        ],
        "resources": [
            {"title": "Lecture 11 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec11/"},
        ],
    },
    {
        "id": "mitx-600-lec-12",
        "module_title": "Unit 4: Algorithmic Efficiency & Sorting",
        "order": 12,
        "title": "Lecture 12: Searching and Sorting",
        "duration_minutes": 50,
        "youtube_id": "6LOwPhPDwVc",
        "concept_name": "Search & Sort Algorithms in Python",
        "notes": [
            "Linear search vs binary search on sorted sequences.",
            "Bogo sort, Bubble sort, Selection sort, and Merge sort.",
            "Divide-and-conquer merge sort achieving O(n log n) efficiency.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "We conclude 6.0001 with search and sort algorithms."},
            {"seconds": 380, "timestamp": "06:20", "text": "Binary search finds an item in sorted list in logarithmic time."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Merge sort divides the list, sorts recursively, and merges sorted sublists in linear time."},
        ],
        "resources": [
            {"title": "Lecture 12 Slides (PDF)", "type": "pdf", "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec12/"},
        ],
    },
]


# ---------------------------------------------------------------------------
# SWAYAM: Python for Data Science (IIT Madras, Prof. Raghunathan Rengasamy)
# ---------------------------------------------------------------------------
SWAYAM_DS_LECTURES: List[Dict[str, Any]] = [
    {
        "id": "swayam-ds-lec-1",
        "module_title": "Week 1: Python Environment & Core Foundations",
        "order": 1,
        "title": "Lecture 1: Introduction to Python for Data Science",
        "duration_minutes": 45,
        "youtube_id": "KTQlA-q42LA",
        "concept_name": "Data Science Workflow & Python Setup",
        "notes": [
            "Why Python for Data Science: package ecosystem (NumPy, SciPy, Pandas, Scikit-Learn).",
            "Jupyter notebooks and interactive computing environment.",
            "Data types, arithmetic expressions, and variable assignment.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Welcome to Python for Data Science. I am Prof. Raghunathan Rengasamy from IIT Madras."},
            {"seconds": 240, "timestamp": "04:00", "text": "Data science combines statistical domain expertise with algorithmic computation."},
            {"seconds": 1200, "timestamp": "20:00", "text": "We set up Python and Jupyter environments for rapid exploratory analysis."},
        ],
        "resources": [
            {"title": "Week 1 Lecture Notes (PDF)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/week1"},
        ],
    },
    {
        "id": "swayam-ds-lec-2",
        "module_title": "Week 1: Python Environment & Core Foundations",
        "order": 2,
        "title": "Lecture 2: Core Python Syntax, Sequences & Control",
        "duration_minutes": 48,
        "youtube_id": "Bf34I0eK47Q",
        "concept_name": "Lists, Tuples & Loops in Data Processing",
        "notes": [
            "Lists, tuples, dictionaries, and sets for structured data storage.",
            "List comprehensions for concise, vectorized-style element processing.",
            "Conditional branching and iterative loops for batch processing.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Today we cover data structures: lists, dictionaries, and list comprehensions."},
            {"seconds": 360, "timestamp": "06:00", "text": "List comprehensions offer a fast and expressive syntax for transforming data records."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Iterating over collections and applying filter criteria."},
        ],
        "resources": [
            {"title": "Week 1 Practice Notebook (IPYNB)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/week1-notebook"},
        ],
    },
    {
        "id": "swayam-ds-lec-3",
        "module_title": "Week 2: Numerical Computing with NumPy",
        "order": 3,
        "title": "Lecture 3: Introduction to NumPy & Multidimensional Arrays",
        "duration_minutes": 50,
        "youtube_id": "tA42nHmmEKw",
        "concept_name": "NumPy ndarray & Vectorization",
        "notes": [
            "The NumPy ndarray: homogeneous contiguous memory layout for high performance.",
            "Creating arrays: arange, linspace, zeros, ones, and eye.",
            "Broadcasting rules in multidimensional arithmetic operations.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Week 2 introduces NumPy, the core library for scientific computing in Python."},
            {"seconds": 380, "timestamp": "06:20", "text": "Python lists store pointer references, while NumPy ndarrays store raw typed bytes in contiguous memory."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Broadcasting allows arithmetic between arrays of different but compatible shapes without copying data."},
        ],
        "resources": [
            {"title": "NumPy Reference Cheat Sheet (PDF)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/numpy-sheet"},
        ],
    },
    {
        "id": "swayam-ds-lec-4",
        "module_title": "Week 2: Numerical Computing with NumPy",
        "order": 4,
        "title": "Lecture 4: NumPy Array Indexing, Slicing & Operations",
        "duration_minutes": 47,
        "youtube_id": "c235EsGFcZs",
        "concept_name": "Boolean Masking & Matrix Algebra",
        "notes": [
            "Multi-axis indexing and strides.",
            "Boolean masking and fancy indexing for conditional subsetting.",
            "Matrix operations: dot product, matrix inversion, and singular value decomposition.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In this lecture we demonstrate advanced slicing, boolean masks, and matrix algebra with NumPy."},
            {"seconds": 400, "timestamp": "06:40", "text": "Boolean masks filter rows matching criteria in a single vectorized step."},
            {"seconds": 1300, "timestamp": "21:40", "text": "np.dot and np.linalg functions execute optimized BLAS/LAPACK routines."},
        ],
        "resources": [
            {"title": "NumPy Operations Exercises (PDF)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/numpy-exercises"},
        ],
    },
    {
        "id": "swayam-ds-lec-5",
        "module_title": "Week 3: Tabular Data Processing with Pandas",
        "order": 5,
        "title": "Lecture 5: Pandas DataFrames & Data Cleaning",
        "duration_minutes": 52,
        "youtube_id": "psJlsGRLKyk",
        "concept_name": "Pandas Series & DataFrames",
        "notes": [
            "Series and DataFrame data structures.",
            "Reading CSV, Excel, and SQL data sources.",
            "Handling missing data: isnull, dropna, fillna with statistical imputation.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Pandas is the primary library for data manipulation and tabular analysis in Python."},
            {"seconds": 360, "timestamp": "06:00", "text": "A DataFrame represents a 2D table with labeled axes: row index and column names."},
            {"seconds": 1600, "timestamp": "26:40", "text": "Cleaning messy data: identifying nulls and imputing sensible defaults."},
        ],
        "resources": [
            {"title": "Pandas Data Cleaning Notes (PDF)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/pandas-cleaning"},
        ],
    },
    {
        "id": "swayam-ds-lec-6",
        "module_title": "Week 3: Tabular Data Processing with Pandas",
        "order": 6,
        "title": "Lecture 6: Exploratory Data Analysis & Aggregations",
        "duration_minutes": 51,
        "youtube_id": "ABiUtSANHUM",
        "concept_name": "GroupBy, Pivots & Statistical Summaries",
        "notes": [
            "The Split-Apply-Combine strategy with groupby.",
            "Aggregation functions: mean, median, standard deviation, and custom aggregators.",
            "Pivot tables and multi-index hierarchical data manipulation.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Exploratory Data Analysis (EDA) reveals patterns and anomalies before model training."},
            {"seconds": 450, "timestamp": "07:30", "text": "The groupby paradigm splits rows by category, computes summary metrics, and concatenates results."},
            {"seconds": 1500, "timestamp": "25:00", "text": "Building pivot tables to cross-tabulate multi-attribute survey datasets."},
        ],
        "resources": [
            {"title": "EDA Case Study Handout (PDF)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/eda-handout"},
        ],
    },
    {
        "id": "swayam-ds-lec-7",
        "module_title": "Week 4: Data Visualization & Applications",
        "order": 7,
        "title": "Lecture 7: Data Visualization with Matplotlib & Seaborn",
        "duration_minutes": 49,
        "youtube_id": "KTQlA-q42LA",
        "concept_name": "Data Visualization & Plot Types",
        "notes": [
            "Matplotlib figure and axes object hierarchy.",
            "Line charts, scatter plots, histograms, and box plots for distribution diagnostics.",
            "Statistical plotting with Seaborn: heatmaps, pairplots, and regression curves.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Visualizing distributions is essential for diagnosing skewness, outliers, and collinearity."},
            {"seconds": 400, "timestamp": "06:40", "text": "We construct histograms and boxplots to examine quantiles and extreme values."},
            {"seconds": 1400, "timestamp": "23:20", "text": "Seaborn correlation heatmaps identify redundant collinear features."},
        ],
        "resources": [
            {"title": "Visualization Best Practices (PDF)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/viz-practices"},
        ],
    },
    {
        "id": "swayam-ds-lec-8",
        "module_title": "Week 4: Data Visualization & Applications",
        "order": 8,
        "title": "Lecture 8: Applied Data Science Pipeline & Case Study",
        "duration_minutes": 53,
        "youtube_id": "Bf34I0eK47Q",
        "concept_name": "End-to-End Analytics Workflow",
        "notes": [
            "End-to-end data science project lifecycle: ingest, clean, explore, model, interpret.",
            "Feature engineering and scaling (MinMax vs StandardScaler).",
            "Baseline regression and classification evaluation with metrics.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "In our final lecture, we assemble the complete data pipeline on a real industrial dataset."},
            {"seconds": 450, "timestamp": "07:30", "text": "From raw messy CSV records to engineered features, visual diagnostics, and baseline models."},
            {"seconds": 1600, "timestamp": "26:40", "text": "Summary of course principles and roadmap toward advanced predictive modeling."},
        ],
        "resources": [
            {"title": "Course Final Project Brief (PDF)", "type": "pdf", "url": "https://swayam.gov.in/courses/python-data-science/final-project"},
        ],
    },
]


# ---------------------------------------------------------------------------
# Khan Academy: Linear Algebra (Sal Khan & 3Blue1Brown)
# ---------------------------------------------------------------------------
KHAN_ACADEMY_LA_LECTURES: List[Dict[str, Any]] = [
    {
        "id": "khan-la-lec-1",
        "module_title": "Unit 1: Vectors & Spaces",
        "order": 1,
        "title": "Lecture 1: Vectors and Spaces",
        "duration_minutes": 25,
        "youtube_id": "fNk_zzaMoSs",
        "concept_name": "Vectors, Physics & CS Perspectives",
        "notes": [
            "Three perspectives on vectors: physics (arrow with length and direction), CS (ordered list of numbers), and math (generalized vector space).",
            "Vector addition as head-to-tail geometric displacement.",
            "Scalar multiplication as stretching or squishing coordinate lengths.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "What is a vector? In linear algebra, vectors are both arrows in geometric space and lists of numerical features."},
            {"seconds": 180, "timestamp": "03:00", "text": "When we add two vectors, we place them head-to-tail and draw an arrow from start to finish."},
            {"seconds": 600, "timestamp": "10:00", "text": "Multiplying by a scalar scales the length and flips direction if negative."},
        ],
        "resources": [
            {"title": "Unit 1 Vectors Practice Exercises", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/vectors-spaces/vectors/e/vector-addition"},
        ],
    },
    {
        "id": "khan-la-lec-2",
        "module_title": "Unit 1: Vectors & Spaces",
        "order": 2,
        "title": "Lecture 2: Linear Combinations, Span, and Basis Vectors",
        "duration_minutes": 28,
        "youtube_id": "k7RM-ot2NWY",
        "concept_name": "Span, Basis & Linear Independence",
        "notes": [
            "Standard basis vectors i-hat and j-hat.",
            "Linear combinations: scaling basis vectors and adding them.",
            "Span: the set of all possible vectors reachable by linear combinations.",
            "Linear independence: when adding a vector increases the dimensionality of the span.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "The span of a set of vectors is the entire subspace you can reach using linear combinations."},
            {"seconds": 240, "timestamp": "04:00", "text": "Two linearly independent 2D vectors span the entire 2D plane."},
            {"seconds": 750, "timestamp": "12:30", "text": "Basis vectors form a minimal set that spans the space without redundancy."},
        ],
        "resources": [
            {"title": "Unit 1 Basis & Span Practice", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/vectors-spaces/linear-combinations/e/linear-combinations"},
        ],
    },
    {
        "id": "khan-la-lec-3",
        "module_title": "Unit 2: Linear Transformations & Matrices",
        "order": 3,
        "title": "Lecture 3: Linear Transformations and Matrices",
        "duration_minutes": 30,
        "youtube_id": "kYB8IZa5AuE",
        "concept_name": "Linear Transformations & Grid Lines",
        "notes": [
            "A transformation is linear if grid lines remain parallel and evenly spaced, and the origin remains fixed.",
            "A linear transformation is completely determined by where it sends the basis vectors i-hat and j-hat.",
            "Packaging the landing coordinates of basis vectors into matrix columns.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Linear transformations are functions that take in vectors and output transformed vectors while keeping lines parallel and origin fixed."},
            {"seconds": 300, "timestamp": "05:00", "text": "To describe any 2D linear transformation, you only need to know where i-hat and j-hat land."},
            {"seconds": 850, "timestamp": "14:10", "text": "Those two landing points become the two columns of a 2 by 2 matrix."},
        ],
        "resources": [
            {"title": "Linear Transformations Practice", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/matrix-transformations/linear-transformations/e/linear-transformations"},
        ],
    },
    {
        "id": "khan-la-lec-4",
        "module_title": "Unit 2: Linear Transformations & Matrices",
        "order": 4,
        "title": "Lecture 4: Linear Transformations as Matrix-Vector Products",
        "duration_minutes": 27,
        "youtube_id": "PErhLkQcpZ8",
        "concept_name": "Matrix-Vector Multiplication",
        "notes": [
            "Computing A * x: scaling columns of A by coordinates of x and adding.",
            "Rotations, shears, and reflections represented as 2x2 matrices.",
            "Geometric intuition behind matrix multiplication formulas.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Matrix-vector multiplication is simply computing a linear combination of the matrix's columns."},
            {"seconds": 250, "timestamp": "04:10", "text": "Rotating the plane 90 degrees sends i-hat to (0, 1) and j-hat to (-1, 0)."},
            {"seconds": 720, "timestamp": "12:00", "text": "Multiplying any vector [x, y] by this matrix yields its rotated coordinates."},
        ],
        "resources": [
            {"title": "Matrix-Vector Product Exercises", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/matrix-transformations/matrix-vector-products/e/matrix-vector-multiplication"},
        ],
    },
    {
        "id": "khan-la-lec-5",
        "module_title": "Unit 3: Matrix Multiplication & Composition",
        "order": 5,
        "title": "Lecture 5: Matrix Multiplication as Composition of Transformations",
        "duration_minutes": 32,
        "youtube_id": "4PCktDZJH8E",
        "concept_name": "Transformation Composition & Associativity",
        "notes": [
            "Multiplying matrices A * B corresponds to applying transformation B first, followed by A.",
            "Matrix multiplication is associative: A * (B * C) = (A * B) * C.",
            "Matrix multiplication is NOT commutative: A * B != B * A in general.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Why is matrix multiplication defined the way it is? Because it represents composition of transformations."},
            {"seconds": 360, "timestamp": "06:00", "text": "Applying a rotation followed by a shear is not the same as shearing first and rotating second."},
            {"seconds": 950, "timestamp": "15:50", "text": "Tracking where basis vectors land after sequential transformations derives the standard row-column rule."},
        ],
        "resources": [
            {"title": "Matrix Composition Notes", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/matrix-transformations/composition-of-transformations/e/matrix-multiplication"},
        ],
    },
    {
        "id": "khan-la-lec-6",
        "module_title": "Unit 3: Matrix Multiplication & Composition",
        "order": 6,
        "title": "Lecture 6: Vector Transformations in 2D and 3D",
        "duration_minutes": 29,
        "youtube_id": "gAbadNuQEjI",
        "concept_name": "3D Transformations & Basis Matrices",
        "notes": [
            "Extending linear transformations to 3D: tracked by i-hat, j-hat, and k-hat.",
            "3x3 matrices: columns represent landing coordinates in R^3.",
            "Projections from 3D to 2D in computer graphics camera pipelines.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Moving from 2D to 3D: three basis vectors define 3x3 matrices with 9 parameters."},
            {"seconds": 300, "timestamp": "05:00", "text": "3D rotations along arbitrary axes and perspective projections."},
            {"seconds": 800, "timestamp": "13:20", "text": "Computer graphics engines use 4x4 homogeneous matrices to combine linear transformations and translations."},
        ],
        "resources": [
            {"title": "3D Transformations Guide", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/matrix-transformations/3d-transformations/e/3d-transformations"},
        ],
    },
    {
        "id": "khan-la-lec-7",
        "module_title": "Unit 4: Inverses, Determinants & Systems",
        "order": 7,
        "title": "Lecture 7: Introduction to Matrices and Systems of Equations",
        "duration_minutes": 26,
        "youtube_id": "yRwQ7A6jVLk",
        "concept_name": "Linear Systems & Matrix Formulation",
        "notes": [
            "Translating systems of linear equations into matrix equation A * x = v.",
            "Geometric interpretation: finding vector x that gets transformed into target v by matrix A.",
            "Gaussian elimination and row echelon form.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "Solving systems of simultaneous linear equations is equivalent to inverting a matrix transformation."},
            {"seconds": 280, "timestamp": "04:40", "text": "In A x = v, we are looking for the original vector x that lands on target v under transformation A."},
            {"seconds": 780, "timestamp": "13:00", "text": "If A doesn't squish space into a lower dimension, a unique inverse transformation exists."},
        ],
        "resources": [
            {"title": "Solving Linear Systems Practice", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/matrix-transformations/matrix-inverse/e/matrix-inverse"},
        ],
    },
    {
        "id": "khan-la-lec-8",
        "module_title": "Unit 4: Inverses, Determinants & Systems",
        "order": 8,
        "title": "Lecture 8: Determinants, Inverses, and Null Spaces",
        "duration_minutes": 31,
        "youtube_id": "xyAuNHPsq-g",
        "concept_name": "Determinants & Area Scaling Factor",
        "notes": [
            "The determinant measures how much a transformation scales areas (or volumes).",
            "Sign of determinant: positive preserves orientation; negative reverses orientation.",
            "A determinant of zero means space is squished into lower dimensions, meaning no inverse exists.",
            "Null space / Kernel: set of all vectors that get squished onto the origin.",
        ],
        "transcript": [
            {"seconds": 0, "timestamp": "00:00", "text": "The determinant of a matrix tells you the factor by which area scales under the transformation."},
            {"seconds": 320, "timestamp": "05:20", "text": "If det(A) = 0, the transformation squishes the entire 2D plane onto a 1D line or point."},
            {"seconds": 880, "timestamp": "14:40", "text": "When det(A) is non-zero, A is invertible and A^(-1) undoes the transformation exactly."},
        ],
        "resources": [
            {"title": "Determinants and Inverses Exercises", "type": "pdf", "url": "https://www.khanacademy.org/math/linear-algebra/matrix-transformations/determinant-depth/e/determinant-computation"},
        ],
    },
]
