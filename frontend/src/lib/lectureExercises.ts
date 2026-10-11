import { CodeExercise, Lecture } from '@/types';

/**
 * Curated coding exercises matched to specific video lectures.
 * Allows students to write, run, and test code side-by-side with the lecture video.
 */
export const CURATED_LECTURE_EXERCISES: Record<string, CodeExercise> = {
  // --- MIT 6.006 Algorithms & Data Structures ---
  'mit-6006-lec-1': {
    id: 'ex-peak-finding-1d',
    title: '1D Peak Finding (Divide & Conquer)',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'In Lecture 1, Prof. Devadas introduces Peak Finding. An element arr[i] is a 1D peak if arr[i] >= arr[i-1] and arr[i] >= arr[i+1].\n\nImplement the divide-and-conquer binary search algorithm to find any peak in O(log n) time.',
    starterCode: `def peak_finding_1d(arr: list[int]) -> int:
    """Find any peak element in O(log n) time using binary search."""
    low, high = 0, len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        left_val = arr[mid - 1] if mid > 0 else float('-inf')
        right_val = arr[mid + 1] if mid < len(arr) - 1 else float('-inf')
        
        # Check if mid is a peak
        if arr[mid] >= left_val and arr[mid] >= right_val:
            return arr[mid]
        elif mid > 0 and arr[mid - 1] > arr[mid]:
            high = mid - 1
        else:
            low = mid + 1
            
    return arr[low]

# Test with sample input from Lecture 1:
sample_array = [1, 3, 20, 4, 1, 0]
peak = peak_finding_1d(sample_array)
print("Array:", sample_array)
print("Peak Found:", peak)
assert peak == 20, "Expected peak 20"
print("[PASSED] Test Passed successfully!")
`,
    hints: [
      'Look at the middle element arr[n//2]. If it is smaller than its left neighbor, a peak is guaranteed on the left half.',
      'If arr[mid] is smaller than its right neighbor, a peak is guaranteed on the right half.',
      'If neither neighbor is greater, arr[mid] is already a peak!',
    ],
    expectedOutputSnippet: 'Peak Found: 20\n[PASSED] Test Passed successfully!',
  },

  'mit-6006-lec-2': {
    id: 'ex-doc-distance',
    title: 'Document Distance & Cosine Similarity',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Compute the cosine similarity angle between two text documents by extracting word frequencies and calculating the normalized inner product: dot(v1, v2) / (||v1|| * ||v2||).',
    starterCode: `import math

def word_frequencies(text: str) -> dict[str, int]:
    freq = {}
    for word in text.lower().split():
        cleaned = ''.join(c for c in word if c.isalnum())
        if cleaned:
            freq[cleaned] = freq.get(cleaned, 0) + 1
    return freq

def document_distance(doc1: str, doc2: str) -> float:
    """Return cosine similarity between doc1 and doc2 (0 to 1)."""
    f1 = word_frequencies(doc1)
    f2 = word_frequencies(doc2)
    
    # Compute dot product
    dot_product = sum(count * f2.get(word, 0) for word, count in f1.items())
    
    # Compute norms
    norm1 = math.sqrt(sum(count ** 2 for count in f1.values()))
    norm2 = math.sqrt(sum(count ** 2 for count in f2.values()))
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)

d1 = "Algorithms divide and conquer efficiently"
d2 = "Divide and conquer algorithms solve problems"
similarity = document_distance(d1, d2)
print(f"Cosine similarity: {similarity:.4f}")
print("Angle in degrees:", math.degrees(math.acos(min(1.0, similarity))))
`,
    hints: ['Represent each document as a dictionary mapping words to counts.'],
  },

  'mit-6006-lec-3': {
    id: 'ex-merge-sort',
    title: 'Merge Sort (Divide & Conquer O(n log n))',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Implement Merge Sort: divide the array into halves, sort recursively, and merge two sorted lists in linear time Theta(n).',
    starterCode: `def merge(left: list[int], right: list[int]) -> list[int]:
    """Merge two sorted arrays in linear time."""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

def merge_sort(arr: list[int]) -> list[int]:
    """Sort array recursively in O(n log n) time."""
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

numbers = [54, 26, 93, 17, 77, 31, 44, 55, 20]
sorted_numbers = merge_sort(numbers)
print("Original:", numbers)
print("Sorted:  ", sorted_numbers)
assert sorted_numbers == sorted(numbers)
print("[PASSED] Merge Sort verified!")
`,
    hints: ['The base case is when len(arr) <= 1. Split the array using slice notation arr[:mid] and arr[mid:].'],
  },

  'mit-6006-lec-4': {
    id: 'ex-heap-sort',
    title: 'Binary Max-Heap & Heap Sort',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Implement max_heapify to maintain the max-heap property at index i, and build a max-heap to sort elements in O(n log n).',
    starterCode: `def max_heapify(arr: list[int], n: int, i: int):
    """Restore max-heap property rooted at index i."""
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
        
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        max_heapify(arr, n, largest)

def heap_sort(arr: list[int]):
    n = len(arr)
    # Build max heap (rearrange array)
    for i in range(n // 2 - 1, -1, -1):
        max_heapify(arr, n, i)
        
    # Extract elements one by one from heap
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        max_heapify(arr, i, 0)
    return arr

arr = [12, 11, 13, 5, 6, 7]
print("Before:", arr)
heap_sort(arr)
print("After: ", arr)
assert arr == [5, 6, 7, 11, 12, 13]
print("[PASSED] Heap Sort verified!")
`,
  },

  'mit-6006-lec-5': {
    id: 'ex-bst',
    title: 'Binary Search Tree (Insert & Inorder Traversal)',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Implement a Binary Search Tree (BST) Node and an insert method ensuring left < root < right. An inorder traversal outputs keys in sorted order.',
    starterCode: `class BSTNode:
    def __init__(self, key: int):
        self.key = key
        self.left = None
        self.right = None

def bst_insert(root: BSTNode | None, key: int) -> BSTNode:
    if root is None:
        return BSTNode(key)
    if key < root.key:
        root.left = bst_insert(root.left, key)
    elif key > root.key:
        root.right = bst_insert(root.right, key)
    return root

def inorder(root: BSTNode | None, res: list[int]) -> list[int]:
    if root:
        inorder(root.left, res)
        res.append(root.key)
        inorder(root.right, res)
    return res

root = None
keys = [15, 6, 18, 3, 7, 17, 20, 2, 4, 13, 9]
for k in keys:
    root = bst_insert(root, k)

sorted_keys = inorder(root, [])
print("Inserted keys:", keys)
print("Inorder sorted:", sorted_keys)
assert sorted_keys == sorted(keys)
print("[PASSED] BST Invariant Verified!")
`,
  },

  'mit-6006-lec-8': {
    id: 'ex-hash-table',
    title: 'Hash Table with Chaining',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Implement a hash table using an array of buckets and separate chaining for collision resolution.',
    starterCode: `class HashTable:
    def __init__(self, size: int = 10):
        self.size = size
        self.table = [[] for _ in range(size)]
        
    def _hash(self, key: str) -> int:
        return hash(key) % self.size
        
    def insert(self, key: str, value: any):
        bucket = self.table[self._hash(key)]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        
    def get(self, key: str) -> any:
        bucket = self.table[self._hash(key)]
        for k, v in bucket:
            if k == key:
                return v
        return None

ht = HashTable(5)
ht.insert("algorithm", "procedure")
ht.insert("data_structure", "organization")
ht.insert("python", "language")

print("Lookup 'algorithm':", ht.get("algorithm"))
print("Lookup 'python':", ht.get("python"))
print("Buckets:", ht.table)
`,
  },

  'mit-6006-lec-13': {
    id: 'ex-bfs',
    title: 'Breadth-First Search (Shortest Path Distance)',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Use Breadth-First Search (BFS) with a FIFO queue to compute shortest path distances from source s to all reachable vertices in an unweighted graph.',
    starterCode: `from collections import deque

def bfs_distances(graph: dict[str, list[str]], start: str) -> dict[str, int]:
    """Find shortest path distance to all nodes using BFS."""
    distances = {start: 0}
    queue = deque([start])
    
    while queue:
        u = queue.popleft()
        current_dist = distances[u]
        
        for v in graph.get(u, []):
            if v not in distances:
                distances[v] = current_dist + 1
                queue.append(v)
                
    return distances

# Graph from Lecture 13:
adj_graph = {
    's': ['a', 'x'],
    'a': ['s', 'z'],
    'x': ['s', 'd', 'c'],
    'd': ['x', 'c'],
    'c': ['x', 'd', 'v'],
    'z': ['a'],
    'v': ['c']
}

dists = bfs_distances(adj_graph, 's')
print("Shortest distances from source 's':")
for node, d in sorted(dists.items()):
    print(f"  Node {node}: {d} steps")
`,
  },

  'mit-6006-lec-16': {
    id: 'ex-dijkstra',
    title: 'Dijkstra Single-Source Shortest Paths',
    language: 'python',
    difficulty: 'advanced',
    instructions:
      'Implement Dijkstra’s algorithm using a min-heap priority queue to compute shortest paths on a graph with non-negative edge weights.',
    starterCode: `import heapq

def dijkstra(graph: dict[str, list[tuple[str, int]]], source: str) -> dict[str, int]:
    """Computes shortest path distances from source in O((V + E) log V)."""
    distances = {node: float('inf') for node in graph}
    distances[source] = 0
    pq = [(0, source)]
    
    while pq:
        curr_dist, u = heapq.heappop(pq)
        
        if curr_dist > distances[u]:
            continue
            
        for v, weight in graph[u]:
            dist = curr_dist + weight
            if dist < distances[v]:
                distances[v] = dist
                heapq.heappush(pq, (dist, v))
                
    return distances

graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('A', 4), ('C', 1), ('D', 5)],
    'C': [('A', 2), ('B', 1), ('D', 8), ('E', 10)],
    'D': [('B', 5), ('C', 8), ('E', 2)],
    'E': [('C', 10), ('D', 2)],
}

result = dijkstra(graph, 'A')
print("Shortest distances from node A:")
for node, d in sorted(result.items()):
    print(f"  {node}: {d}")
assert result['D'] == 8 and result['E'] == 10
print("[PASSED] Dijkstra test passed!")
`,
  },

  'mit-6006-lec-19': {
    id: 'ex-dp-fib',
    title: 'Dynamic Programming: Memoized Fibonacci',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Compare naive exponential recursion O(2^n) against memoized Dynamic Programming O(n).',
    starterCode: `import time

# 1. Memoized DP Fibonacci
memo = {}
def fib_memo(n: int) -> int:
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1) + fib_memo(n - 2)
    return memo[n]

# 2. Bottom-Up DP Table Fibonacci
def fib_bottom_up(n: int) -> int:
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

n = 35
t0 = time.perf_counter()
ans = fib_memo(n)
dt_memo = (time.perf_counter() - t0) * 1000

print(f"Fibonacci({n}) = {ans}")
print(f"Computed via DP in {dt_memo:.4f} ms (sub-millisecond!)")
assert ans == 9227465
print("[PASSED] DP Principle Demonstrated!")
`,
  },

  // --- MITx 6.0001 Introduction to CS and Programming in Python ---
  'mitx-600-lec-1': {
    id: 'ex-python-basics',
    title: 'What is Computation: Expressions & Types',
    language: 'python',
    difficulty: 'beginner',
    instructions:
      'Practice evaluating expressions, variable binding, and type conversions in Python.',
    starterCode: `# MIT 6.0001 Lecture 1 Practice
pi = 3.14159
radius = 2.2
area = pi * (radius ** 2)

print("Radius:", radius)
print("Area of Circle:", area)
print("Type of area:", type(area))

# Type casting
int_area = int(area)
print("Integer truncation:", int_area)
print("Comparison area > 10:", area > 10)
`,
  },

  'mitx-600-lec-2': {
    id: 'ex-cube-root',
    title: 'Branching & Loops: Guess and Check',
    language: 'python',
    difficulty: 'beginner',
    instructions:
      'Implement guess-and-check to find the integer cube root of a number, handling negative numbers and non-perfect cubes.',
    starterCode: `def find_cube_root(x: int):
    """Find integer cube root of x using exhaustive enumeration."""
    ans = 0
    is_neg = x < 0
    val = abs(x)
    
    while ans ** 3 < val:
        ans += 1
        
    if ans ** 3 != val:
        print(f"{x} is NOT a perfect cube!")
        return None
    else:
        if is_neg:
            ans = -ans
        print(f"Cube root of {x} is {ans}")
        return ans

find_cube_root(27)
find_cube_root(-125)
find_cube_root(16)
`,
  },

  'mitx-600-lec-3': {
    id: 'ex-bisection-search',
    title: 'Bisection Search for Square Roots',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'In Lecture 3, Dr. Bell demonstrates Bisection Search. Approximate the square root of x within tolerance epsilon in logarithmic steps.',
    starterCode: `def bisection_sqrt(x: float, epsilon: float = 0.0001) -> float:
    """Approximate square root of x using bisection search."""
    low = 0.0
    high = max(1.0, x)
    ans = (low + high) / 2.0
    num_guesses = 0
    
    while abs(ans ** 2 - x) >= epsilon:
        num_guesses += 1
        if ans ** 2 < x:
            low = ans
        else:
            high = ans
        ans = (low + high) / 2.0
        
    print(f"Guessed {num_guesses} times. Sqrt({x}) ≈ {ans:.6f}")
    return ans

sqrt_25 = bisection_sqrt(25.0)
sqrt_54 = bisection_sqrt(54.0)
print(f"Verification: 54^0.5 = {54 ** 0.5:.6f}")
`,
  },

  'mitx-600-lec-4': {
    id: 'ex-recursion-gcd',
    title: 'Functions & Recursion: Euclidean GCD',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Write recursive functions: factorial and the Euclidean Greatest Common Divisor (GCD).',
    starterCode: `def factorial(n: int) -> int:
    """Compute n! recursively."""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def gcd(a: int, b: int) -> int:
    """Euclidean algorithm: gcd(a, b) = gcd(b, a % b)."""
    if b == 0:
        return a
    return gcd(b, a % b)

print("5! =", factorial(5))
print("10! =", factorial(10))
print("GCD(48, 18) =", gcd(48, 18))
print("GCD(101, 103) =", gcd(101, 103))
assert gcd(48, 18) == 6
print("[PASSED] Recursive contracts verified!")
`,
  },

  'mitx-600-lec-8': {
    id: 'ex-coordinate-class',
    title: 'Object-Oriented Programming: Coordinate Class',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Implement Coordinate class with x and y attributes, a distance method, and special methods __str__ and __repr__.',
    starterCode: `import math

class Coordinate:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
        
    def distance(self, other: 'Coordinate') -> float:
        """Euclidean distance to another point."""
        x_diff_sq = (self.x - other.x) ** 2
        y_diff_sq = (self.y - other.y) ** 2
        return math.sqrt(x_diff_sq + y_diff_sq)
        
    def __str__(self) -> str:
        return f"<{self.x}, {self.y}>"

c1 = Coordinate(3, 4)
c2 = Coordinate(0, 0)
print("Point 1:", c1)
print("Point 2:", c2)
print("Distance between c1 and c2:", c1.distance(c2))
assert c1.distance(c2) == 5.0
print("[PASSED] OOP Distance method verified!")
`,
  },

  // --- SWAYAM: Python for Data Science ---
  'swayam-ds-lec-3': {
    id: 'ex-numpy-vectorization',
    title: 'NumPy Multidimensional Array Vectorization',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Create 2D matrices and perform vectorized row and column operations without python loops.',
    starterCode: `import numpy as np

# Create 2D matrix
matrix = np.array([
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90]
])

print("Matrix:\n", matrix)
print("Shape:", matrix.shape)
print("Mean of all elements:", np.mean(matrix))
print("Column-wise means:", np.mean(matrix, axis=0))
print("Row-wise sums:", np.sum(matrix, axis=1))

# Vectorized condition: elements > 45
mask = matrix > 45
print("Filtered elements > 45:", matrix[mask])
`,
  },

  'swayam-ds-lec-5': {
    id: 'ex-pandas-cleaning',
    title: 'Pandas DataFrame Cleaning & Imputation',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Construct a pandas DataFrame with missing values, detect null entries, and impute with column averages.',
    starterCode: `import pandas as pd
import numpy as np

# Sample sensor telemetry
data = {
    'temperature': [22.4, np.nan, 23.1, 25.0, np.nan, 21.8],
    'humidity': [45.0, 48.2, np.nan, 52.1, 49.0, 47.5],
    'pressure': [1013, 1012, 1014, 1011, 1013, 1015],
}

df = pd.DataFrame(data)
print("Raw DataFrame with Missing Values:\n", df)
print("\nMissing values count:\n", df.isnull().sum())

# Impute missing values with mean
df_clean = df.fillna(df.mean())
print("\nCleaned DataFrame after Imputation:\n", df_clean)
`,
  },

  // --- NPTEL: Machine Learning ---
  'nptel-ml-lec-5': {
    id: 'ex-vector-norms',
    title: 'Computing L1, L2 and L-infinity Norms',
    language: 'python',
    difficulty: 'beginner',
    instructions:
      'Compute vector norms (L1 Manhattan, L2 Euclidean, and L_inf Max) and inspect their geometric magnitudes.',
    starterCode: `import math

def vector_norms(v: list[float]) -> dict[str, float]:
    l1 = sum(abs(x) for x in v)
    l2 = math.sqrt(sum(x ** 2 for x in v))
    l_inf = max(abs(x) for x in v)
    return {'L1': l1, 'L2': l2, 'L_infinity': l_inf}

feature_vec = [3.0, -4.0, 12.0]
norms = vector_norms(feature_vec)

print("Vector:", feature_vec)
for name, val in norms.items():
    print(f"  {name} norm: {val:.4f}")
    
assert norms['L2'] == 13.0
print("[PASSED] Euclidean Norm verified: sqrt(9 + 16 + 144) = 13")
`,
  },

  'nptel-ml-lec-18': {
    id: 'ex-gradient-descent',
    title: 'Gradient Descent Optimization Loop',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Implement Gradient Descent to minimize a convex objective function f(w) = (w - 3)^2 + 5. The derivative is f\'(w) = 2*(w - 3).',
    starterCode: `def gradient_descent(start_w: float, learning_rate: float = 0.1, epochs: int = 40):
    w = start_w
    history = []
    
    for epoch in range(epochs):
        loss = (w - 3) ** 2 + 5
        grad = 2 * (w - 3)
        history.append((epoch, w, loss))
        w = w - learning_rate * grad
        
    return w, history

opt_w, hist = gradient_descent(start_w=10.0, learning_rate=0.1, epochs=35)
print(f"Final parameter w: {opt_w:.4f} (Target is 3.0)")
print("First 5 steps:")
for step in hist[:5]:
    print(f"  Epoch {step[0]}: w = {step[1]:.4f}, Loss = {step[2]:.4f}")
print("Final step:")
print(f"  Epoch {hist[-1][0]}: w = {hist[-1][1]:.4f}, Loss = {hist[-1][2]:.4f}")
assert abs(opt_w - 3.0) < 0.01
print("[PASSED] Convergence to Global Minimum Verified!")
`,
  },

  // --- Khan Academy Linear Algebra ---
  'khan-la-lec-1': {
    id: 'ex-vector-math-2d',
    title: '2D Vector Operations & Linear Combinations',
    language: 'python',
    difficulty: 'beginner',
    instructions:
      'Perform vector addition and linear combination c1 * v1 + c2 * v2 in 2D coordinate space.',
    starterCode: `def linear_combination(c1: float, v1: tuple[float, float], c2: float, v2: tuple[float, float]) -> tuple[float, float]:
    """Compute c1 * v1 + c2 * v2."""
    x = c1 * v1[0] + c2 * v2[0]
    y = c1 * v1[1] + c2 * v2[1]
    return (x, y)

# Standard basis vectors
i_hat = (1, 0)
j_hat = (0, 1)

# Linear combination: 3 * i_hat + (-2) * j_hat
v = linear_combination(3, i_hat, -2, j_hat)
print("Result vector:", v)
assert v == (3, -2)
print("[PASSED] Linear combination in standard basis verified!")
`,
  },

  'khan-la-lec-8': {
    id: 'ex-matrix-determinant',
    title: '2x2 Matrix Determinant & Invertibility',
    language: 'python',
    difficulty: 'intermediate',
    instructions:
      'Compute the 2x2 determinant det(A) = ad - bc. If non-zero, compute the inverse matrix A^(-1).',
    starterCode: `def det_2x2(matrix: list[list[float]]) -> float:
    a, b = matrix[0]
    c, d = matrix[1]
    return (a * d) - (b * c)

def inverse_2x2(matrix: list[list[float]]) -> list[list[float]] | None:
    det = det_2x2(matrix)
    if abs(det) < 1e-9:
        print("Determinant is 0: Matrix is non-invertible (squishes space)!")
        return None
    a, b = matrix[0]
    c, d = matrix[1]
    inv_det = 1.0 / det
    return [
        [d * inv_det, -b * inv_det],
        [-c * inv_det, a * inv_det]
    ]

A = [[4, 7], [2, 6]]
det_A = det_2x2(A)
inv_A = inverse_2x2(A)

print("Matrix A:", A)
print(f"det(A) = {det_A}")
print("Inverse A^(-1):", inv_A)
`,
  },
};

