import json

mit_lectures = [
    {
        "id": "mit-6042-lec-1",
        "module_title": "Unit 1: Proofs & Propositional Logic",
        "order": 1,
        "title": "Lecture 1: Introduction and Proofs",
        "duration_minutes": 80,
        "youtube_id": "L3LMbpZIKhQ",
        "concept_name": "Propositional Logic & Proofs",
        "notes": [
            "A mathematical proof verifies a proposition by logical deduction from axioms.",
            "Propositional logic: statements that are strictly true or false, combined with AND, OR, NOT, and implication.",
            "Proof by contradiction: to prove P, assume NOT P and deduce a logical impossibility.",
            "Well Ordering Principle: every non-empty set of non-negative integers contains a minimum element.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Welcome to 6.042J, Mathematics for Computer Science. I am Tom Leighton.",
            },
            {
                "seconds": 150,
                "timestamp": "02:30",
                "text": "Why do computer scientists need math? Because complex programs must be provably correct before deployment.",
            },
            {
                "seconds": 495,
                "timestamp": "08:15",
                "text": "What is a mathematical proof? A proof is a verification of a proposition by a chain of deductions from axioms.",
            },
            {
                "seconds": 1000,
                "timestamp": "16:40",
                "text": "In propositional logic, propositions are assertions that evaluate to True or False.",
            },
            {
                "seconds": 1690,
                "timestamp": "28:10",
                "text": "Proof by contradiction: assume the hypothesis is false, and derive a contradiction like 1 = 0.",
            },
            {
                "seconds": 2540,
                "timestamp": "42:20",
                "text": "The Well Ordering Principle: any non-empty set of non-negative integers has a unique least element.",
            },
            {
                "seconds": 3900,
                "timestamp": "65:00",
                "text": "Next time, we will use the Well Ordering Principle to derive the Principle of Mathematical Induction.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 1 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes01/",
            },
            {
                "title": "Problem Set 1",
                "type": "assignment",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_pset01/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-2",
        "module_title": "Unit 1: Proofs & Propositional Logic",
        "order": 2,
        "title": "Lecture 2: Induction",
        "duration_minutes": 75,
        "youtube_id": "z8HKWUWS-lA",
        "concept_name": "Mathematical Induction",
        "notes": [
            "Principle of Mathematical Induction: prove Base Case P(0), then Induction Step P(n) => P(n+1).",
            "Domino analogy: knocking over domino 0 knocks over all subsequent dominoes.",
            "Pitfall alert: faulty base cases can lead to fallacious proofs (e.g., 'all horses are the same color').",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Today we dive into the Principle of Mathematical Induction.",
            },
            {
                "seconds": 310,
                "timestamp": "05:10",
                "text": "The domino analogy: you show the first domino falls, and whenever one falls, the next one does too.",
            },
            {
                "seconds": 1110,
                "timestamp": "18:30",
                "text": "Beware false induction proofs where boundary cases don't overlap properly.",
            },
            {
                "seconds": 2700,
                "timestamp": "45:00",
                "text": "Applying induction to geometric tiling and arithmetic series summation.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 2 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes02/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-3",
        "module_title": "Unit 1: Proofs & Propositional Logic",
        "order": 3,
        "title": "Lecture 3: Strong Induction",
        "duration_minutes": 78,
        "youtube_id": "NuGDkmwEObM",
        "concept_name": "Strong Induction & Invariants",
        "notes": [
            "Strong induction: hypothesis assumes P(0), P(1), ..., up to P(n) are all true to prove P(n+1).",
            "State machines and transition invariants for algorithmic safety.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Welcome back. Today: Strong Induction and Invariant Principles.",
            },
            {
                "seconds": 450,
                "timestamp": "07:30",
                "text": "In strong induction, your induction hypothesis is stronger: you assume all previous steps held.",
            },
            {
                "seconds": 1800,
                "timestamp": "30:00",
                "text": "The fundamental theorem of arithmetic proven via strong induction.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 3 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes03/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-4",
        "module_title": "Unit 2: Structures, Number Theory & Cryptography",
        "order": 4,
        "title": "Lecture 4: Number Theory I",
        "duration_minutes": 82,
        "youtube_id": "NuY7szYSXSw",
        "concept_name": "Number Theory I: GCD & Linear Combinations",
        "notes": [
            "Divisibility, linear combinations, and greatest common divisor.",
            "The Euclidean Algorithm: finding GCD in logarithmic steps.",
            "Water jug problem as an illustration of linear combinations.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Welcome to Number Theory. Today we explore divisibility and linear combinations.",
            },
            {
                "seconds": 420,
                "timestamp": "07:00",
                "text": "The Die Hard water jug problem: can you measure exactly 4 gallons using 3 and 5 gallon jugs?",
            },
            {
                "seconds": 1800,
                "timestamp": "30:00",
                "text": "The Euclidean algorithm computes the GCD by repeated division with remainder.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 4 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes04/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-5",
        "module_title": "Unit 2: Structures, Number Theory & Cryptography",
        "order": 5,
        "title": "Lecture 5: Number Theory II",
        "duration_minutes": 78,
        "youtube_id": "XX7ePR21Ook",
        "concept_name": "Number Theory II: Modular Arithmetic & RSA",
        "notes": [
            "Modular congruence: a ≡ b (mod m).",
            "Multiplicative inverses modulo m and Euler's Totient function.",
            "RSA Public Key Cryptosystem: encryption, decryption, and prime factorization.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Today we dive into modular arithmetic and the foundation of modern cryptography: RSA.",
            },
            {
                "seconds": 600,
                "timestamp": "10:00",
                "text": "Modular arithmetic behaves like clock arithmetic, where numbers wrap around after modulus m.",
            },
            {
                "seconds": 2100,
                "timestamp": "35:00",
                "text": "RSA public key encryption: how two large primes enable secure communication across untrusted networks.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 5 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes05/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-6",
        "module_title": "Unit 3: Graph Theory & Communication Networks",
        "order": 6,
        "title": "Lecture 6: Graph Theory I",
        "duration_minutes": 80,
        "youtube_id": "h9wxtqoa1jY",
        "concept_name": "Graph Theory I: Fundamentals & Paths",
        "notes": [
            "Graph definitions: vertices, edges, degree, handshaking lemma.",
            "Paths, cycles, connectivity, and bipartite graphs.",
            "Eulerian paths and Seven Bridges of Königsberg problem.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Graphs model networks, data structures, and state transitions in computer science.",
            },
            {
                "seconds": 720,
                "timestamp": "12:00",
                "text": "Every edge has two endpoints, leading to the fundamental Handshaking Lemma.",
            },
            {
                "seconds": 2400,
                "timestamp": "40:00",
                "text": "Bipartite graphs and two-coloring theorems.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 6 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes06/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-7",
        "module_title": "Unit 3: Graph Theory & Communication Networks",
        "order": 7,
        "title": "Lecture 7: Graph Theory II",
        "duration_minutes": 75,
        "youtube_id": "5RSMLgy06Ew",
        "concept_name": "Graph Theory II: Trees & Spanning Trees",
        "notes": [
            "Trees: definition, properties, and equivalent characterizations.",
            "Minimum Spanning Trees: Kruskal's and Prim's greedy algorithms.",
            "Cut property and cycle property for spanning tree optimization.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Today we explore trees: the most important class of graphs in computer science.",
            },
            {
                "seconds": 540,
                "timestamp": "09:00",
                "text": "A tree with n vertices always has exactly n - 1 edges.",
            },
            {
                "seconds": 2100,
                "timestamp": "35:00",
                "text": "The Minimum Spanning Tree problem and greedy algorithmic proofs.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 7 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes07/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-8",
        "module_title": "Unit 3: Graph Theory & Communication Networks",
        "order": 8,
        "title": "Lecture 8: Communication Networks",
        "duration_minutes": 76,
        "youtube_id": "GJpt_3ie4WU",
        "concept_name": "Communication Networks: Routing & Congestion",
        "notes": [
            "Routing networks: complete binary trees, 2D arrays, Butterfly networks, Beneš networks.",
            "Network diameter, switch count, and congestion bounds.",
            "Permutation routing algorithms.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "How do supercomputers and network switches connect thousands of processors efficiently?",
            },
            {
                "seconds": 600,
                "timestamp": "10:00",
                "text": "Comparing grid networks vs Butterfly networks: diameter vs hardware complexity.",
            },
            {
                "seconds": 2200,
                "timestamp": "36:40",
                "text": "The Beneš network achieves non-blocking permutation routing.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 8 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes08/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-9",
        "module_title": "Unit 3: Graph Theory & Communication Networks",
        "order": 9,
        "title": "Lecture 9: Graph Theory III",
        "duration_minutes": 78,
        "youtube_id": "bTyxpoi2dmM",
        "concept_name": "Graph Coloring & Planarity",
        "notes": [
            "Vertex coloring and chromatic number.",
            "Planar graphs and Euler's formula V - E + F = 2.",
            "Four color theorem and map coloring applications.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Graph coloring: allocating radio frequencies and register allocation in compilers.",
            },
            {
                "seconds": 660,
                "timestamp": "11:00",
                "text": "Euler's formula for planar graphs: vertices minus edges plus faces equals 2.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 9 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes09/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-10",
        "module_title": "Unit 3: Graph Theory & Communication Networks",
        "order": 10,
        "title": "Lecture 10: Relations & Partial Orders",
        "duration_minutes": 80,
        "youtube_id": "DOIp5D7VMS4",
        "concept_name": "Relations, Partial Orders & Scheduling",
        "notes": [
            "Binary relations: reflexive, symmetric, transitive properties.",
            "Partial orders, Hasse diagrams, topological sorting.",
            "Dilworth's theorem and task scheduling with parallel processors.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Partial orders formalize dependency and prerequisite relationships in scheduling.",
            },
            {
                "seconds": 720,
                "timestamp": "12:00",
                "text": "Topological sort: ordering tasks so every dependency is satisfied in time.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 10 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes10/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-11",
        "module_title": "Unit 4: Counting, Recurrences & Generating Functions",
        "order": 11,
        "title": "Lecture 11: State Machines & Invariants",
        "duration_minutes": 74,
        "youtube_id": "1nScXLQAQ9A",
        "concept_name": "State Machines & Invariants",
        "notes": [
            "State machine formalisms: states, transitions, reachability.",
            "Invariant principle: if P holds initially and is preserved across transitions, it holds for all reachable states.",
            "Termination proofs via well-founded partial orders.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "State machines formalize executing algorithms, communication protocols, and processors.",
            },
            {
                "seconds": 600,
                "timestamp": "10:00",
                "text": "The Invariant Principle: an invariant holds at start and survives all transitions.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 11 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes11/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-12",
        "module_title": "Unit 4: Counting, Recurrences & Generating Functions",
        "order": 12,
        "title": "Lecture 12: Sums & Asymptotics",
        "duration_minutes": 82,
        "youtube_id": "fAeShezAGLE",
        "concept_name": "Sums, Integrals & Asymptotics (Big-O)",
        "notes": [
            "Evaluating finite sums: geometric series, arithmetic series.",
            "Approximating sums with integrals.",
            "Asymptotic notation: Big-O, Big-Omega, Big-Theta, Stirling's approximation.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Today we develop mathematical tools to bound sums and evaluate computational runtime.",
            },
            {
                "seconds": 900,
                "timestamp": "15:00",
                "text": "Big-O notation: characterizing scaling behavior while ignoring constant factors.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 12 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes12/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-13",
        "module_title": "Unit 4: Counting, Recurrences & Generating Functions",
        "order": 13,
        "title": "Lecture 13: Divide & Conquer Recurrences",
        "duration_minutes": 80,
        "youtube_id": "X9eErxRjQEI",
        "concept_name": "Recurrences & Master Theorem",
        "notes": [
            "Linear recurrences and characteristic equations.",
            "Divide and conquer recurrences: Merge Sort, binary search.",
            "Akra-Bazzi and Master Theorem for algorithmic recurrences.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Solving recurrences: from Fibonacci numbers to divide-and-conquer runtime analysis.",
            },
            {
                "seconds": 780,
                "timestamp": "13:00",
                "text": "The Master Theorem gives instant asymptotic bounds for recurrences of form T(n) = aT(n/b) + f(n).",
            },
        ],
        "resources": [
            {
                "title": "Lecture 13 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes13/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-14",
        "module_title": "Unit 4: Counting, Recurrences & Generating Functions",
        "order": 14,
        "title": "Lecture 14: Counting I: Permutations & Combinations",
        "duration_minutes": 75,
        "youtube_id": "Kqf0uO0oV6s",
        "concept_name": "Combinatorics: Permutations & Combinations",
        "notes": [
            "Product rule, sum rule, division rule, generalized pigeonhole principle.",
            "Permutations: n! / (n - k)!, Combinations: n choose k.",
            "Stars and bars method for indistinguishable object placement.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Combinatorics is the art of counting structures without listing them individually.",
            },
            {
                "seconds": 600,
                "timestamp": "10:00",
                "text": "Binomial coefficients: n choose k and Pascal's Identity.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 14 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes14/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-15",
        "module_title": "Unit 4: Counting, Recurrences & Generating Functions",
        "order": 15,
        "title": "Lecture 15: Counting II: Inclusion-Exclusion",
        "duration_minutes": 78,
        "youtube_id": "TWBB-JlmYUc",
        "concept_name": "Inclusion-Exclusion & Pigeonhole Principle",
        "notes": [
            "Principle of Inclusion-Exclusion for union of arbitrary sets.",
            "Derangements and hat-check problem.",
            "Pigeonhole principle and combinatorial proofs.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "When sets overlap, simple addition overcounts; we apply the Principle of Inclusion-Exclusion.",
            },
            {
                "seconds": 720,
                "timestamp": "12:00",
                "text": "Derangements: permutations where no element appears in its original position.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 15 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes15/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-16",
        "module_title": "Unit 4: Counting, Recurrences & Generating Functions",
        "order": 16,
        "title": "Lecture 16: Generating Functions",
        "duration_minutes": 80,
        "youtube_id": "pNt5Ll6hGqo",
        "concept_name": "Ordinary Generating Functions",
        "notes": [
            "Generating functions: encoding infinite sequences as formal power series coefficients.",
            "Operations on generating functions: convolution, scaling, partial fractions.",
            "Solving linear recurrences via generating functions.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Generating functions turn combinatorial questions into algebra on polynomials.",
            },
            {
                "seconds": 840,
                "timestamp": "14:00",
                "text": "Using partial fraction expansion to extract exact closed-form sequence expressions.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 16 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes16/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-17",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 17,
        "title": "Lecture 17: Probability I: Discrete Probability",
        "duration_minutes": 82,
        "youtube_id": "09yIb3VHhMI",
        "concept_name": "Discrete Probability & Sample Spaces",
        "notes": [
            "Probability spaces: sample spaces, outcomes, events, probability functions.",
            "Four step method: tree diagrams, outcomes, assigning probabilities, summing events.",
            "Monty Hall problem and birthday paradox.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Welcome to Probability. In computer science, randomized algorithms unlock speed and simplicity.",
            },
            {
                "seconds": 600,
                "timestamp": "10:00",
                "text": "The Monty Hall problem: why switching doors doubles your probability of winning.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 17 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes17/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-18",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 18,
        "title": "Lecture 18: Probability II: Conditional Probability",
        "duration_minutes": 78,
        "youtube_id": "SmFwFdESMHI",
        "concept_name": "Conditional Probability & Bayes' Rule",
        "notes": [
            "Conditional probability definition: P(A | B) = P(A ∩ B) / P(B).",
            "Law of total probability and Bayes' Theorem.",
            "Medical test false positives and base rate fallacy.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Conditional probability formalizes how new evidence updates our belief in hypotheses.",
            },
            {
                "seconds": 780,
                "timestamp": "13:00",
                "text": "Bayes' Rule: reversing conditional probabilities in diagnostics and spam filtering.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 18 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes18/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-19",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 19,
        "title": "Lecture 19: Independence & Random Variables",
        "duration_minutes": 80,
        "youtube_id": "E6FbvM-FGZ8",
        "concept_name": "Independent Events & Random Variables",
        "notes": [
            "Independent events: P(A ∩ B) = P(A) * P(B). Pairwise vs mutual independence.",
            "Random variables: mapping sample space to real numbers.",
            "Probability density functions (PDF) and cumulative distribution functions (CDF).",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Independent events: knowledge of one event gives zero information about the other.",
            },
            {
                "seconds": 720,
                "timestamp": "12:00",
                "text": "Random variables are functions, not variables, mapping outcomes to real numbers.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 19 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes19/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-20",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 20,
        "title": "Lecture 20: Expectation & Linearity",
        "duration_minutes": 76,
        "youtube_id": "l1BCv3qqW4A",
        "concept_name": "Expected Value & Linearity of Expectation",
        "notes": [
            "Expected value definition: sum over outcomes x * P(X = x).",
            "Linearity of Expectation: E[X + Y] = E[X] + E[Y], holds even when X and Y are dependent!",
            "Indicator random variables and hat-check problem analysis.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Linearity of Expectation is one of the most powerful tools in all of algorithm analysis.",
            },
            {
                "seconds": 660,
                "timestamp": "11:00",
                "text": "Notice that E[X + Y] = E[X] + E[Y] does NOT require independence whatsoever!",
            },
        ],
        "resources": [
            {
                "title": "Lecture 20 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes20/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-21",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 21,
        "title": "Lecture 21: Variance & Deviation",
        "duration_minutes": 80,
        "youtube_id": "MOfhhFaQdjw",
        "concept_name": "Variance, Standard Deviation & Markov/Chebyshev",
        "notes": [
            "Variance definition: Var(X) = E[(X - E[X])^2] = E[X^2] - E[X]^2.",
            "Markov's Inequality for non-negative random variables.",
            "Chebyshev's Inequality: bounding probability of deviations from mean.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Expectation tells you the center of mass; Variance measures the dispersion.",
            },
            {
                "seconds": 800,
                "timestamp": "13:20",
                "text": "Markov's Inequality: P(R >= c * E[R]) <= 1 / c.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 21 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes21/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-22",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 22,
        "title": "Lecture 22: Sampling & Confidence",
        "duration_minutes": 78,
        "youtube_id": "gGlMSe7uEkA",
        "concept_name": "Law of Large Numbers & Sampling Bounds",
        "notes": [
            "Weak Law of Large Numbers.",
            "Estimating population proportions via random polling samples.",
            "Chernoff bounds for sum of independent bounded random variables.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "How large of a sample do political pollsters or AI test sets need to guarantee accuracy?",
            },
            {
                "seconds": 750,
                "timestamp": "12:30",
                "text": "Chernoff bounds provide exponential decay tails for sums of independent trials.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 22 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes22/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-23",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 23,
        "title": "Lecture 23: Central Limit Theorem",
        "duration_minutes": 82,
        "youtube_id": "oI9fMUqgfxY",
        "concept_name": "Central Limit Theorem & Normal Distribution",
        "notes": [
            "Central Limit Theorem: normalized sum of i.i.d. random variables converges to Gaussian distribution.",
            "Normal / Gaussian bell curve: properties and standard deviation rules (68-95-99.7).",
            "Approximating binomial distributions with continuous normal densities.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "The Central Limit Theorem explains why the Bell Curve appears ubiquitously across nature and science.",
            },
            {
                "seconds": 840,
                "timestamp": "14:00",
                "text": "Regardless of the underlying distribution, averages of independent draws converge to the Normal curve.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 23 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes23/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-24",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 24,
        "title": "Lecture 24: Random Walks",
        "duration_minutes": 75,
        "youtube_id": "q4mwO2qS2z4",
        "concept_name": "Random Walks & Gambler's Ruin",
        "notes": [
            "1D Random walks on the integer line.",
            "Gambler's Ruin problem: probability of hitting goal before bankruptcy.",
            "PageRank algorithm: random surfer model on the World Wide Web graph.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Random walks model diffusion in physics, stock movements, and Google's original PageRank.",
            },
            {
                "seconds": 720,
                "timestamp": "12:00",
                "text": "Gambler's Ruin: showing why fairness in games still guarantees eventual ruin against a wealthy house.",
            },
        ],
        "resources": [
            {
                "title": "Lecture 24 Notes (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes24/",
            },
        ],
    },
    {
        "id": "mit-6042-lec-25",
        "module_title": "Unit 5: Probability, Expectation & Random Walks",
        "order": 25,
        "title": "Lecture 25: Course Review & Conclusions",
        "duration_minutes": 80,
        "youtube_id": "56iFMY8QW2k",
        "concept_name": "Final Review: Proofs, Structures, Counting & Probability",
        "notes": [
            "Synthesizing the core pillars of 6.042J: Proofs, Structures, Counting, and Probability.",
            "How discrete mathematics underlies all algorithm design and complexity theory.",
            "Final exam preparation tips and concluding reflections.",
        ],
        "transcript": [
            {
                "seconds": 0,
                "timestamp": "00:00",
                "text": "Congratulations on completing 6.042J! Today we tie together all four pillars of the course.",
            },
            {
                "seconds": 600,
                "timestamp": "10:00",
                "text": "From propositional proofs to random walks, these mathematical foundations empower your computer science journey.",
            },
        ],
        "resources": [
            {
                "title": "Final Exam Review (PDF)",
                "type": "pdf",
                "url": "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_final_review/",
            },
        ],
    },
]

print(f"Generated {len(mit_lectures)} complete MIT 6.042J lectures.")
with open("s:/knowTrace/mit_lectures_data.json", "w") as f:
    json.dump(mit_lectures, f, indent=2)
print("Saved to mit_lectures_data.json")