/**
 * Fallback generator for lectures without a specialized exercise:
 * Generates an interactive Python sandbox with context from the lecture.
 */
export function getLectureCodeExercise(lecture: Partial<Lecture> | null): CodeExercise | null {
  if (!lecture) return null;

  // 1. Direct ID match
  const lecId = lecture.id || '';
  if (CURATED_LECTURE_EXERCISES[lecId]) {
    return CURATED_LECTURE_EXERCISES[lecId];
  }

  // 2. Keyword heuristic matching
  const title = (lecture.title || '').toLowerCase();
  const concept = (lecture.conceptName || '').toLowerCase();
  const combined = `${title} ${concept}`;

  if (combined.includes('peak finding')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-1'];
  if (combined.includes('merge sort') || combined.includes('insertion sort')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-3'];
  if (combined.includes('heap')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-4'];
  if (combined.includes('bst') || combined.includes('binary search tree')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-5'];
  if (combined.includes('hash')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-8'];
  if (combined.includes('breadth-first') || combined.includes('bfs')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-13'];
  if (combined.includes('dijkstra')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-16'];
  if (combined.includes('dynamic programming') || combined.includes('fibonacci')) return CURATED_LECTURE_EXERCISES['mit-6006-lec-19'];
  if (combined.includes('bisection')) return CURATED_LECTURE_EXERCISES['mitx-600-lec-3'];
  if (combined.includes('gradient descent')) return CURATED_LECTURE_EXERCISES['nptel-ml-lec-18'];
  if (combined.includes('numpy')) return CURATED_LECTURE_EXERCISES['swayam-ds-lec-3'];
  if (combined.includes('pandas')) return CURATED_LECTURE_EXERCISES['swayam-ds-lec-5'];
  if (combined.includes('determinant') || combined.includes('inverse')) return CURATED_LECTURE_EXERCISES['khan-la-lec-8'];
  if (combined.includes('norm')) return CURATED_LECTURE_EXERCISES['nptel-ml-lec-5'];

  // 3. Fallback generic Python coding environment tailored to this lecture
  return {
    id: `sandbox-${lecture.id || 'general'}`,
    title: `${lecture.title || 'Lecture'} Code Sandbox`,
    language: 'python',
    difficulty: 'beginner',
    instructions: `Interactive Python environment for ${lecture.title || 'this lecture'}. Write algorithms, test formulas, or experiment with concepts from the video:`,
    starterCode: `# Practice Python algorithms for: ${lecture.title || 'Lecture'}
# Concept: ${lecture.conceptName || 'Core Foundations'}

def experiment():
    print("Welcome to KnowTrace Coding Environment!")
    print("Practicing concepts for: ${lecture.title || 'Current Topic'}")
    
    # Write your algorithmic implementation below:
    data = [10, 20, 30, 40, 50]
    total = sum(data)
    average = total / len(data)
    
    return {"total": total, "average": average}

result = experiment()
print("Execution Result:", result)
`,
    hints: ['Click "Run Code" or press Ctrl+Enter to execute this Python code immediately.'],
  };
}
