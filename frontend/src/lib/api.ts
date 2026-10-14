import {
  Course,
  CourseMaterial,
  Concept,
  KnowledgeGraphData,
  TutorMessage,
  SourceDocument,
  QuizAttempt,
  UserQuestionSubmission,
  QuestionFeedbackResult,
  Misconception,
  StudyPlanBlock,
  PlanUpdateDiff,
  EvaluationMetrics,
  ProcessingPipelineStatus,
  Citation,
  Lecture,
  CourseLecturesResponse,
  CourseCertificateDetails,
} from '@/types';
import {
  INITIAL_COURSE,
  INITIAL_MATERIALS,
  INITIAL_CONCEPTS,
  INITIAL_KNOWLEDGE_GRAPH,
  INITIAL_TUTOR_MESSAGES,
  INITIAL_QUIZ_QUESTIONS,
  INITIAL_MISCONCEPTIONS,
  INITIAL_PLAN_DIFFS,
  EVALUATION_METRICS,
  SOURCE_DOCUMENTS,
} from './mockData';
import {
  CatalogCourse,
  CatalogCourseDetail,
  PlatformInfo,
  SourcePlatform,
  AccessType,
  UnifiedSearchResponse,
} from '@/types/discover';
import { MOCK_CATALOG_COURSES } from './mockDiscoverData';
import {
  MIT_OCW_25_LECTURES_FALLBACK,
  ALGORITHMS_24_LECTURES_FALLBACK,
  NPTEL_ML_20_LECTURES_FALLBACK,
  MITX_PYTHON_12_LECTURES_FALLBACK,
  SWAYAM_DS_8_LECTURES_FALLBACK,
  KHAN_ACADEMY_8_LECTURES_FALLBACK,
} from './courseLecturesFallback';

// Storage keys
const STORAGE_PREFIX = 'knowtrace_';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to read from localStorage: ${key}`, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write to localStorage: ${key}`, e);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_PREFIX + 'auth_token');
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(STORAGE_PREFIX + 'auth_token', token);
  } else {
    window.localStorage.removeItem(STORAGE_PREFIX + 'auth_token');
  }
}

export function authHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Global in-memory / storage sync with live backend connectivity
export const api = {
  // --- AUTHENTICATION ---
  async register(name: string, email: string, password: string): Promise<{ access_token: string; user: { id: string; email: string; name: string | null } }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  async login(email: string, password: string): Promise<{ access_token: string; user: { id: string; email: string; name: string | null } }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid email or password');
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  async getMe(): Promise<{ id: string; email: string; name: string | null } | null> {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: authHeaders({ Accept: 'application/json' }),
      });
      if (res.ok) return await res.json();
      if (res.status === 401) {
        setAuthToken(null);
        return null;
      }
    } catch {
      return null;
    }
    return null;
  },

  logout(): void {
    setAuthToken(null);
  },

  // --- COURSES ---
  async getCourse(id: string): Promise<Course> {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const courses = getStorage<Record<string, Course>>('courses', {
          [INITIAL_COURSE.id]: INITIAL_COURSE,
        });
        const existingLocal = courses[String(data.id)];
        const course: Course = {
          id: String(data.id),
          name: data.title || 'Course',
          domain: data.category || 'Computer Science',
          examDate: data.exam_date || '',
          hoursAvailablePerDay: data.hours_per_day || 2,
          targetMastery: 80,
          createdAt: data.created_at ? String(data.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
          materialsCount: 2,
          conceptCount: 6,
          overallMastery: existingLocal?.overallMastery ?? 65,
          activeMisconceptionsCount: existingLocal?.activeMisconceptionsCount ?? 0,
          source_platform: data.source_platform,
          source_id: data.source_id,
          source_url: data.source_url,
          access_type: data.access_type,
          instructor: data.instructor,
          institution: data.institution,
          certificate_available: Boolean(data.certificate_available ?? true),
        };
        courses[course.id] = course;
        setStorage('courses', courses);
        return course;
      }
    } catch {
      // Backend unavailable or network error, proceed to fallback
    }

    const courses = getStorage<Record<string, Course>>('courses', {
      [INITIAL_COURSE.id]: INITIAL_COURSE,
    });
    if (!courses[id]) {
      return { ...INITIAL_COURSE, id, certificate_available: true };
    }
    return courses[id];
  },

  async getAllCourses(): Promise<Course[]> {
    // Locally created / offline-enrolled courses only. The seeded demo course
    // (INITIAL_COURSE) must never appear in the user's enrolled workspace.
    const localCourses = getStorage<Record<string, Course>>('courses', {});
    if (localCourses[INITIAL_COURSE.id]) {
      delete localCourses[INITIAL_COURSE.id];
      setStorage('courses', localCourses);
    }
    const localList = Object.values(localCourses).filter(
      (c) => c.id !== INITIAL_COURSE.id
    );

    if (!getAuthToken()) {
      // Signed out: there are no enrolled courses to show from the backend.
      return localList;
    }

    try {
      // Authenticated: the backend returns only courses owned by this user
      // (i.e., courses enrolled via Discover or created in this workspace).
      const res = await fetch(`${API_BASE}/courses`, {
        headers: authHeaders({ Accept: 'application/json' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const enrolled: Course[] = data.map((item: Record<string, unknown>) => ({
            id: String(item.id),
            name: (item.title as string) || 'Untitled Course',
            domain: (item.category as string) || 'Computer Science',
            examDate: (item.exam_date as string) || '',
            hoursAvailablePerDay: (item.hours_per_day as number) || 2,
            targetMastery: 80,
            createdAt: item.created_at ? String(item.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
            materialsCount: 2,
            conceptCount: 6,
            overallMastery: 72,
            activeMisconceptionsCount: 1,
            source_platform: item.source_platform as Course['source_platform'],
            source_id: item.source_id as string,
            source_url: item.source_url as string,
            access_type: item.access_type as Course['access_type'],
            instructor: item.instructor as string,
            institution: item.institution as string,
            certificate_available: Boolean(item.certificate_available ?? true),
          }));
          // Cache the user's real enrolled courses for offline display
          setStorage('enrolled_courses', enrolled);
          return enrolled;
        }
      }
    } catch {
      // Backend unreachable — fall through to the cached snapshot below
    }

    // Backend unreachable: show the last known enrolled courses (never the demo mock)
    return getStorage<Course[]>('enrolled_courses', []);
  },

  async createCourse(data: {
    name: string;
    domain: string;
    examDate: string;
    hoursAvailablePerDay: number;
    targetMastery: number;
  }): Promise<Course> {
    let backendId: string | null = null;
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
        body: JSON.stringify({
          title: data.name,
          exam_date: data.examDate || null,
          hours_per_day: data.hoursAvailablePerDay || 2,
        }),
      });
      if (res.ok) {
        const resJson = await res.json();
        backendId = resJson.course_id ? String(resJson.course_id) : null;
      }
    } catch {
      // Fallback to local generated ID
    }

    const courses = getStorage<Record<string, Course>>('courses', {
      [INITIAL_COURSE.id]: INITIAL_COURSE,
    });
    const id = backendId || 'course-' + Date.now();
    const newCourse: Course = {
      id,
      name: data.name,
      domain: data.domain || 'General',
      examDate: data.examDate,
      hoursAvailablePerDay: data.hoursAvailablePerDay || 2,
      targetMastery: data.targetMastery || 80,
      createdAt: new Date().toISOString().split('T')[0],
      materialsCount: 0,
      conceptCount: 0,
      overallMastery: 0,
      activeMisconceptionsCount: 0,
    };
    courses[id] = newCourse;
    setStorage('courses', courses);
    return newCourse;
  },

  // --- MATERIALS & UPLOAD ---
  async getMaterials(courseId: string): Promise<CourseMaterial[]> {
    const all = getStorage<CourseMaterial[]>('materials_' + courseId, INITIAL_MATERIALS);
    return all;
  },

  async uploadMaterial(
    courseId: string,
    file: { name: string; type: 'pdf' | 'ppt' | 'pptx' | 'video'; size: string; rawFile?: File }
  ): Promise<CourseMaterial> {
    // Attempt backend upload if a real File is provided or via synthesized payload
    try {
      const formData = new FormData();
      if (file.rawFile) {
        formData.append('files', file.rawFile, file.name);
      } else {
        const dummyBlob = new Blob(['KnowTrace Course Document Content'], { type: 'text/plain' });
        formData.append('files', dummyBlob, file.name);
      }
      await fetch(`${API_BASE}/courses/${courseId}/sources`, {
        method: 'POST',
        body: formData,
      });
    } catch {
      // Continue locally
    }

    const materials = await this.getMaterials(courseId);
    const newMat: CourseMaterial = {
      id: 'mat-' + Date.now(),
      courseId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toLocaleString(),
      status: 'upload',
      progress: 0,
      chunksCount: 0,
      figuresCount: 0,
      keyframesCount: 0,
    };
    materials.push(newMat);
    setStorage('materials_' + courseId, materials);
    return newMat;
  },

  async removeMaterial(courseId: string, materialId: string): Promise<void> {
    const materials = await this.getMaterials(courseId);
    const filtered = materials.filter((m) => m.id !== materialId);
    setStorage('materials_' + courseId, filtered);
  },

  // --- PROCESSING STATUS ---
  async getProcessingStatus(courseId: string): Promise<ProcessingPipelineStatus> {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/processing-status`);
      if (res.ok) {
        const data = await res.json();
        if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
          const totalChunks = data.sources.reduce((sum: number, s: { chunks_created?: number }) => sum + (s.chunks_created || 0), 0);
          return {
            overallProgress: 100,
            currentStage: 'complete',
            isComplete: true,
            hasError: false,
            stats: {
              chunks: totalChunks > 0 ? totalChunks : 456,
              figures: 36,
              keyframes: 9,
              tokens: 182400,
            },
            steps: [
              { id: 'upload', label: 'File Upload', description: 'Course materials uploaded', status: 'completed' },
              { id: 'parse', label: 'Document Parsing', description: 'PDF text & layout extracted', status: 'completed' },
              { id: 'ocr', label: 'OCR & Vision', description: 'Mathematical formulas & figures detected', status: 'completed' },
              { id: 'transcription', label: 'Audio Transcription', description: 'Video speech transcribed with timestamps', status: 'completed' },
              { id: 'chunking', label: 'Semantic Chunking', description: 'Hierarchical passages segmented', status: 'completed' },
              { id: 'tagging', label: 'Concept Extraction', description: 'Knowledge nodes & prerequisites resolved', status: 'completed' },
              { id: 'embedding', label: 'Vector Indexing', description: 'Dense embeddings generated and indexed', status: 'completed' },
              { id: 'complete', label: 'Ready for Learning', description: 'Knowledge map and tutor ready', status: 'completed' },
            ],
          };
        }
      }
    } catch {
      // Fallback to storage or default
    }

    const stored = getStorage<ProcessingPipelineStatus | null>(
      'proc_status_' + courseId,
      null
    );
    if (stored) return stored;

    return {
      overallProgress: 100,
      currentStage: 'complete',
      isComplete: true,
      hasError: false,
      stats: {
        chunks: 456,
        figures: 36,
        keyframes: 9,
        tokens: 182400,
      },
      steps: [
        { id: 'upload', label: 'File Upload', description: 'Course materials uploaded', status: 'completed' },
        { id: 'parse', label: 'Document Parsing', description: 'PDF text & layout extracted', status: 'completed' },
        { id: 'ocr', label: 'OCR & Vision', description: 'Mathematical formulas & figures detected', status: 'completed' },
        { id: 'transcription', label: 'Audio Transcription', description: 'Video speech transcribed with timestamps', status: 'completed' },
        { id: 'chunking', label: 'Semantic Chunking', description: 'Hierarchical passages segmented', status: 'completed' },
        { id: 'tagging', label: 'Concept Extraction', description: 'Knowledge nodes & prerequisites resolved', status: 'completed' },
        { id: 'embedding', label: 'Vector Indexing', description: 'Dense embeddings generated and indexed', status: 'completed' },
        { id: 'complete', label: 'Ready for Learning', description: 'Knowledge map and tutor ready', status: 'completed' },
      ],
    };
  },

  // --- CONCEPTS & MASTERY ---
  async getConcepts(courseId: string): Promise<Concept[]> {
    try {
      const res = await fetch(`${API_BASE}/learner/mastery?course_id=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any, idx: number) => {
            const conceptId = String(item.concept?.id || item.concept_id || item.id || `concept-${idx}`);
            const conceptName = String(item.concept?.name || item.concept_name || item.name || `Concept ${idx + 1}`);
            const topicName = String(item.topic?.name || item.topic_name || item.topic || 'Core Curriculum');
            const desc = String(item.concept?.description || item.description || 'Core learning topic with Bayesian Knowledge Tracing');
            const pVal = typeof (item.p_eff ?? item.p) === 'number'
              ? (item.p_eff ?? item.p)
              : (idx % 3 === 0 ? 0.42 : idx % 3 === 1 ? 0.65 : 0.82);
            const mastery = Math.round(pVal * 100);
            return {
              id: conceptId,
              courseId,
              name: conceptName,
              topic: topicName,
              description: desc,
              mastery,
              uncertainty: Math.round((1 - pVal) * 40),
              lastPracticedDaysAgo: item.days_since_practice || (idx + 1),
              forgettingRisk: mastery < 50 ? 'high' : mastery < 75 ? 'medium' : 'low',
              importance: idx < 2 ? 'core' : 'prerequisite',
              prerequisites: [],
              relatedSourceIds: ['mat-pdf-1'],
              sampleQuestionsCount: 4,
            };
          });
        }
      }
    } catch {
      // Fallback
    }
    return getStorage<Concept[]>('concepts_' + courseId, INITIAL_CONCEPTS);
  },

  async getConcept(courseId: string, conceptId: string): Promise<Concept | null> {
    const concepts = await this.getConcepts(courseId);
    return concepts.find((c) => c.id === conceptId) || null;
  },

  // --- KNOWLEDGE GRAPH ---
  async getKnowledgeGraph(courseId: string): Promise<KnowledgeGraphData> {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/graph`);
      if (res.ok) {
        const data = await res.json();
        if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) {
          const concepts = await this.getConcepts(courseId);
          // Only show concept nodes (or topics if only topics exist)
          const rawNodes: any[] = data.nodes;
          const conceptNodes = rawNodes.filter((n) => n.type === 'concept');
          const displayNodes = conceptNodes.length > 0 ? conceptNodes : rawNodes;

          const nodes = displayNodes.map((n: any, idx: number) => {
            const matched = concepts.find(
              (c) => c.id === String(n.id) || c.name.toLowerCase() === String(n.name).toLowerCase()
            );
            const defaultMastery = idx % 3 === 0 ? 42 : idx % 3 === 1 ? 65 : 82;
            const mastery = matched?.mastery ?? (typeof n.mastery === 'number' ? n.mastery : defaultMastery);
            const col = idx % 3;
            const row = Math.floor(idx / 3);

            return {
              id: String(n.id),
              type: 'concept',
              position: { x: 80 + col * 320, y: 80 + row * 220 },
              data: {
                id: String(n.id),
                label: n.name,
                topic: n.type === 'concept' ? (matched?.topic || 'Curriculum Concept') : 'Topic Domain',
                mastery,
                uncertainty: matched?.uncertainty ?? 18,
                forgettingRisk: (mastery < 50 ? 'high' : mastery < 75 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
                isKeyConcept: idx === 0 || n.importance >= 1.0,
                misconceptionsCount: idx === 1 ? 1 : 0,
              },
            };
          });

          const nodeIds = new Set(nodes.map((n) => n.id));
          let edges = (data.edges || [])
            .map((e: any, idx: number) => {
              const source = String(e.source || e.from || '');
              const target = String(e.target || e.to || '');
              const relation = (e.kind === 'contains' || e.kind === 'confusable' ? e.kind : 'requires') as 'contains' | 'confusable' | 'requires';
              return {
                id: e.id || `edge-${idx}`,
                source,
                target,
                animated: relation !== 'confusable',
                label: relation,
                data: {
                  relation,
                  description: e.kind || relation,
                },
              };
            })
            .filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target) && e.source !== e.target);

          // If no edges connect the display nodes, connect them sequentially so it's a guaranteed connected DAG
          if (edges.length === 0 && nodes.length > 1) {
            edges = nodes.slice(0, -1).map((node, i) => ({
              id: `edge-seq-${i}`,
              source: node.id,
              target: nodes[i + 1].id,
              animated: true,
              label: 'requires',
              data: {
                relation: 'requires' as const,
                description: 'Prerequisite dependency',
              },
            }));
          }

          return { nodes, edges };
        }
      }
    } catch {
      // Fallback to initial graph
    }

    const concepts = await this.getConcepts(courseId);
    const graph = getStorage<KnowledgeGraphData>(
      'kg_' + courseId,
      INITIAL_KNOWLEDGE_GRAPH
    );
    const updatedNodes = graph.nodes.map((node) => {
      const match = concepts.find((c) => c.id === node.id || c.name.toLowerCase() === node.data.label.toLowerCase());
      if (match) {
        return {
          ...node,
          data: {
            ...node.data,
            mastery: match.mastery,
            uncertainty: match.uncertainty,
            forgettingRisk: match.forgettingRisk,
          },
        };
      }
      return node;
    });
    return { ...graph, nodes: updatedNodes };
  },

  // --- TUTOR CHAT ---
  async getTutorMessages(courseId: string): Promise<TutorMessage[]> {
    const raw = getStorage<TutorMessage[]>('tutor_msgs_' + courseId, INITIAL_TUTOR_MESSAGES);
    const seen = new Set<string>();
    const unique = (raw || []).filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    if (unique.length !== (raw || []).length) {
      setStorage('tutor_msgs_' + courseId, unique);
    }
    return unique;
  },

  async sendTutorMessage(
    courseId: string,
    userText: string,
    allowOutsideKnowledge = false
  ): Promise<TutorMessage> {
    const messages = await this.getTutorMessages(courseId);
    const userMsg: TutorMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    messages.push(userMsg);

    // Live Backend Call
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          message: userText,
          allow_outside: allowOutsideKnowledge,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const mode = result.mode;
        const mappedMode: TutorMessage['mode'] =
          mode === 'grounded' || mode === 'source_backed' ? 'source-backed' :
          mode === 'not_covered' ? 'not-covered' :
          mode === 'outside' || mode === 'outside-knowledge' ? 'outside-knowledge' : 'partial';

        const citations: Citation[] = (result.sources || []).map((s: { chunk_id?: string; source_id?: string; page?: number; slide?: number; ts_start?: number; ts_end?: number; label?: string; type?: string; snippet?: string }, idx: number) => ({
          id: `cit-${s.chunk_id || idx}`,
          sourceId: s.source_id || 'mat-pdf-1',
          sourceTitle: s.page
            ? `Page ${s.page}`
            : s.slide
            ? `Slide ${s.slide}`
            : s.ts_start
            ? `Video @ ${Math.floor(s.ts_start)}s`
            : (s.label || 'Course Material'),
          sourceType: (s.type === 'video' ? 'video' : s.type === 'pptx' ? 'pptx' : 'pdf') as 'pdf' | 'pptx' | 'video',
          pageNumber: s.page || undefined,
          slideNumber: s.slide || undefined,
          timestamp: s.ts_start || undefined,
          duration: s.ts_end && s.ts_start ? s.ts_end - s.ts_start : undefined,
          snippet: s.snippet || '',
        }));

        let conf = 90;
        if (typeof result.confidence === 'number') {
          conf = Math.round(result.confidence * 100);
        } else if (result.confidence?.score) {
          conf = Math.round(result.confidence.score * 100);
        }

        const liveTutorMsg: TutorMessage = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'tutor',
          text: result.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: mappedMode,
          confidence: conf,
          citations: citations.length > 0 ? citations : undefined,
          outsideKnowledgeAvailable: result.outside_knowledge_offered || false,
          outsideKnowledgeText: result.outside_knowledge_offered ? 'General external reasoning available upon request.' : undefined,
        };

        messages.push(liveTutorMsg);
        setStorage('tutor_msgs_' + courseId, messages);
        return liveTutorMsg;
      }
    } catch {
      // Backend request error - gracefully execute knowledge fallback below
    }

    // Fallback response engine for standalone/demo usage
    let tutorMsg: TutorMessage;
    const lower = userText.toLowerCase();

    if (lower.includes('regularization') || lower.includes('l1') || lower.includes('l2') || lower.includes('lasso') || lower.includes('ridge')) {
      tutorMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'tutor',
        text: `Regularization prevents overfitting by adding a penalty to the loss function:

$$\\min_w \\mathcal{L}(w) + \\lambda \\Omega(w)$$

* **L2 Regularization (Ridge):** $\\Omega(w) = \\|w\\|_2^2$. The constraint boundary is a smooth hypersphere (circle in 2D). Expanding loss contours intersect the circle at non-zero coordinates, smoothly shrinking all weights without setting them to exact zero.
* **L1 Regularization (Lasso):** $\\Omega(w) = \\|w\\|_1$. The constraint boundary is a diamond (polytope) with sharp vertices along coordinate axes. Loss contours touch these sharp corners first, driving many feature coefficients to **exact zero** (sparsity).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'source-backed',
        confidence: 98,
        citations: [
          {
            id: 'cit-l1-pdf',
            sourceId: 'mat-pdf-1',
            sourceTitle: 'Lecture 04 — Page 42',
            sourceType: 'pdf',
            pageNumber: 42,
            snippet: 'When p=1 (Lasso), the penalty constraint forms a diamond in 2D with sharp corners along coordinate axes. Loss contours make first contact at a vertex where w_i = 0, inducing true parameter sparsity.',
          },
        ],
      };
    } else if (lower.includes('precision') || lower.includes('recall') || lower.includes('threshold') || lower.includes('false positive')) {
      tutorMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'tutor',
        text: `**Precision and Recall have an intrinsic trade-off** dictated by the classification threshold:

* $\\text{Precision} = \\frac{TP}{TP + FP}$ — "How reliable are our positive alerts?"
* $\\text{Recall} = \\frac{TP}{TP + FN}$ — "Did we capture all positive instances in reality?"

When you **increase the decision threshold (e.g. 0.5 → 0.8)**, the model becomes much more conservative:
1. False positives decrease dramatically → **Precision increases**.
2. Borderline true positives are missed as false negatives → **Recall decreases**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'source-backed',
        confidence: 95,
        citations: [
          {
            id: 'cit-pr-ppt',
            sourceId: 'mat-ppt-1',
            sourceTitle: 'Lecture 05 — Slide 14',
            sourceType: 'pptx',
            slideNumber: 14,
            snippet: 'Precision = TP / (TP + FP). Threshold sensitivity: Raising threshold from 0.5 to 0.8 reduces False Positives (Precision ↑), but causes more False Negatives (Recall ↓).',
          },
          {
            id: 'cit-pr-vid',
            sourceId: 'mat-video-1',
            sourceTitle: 'Lecture Video — 18:32',
            sourceType: 'video',
            timestamp: 1112,
            duration: 33,
            snippet: 'When you raise the threshold, you only classify items you are overwhelmingly confident in as positive. This drives down false positives, boosting precision. But you miss borderline positives, dropping recall.',
          },
        ],
      };
    } else if (lower.includes('quantum') || lower.includes('dna') || lower.includes('cooking') || lower.includes('weather') || lower.includes('capital of france')) {
      if (allowOutsideKnowledge) {
        tutorMsg = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'tutor',
          text: `This topic is **not covered in your course material**, but here is general information based on outside knowledge:

${userText.includes('capital') ? 'The capital of France is Paris.' : 'This concept lies outside the current CS 229 Machine Learning curriculum. Please consult specialized documentation for topics outside machine learning and optimization.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'outside-knowledge',
          confidence: 85,
        };
      } else {
        tutorMsg = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'tutor',
          text: `**Not covered in your course material.**

The uploaded course files (Lecture 04, Lecture 05, and Recitation Video) focus on Machine Learning Foundations: Optimization, Regularization, Model Evaluation, and Generalization.

Would you like to toggle **"Allow General Knowledge"** to receive an ungrounded response?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'not-covered',
          confidence: 99,
          outsideKnowledgeAvailable: true,
          outsideKnowledgeText: 'General reasoning available upon request.',
        };
      }
    } else {
      tutorMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'tutor',
        text: `Based on your course materials, this topic connects directly to model optimization and generalizability.

In **Lecture 04**, we establish that minimizing empirical training error alone risks overfitting when model capacity exceeds sample complexity. Optimization algorithms like Gradient Descent must be paired with either proper validation or penalty terms to guarantee test generalization.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'partial',
        confidence: 88,
        citations: [
          {
            id: 'cit-gen-pdf',
            sourceId: 'mat-pdf-1',
            sourceTitle: 'Lecture 04 — Page 14',
            sourceType: 'pdf',
            pageNumber: 14,
            snippet: 'Optimization algorithms like Gradient Descent must be paired with validation to guarantee test generalization.',
          },
        ],
      };
    }

    messages.push(tutorMsg);
    setStorage('tutor_msgs_' + courseId, messages);
    return tutorMsg;
  },

  // --- SOURCE VIEWER ---
  async getSourceDocument(sourceId: string): Promise<SourceDocument | null> {
    try {
      const res = await fetch(`${API_BASE}/chunks/${sourceId}`);
      if (res.ok) {
        const chunk = await res.json();
        return {
          id: chunk.id,
          courseId: chunk.course_id,
          title: chunk.page ? `Page ${chunk.page}` : chunk.slide ? `Slide ${chunk.slide}` : `Source Document`,
          type: chunk.modality === 'video' ? 'video' : chunk.modality === 'pptx' ? 'pptx' : 'pdf',
          fileSize: '1.2 MB',
          pagesContent: chunk.page ? [{
            pageNumber: chunk.page,
            heading: `Section - Page ${chunk.page}`,
            text: chunk.text,
            highlightSnippet: chunk.text.slice(0, 120),
            boundingBox: chunk.bbox || undefined,
          }] : undefined,
          videoUrl: chunk.modality === 'video' ? `${API_BASE}/courses/sources/${chunk.source_id}/file` : undefined,
          transcript: chunk.ts_start != null ? [{
            id: chunk.id,
            start: chunk.ts_start,
            end: chunk.ts_end || chunk.ts_start + 30,
            text: chunk.text,
          }] : undefined,
        };
      }
    } catch {
      // Fallback
    }
    return SOURCE_DOCUMENTS[sourceId] || null;
  },

  // --- QUIZZES ---
  async createQuizAttempt(
    courseId: string,
    options: {
      conceptIds: string[];
      questionCount: number;
      mode: 'adaptive' | 'mock';
    }
  ): Promise<QuizAttempt> {
    let candidateQuestions = [...INITIAL_QUIZ_QUESTIONS];
    if (options.conceptIds.length > 0) {
      candidateQuestions = candidateQuestions.filter((q) =>
        options.conceptIds.includes(q.conceptId)
      );
      if (candidateQuestions.length === 0) {
        candidateQuestions = [...INITIAL_QUIZ_QUESTIONS];
      }
    }

    const concepts = await this.getConcepts(courseId);
    candidateQuestions.sort((a, b) => {
      const cA = concepts.find((c) => c.id === a.conceptId)?.mastery ?? 50;
      const cB = concepts.find((c) => c.id === b.conceptId)?.mastery ?? 50;
      return cA - cB;
    });

    const chosen = candidateQuestions.slice(0, Math.min(options.questionCount, candidateQuestions.length));

    // Try backend assessment creation
    let backendAssessmentId: string | null = null;
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          kind: options.mode === 'adaptive' ? 'quiz' : 'mock',
          n: options.questionCount,
        }),
      });
      if (res.ok) {
        const resJson = await res.json();
        backendAssessmentId = resJson.assessment_id ? String(resJson.assessment_id) : null;
      }
    } catch {
      // Fallback to local ID
    }

    const attempt: QuizAttempt = {
      id: backendAssessmentId || 'quiz-' + Date.now(),
      courseId,
      title: options.mode === 'adaptive' ? 'Adaptive Diagnostic Quiz' : 'Mock Exam Simulation',
      createdAt: new Date().toISOString(),
      totalQuestions: chosen.length,
      currentQuestionIndex: 0,
      questions: chosen,
      results: {},
      completed: false,
    };

    setStorage('quiz_attempt_' + attempt.id, attempt);
    return attempt;
  },

  async getQuizAttempt(attemptId: string): Promise<QuizAttempt | null> {
    return getStorage<QuizAttempt | null>('quiz_attempt_' + attemptId, null);
  },

  async submitQuestionAnswer(
    attemptId: string,
    submission: UserQuestionSubmission
  ): Promise<QuestionFeedbackResult> {
    const attempt = await this.getQuizAttempt(attemptId);
    if (!attempt) throw new Error('Quiz attempt not found');

    const question = attempt.questions.find((q) => q.id === submission.questionId);
    if (!question) throw new Error('Question not found');

    const isCorrect = submission.selectedOptionId === question.correctAnswerId;
    const selectedOpt = question.options.find((o) => o.id === submission.selectedOptionId);

    // Call backend attempt registration
    try {
      await fetch(`${API_BASE}/learner/record-attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'default-user',
          question_id: question.id,
          response: submission.selectedOptionId,
          correct: isCorrect,
          confidence: submission.confidence ? submission.confidence / 5.0 : 0.6,
          time_ms: submission.timeSpentSeconds ? submission.timeSpentSeconds * 1000 : 5000,
          hint_used: false,
        }),
      });
    } catch {
      // Continue locally
    }

    const concepts = await this.getConcepts(attempt.courseId);
    const conceptIndex = concepts.findIndex((c) => c.id === question.conceptId);
    let masteryBefore = 50;
    const masteryDelta = isCorrect ? +9 : -6;
    let masteryAfter = 50;

    if (conceptIndex !== -1) {
      masteryBefore = concepts[conceptIndex].mastery;
      masteryAfter = Math.min(100, Math.max(0, masteryBefore + masteryDelta));
      concepts[conceptIndex].mastery = masteryAfter;
      concepts[conceptIndex].uncertainty = Math.max(5, concepts[conceptIndex].uncertainty - 4);
      concepts[conceptIndex].lastPracticedDaysAgo = 0;
      setStorage('concepts_' + attempt.courseId, concepts);

      const course = await this.getCourse(attempt.courseId);
      const avgMastery = Math.round(
        concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length
      );
      course.overallMastery = avgMastery;
      const storedCourses = getStorage<Record<string, Course>>('courses', {});
      storedCourses[course.id] = { ...course, overallMastery: avgMastery };
      setStorage('courses', storedCourses);
    }

    let detectedMisconception: QuestionFeedbackResult['detectedMisconception'] = undefined;
    if (selectedOpt?.isMisconceptionDistractor && selectedOpt.misconceptionId) {
      const misconceptions = await this.getMisconceptions(attempt.courseId);
      const misc = misconceptions.find((m) => m.id === selectedOpt.misconceptionId);
      if (misc) {
        detectedMisconception = {
          id: misc.id,
          title: misc.title,
          description: selectedOpt.misconceptionFeedback || misc.description,
          severity: misc.severity,
        };
        misc.evidenceCount += 1;
        misc.lastEncounteredDaysAgo = 0;
        setStorage('misconceptions_' + attempt.courseId, misconceptions);
      }
    }

    const result: QuestionFeedbackResult = {
      questionId: question.id,
      isCorrect,
      selectedOptionId: submission.selectedOptionId,
      correctOptionId: question.correctAnswerId,
      explanation: question.explanation,
      citation: question.citation,
      masteryBefore,
      masteryAfter,
      masteryDelta,
      conceptName: question.conceptName,
      whySelectedReason: question.whySelectedReason,
      detectedMisconception,
    };

    attempt.results[question.id] = result;
    const answeredCount = Object.keys(attempt.results).length;
    if (answeredCount >= attempt.totalQuestions) {
      attempt.completed = true;
      const correctCount = Object.values(attempt.results).filter((r) => r.isCorrect).length;
      attempt.scorePercentage = Math.round((correctCount / attempt.totalQuestions) * 100);
      attempt.weakConceptsIdentified = Object.values(attempt.results)
        .filter((r) => !r.isCorrect)
        .map((r) => r.conceptName);
      attempt.recommendedActions = [
        'Review Regularization (L1 & L2) on Slide 14 and Page 42',
        'Practice Precision vs Recall threshold adjustments in the Misconceptions tab',
        'Take a 3-question adaptive follow-up drill before tomorrow',
      ];

      await this.updateStudyPlanAfterQuiz(attempt.courseId, attempt.weakConceptsIdentified);
    }

    setStorage('quiz_attempt_' + attemptId, attempt);
    return result;
  },

  async advanceQuizQuestion(attemptId: string): Promise<QuizAttempt | null> {
    const attempt = await this.getQuizAttempt(attemptId);
    if (!attempt) return null;
    if (attempt.currentQuestionIndex < attempt.totalQuestions - 1) {
      attempt.currentQuestionIndex += 1;
      setStorage('quiz_attempt_' + attemptId, attempt);
    }
    return attempt;
  },

  async completeCourse(courseId: string): Promise<Course> {
    const course = await this.getCourse(courseId);
    course.overallMastery = 88;
    course.activeMisconceptionsCount = 0;
    const storedCourses = getStorage<Record<string, Course>>('courses', {});
    storedCourses[course.id] = { ...course, overallMastery: 88, activeMisconceptionsCount: 0 };
    setStorage('courses', storedCourses);

    const concepts = await this.getConcepts(courseId);
    const updatedConcepts = concepts.map((c) => ({
      ...c,
      mastery: Math.max(82, c.mastery),
      uncertainty: 5,
      forgettingRisk: 'low' as const,
    }));
    setStorage('concepts_' + courseId, updatedConcepts);

    const misconceptions = await this.getMisconceptions(courseId);
    const updatedMisconceptions = misconceptions.map((m) => ({
      ...m,
      status: 'resolved' as const,
    }));
    setStorage('misconceptions_' + courseId, updatedMisconceptions);

    return storedCourses[course.id];
  },

  // --- MISCONCEPTIONS ---
  async getMisconceptions(courseId: string): Promise<Misconception[]> {
    try {
      const res = await fetch(`${API_BASE}/learner/misconceptions?course_id=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((m: { id?: string; concept_id?: string; concept_name?: string; name?: string; title?: string; description?: string; severity?: number; evidence_count?: number; contrast_summary?: string; explanation?: string; remediated?: boolean }, idx: number): Misconception => ({
            id: m.id || `misc-${idx}`,
            courseId,
            conceptId: m.concept_id || 'concept-1',
            conceptName: m.concept_name || 'Machine Learning Concept',
            title: m.name || m.title || `Misconception #${idx + 1}`,
            description: m.description || 'Common misconception diagnosed from student submissions',
            severity: (Math.min(5, Math.max(1, Math.round(m.severity || 3))) as 1 | 2 | 3 | 4 | 5),
            evidenceCount: m.evidence_count || 1,
            evidenceDetails: [
              m.description || 'Diagnosed from diagnostic assessments and adaptive drills',
            ],
            remediation: {
              contrastSummary: m.contrast_summary || 'Review core principle vs distractor pattern',
              detailedExplanation: m.explanation || 'Detailed remediation explanation based on course materials',
              realWorldExample: 'Refer to textbook and lecture examples',
              analogy: 'Review core conceptual mental model',
              quickCheckQuestion: {
                question: 'Check your understanding of this concept:',
                options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
                correctIndex: 0,
                explanation: 'Correct application of this concept.',
              },
            },
            status: m.remediated ? 'remediated' : 'active',
            lastEncounteredDaysAgo: 1,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return getStorage<Misconception[]>('misconceptions_' + courseId, INITIAL_MISCONCEPTIONS);
  },

  async remediateMisconception(courseId: string, misconceptionId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/misconceptions/${misconceptionId}/remediate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch {
      // Continue locally
    }

    const list = await this.getMisconceptions(courseId);
    const item = list.find((m) => m.id === misconceptionId);
    if (item) {
      item.status = 'remediated';
      setStorage('misconceptions_' + courseId, list);

      const concepts = await this.getConcepts(courseId);
      const c = concepts.find((concept) => concept.id === item.conceptId);
      if (c) {
        c.mastery = Math.min(100, c.mastery + 12);
        setStorage('concepts_' + courseId, concepts);
      }
    }
  },

  // --- RECORDED LECTURES ---
  async getCourseLectures(courseId: string): Promise<CourseLecturesResponse> {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/lectures`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const normalizedLectures = (data.lectures || []).map((l: Partial<Lecture> & Record<string, unknown>) => {
          const ytId = (l.youtubeId as string) || (l.youtube_id as string) || '';
          const embedUrl = (l.videoUrl as string) || (l.video_url as string) || (ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1` : '');
          return {
            ...l,
            id: l.id,
            courseId: l.courseId || l.course_id || courseId,
            moduleId: l.moduleId || l.module_id || 'mod-1',
            moduleTitle: l.moduleTitle || l.module_title || 'Course Module',
            order: l.order || 1,
            title: l.title,
            durationMinutes: l.durationMinutes ?? l.duration_minutes ?? 60,
            duration_minutes: l.durationMinutes ?? l.duration_minutes ?? 60,
            instructor: l.instructor || '',
            platform: l.platform || '',
            youtubeId: ytId,
            youtube_id: ytId,
            videoUrl: embedUrl,
            video_url: embedUrl,
            downloadUrl: l.downloadUrl || l.download_url || '',
            thumbnailUrl: l.thumbnailUrl || l.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ''),
            conceptName: l.conceptName || l.concept_name || 'Core Concept',
            notes: l.notes || [],
            transcript: l.transcript || [],
            resources: l.resources || [],
          };
        });

        const normalized: CourseLecturesResponse = {
          course_id: data.course_id || courseId,
          course_title: data.course_title || data.courseTitle || 'Course',
          platform: data.platform || '',
          total_lectures: data.total_lectures || normalizedLectures.length,
          total_duration_minutes: data.total_duration_minutes || 0,
          lectures: normalizedLectures,
        };

        setStorage('lectures_' + courseId, normalized);
        return normalized;
      }
    } catch {
      // Backend unavailable or network error
    }

    const cached = getStorage<CourseLecturesResponse | null>('lectures_' + courseId, null);
    const brokenPatterns = ['lec01.pdf', 'lec0', 'lec1', 'lec2', 'notes1.pdf', 'textbook-ch', '6-042j/'];
    const hasBrokenUrl = Boolean(
      cached?.lectures?.some((l) =>
        l.resources?.some((r) => brokenPatterns.some((bp) => (r.url || '').includes(bp)))
      )
    );
    const isStale =
      !cached ||
      !cached.lectures ||
      cached.lectures.length < 8 ||
      hasBrokenUrl ||
      cached.lectures.some((l: Partial<Lecture> & { youtube_id?: string }) =>
        ['PPLop442CuU', 'ytpJdnlu9ug', '4b4MUYve_U8'].includes((l.youtubeId || l.youtube_id) as string)
      );
    if (isStale && cached) {
      setStorage('lectures_' + courseId, null);
    }
    if (cached && !isStale) return cached;

    // Fallback based on course title/platform
    const course = await this.getCourse(courseId);
    const titleLower = (course.name || '').toLowerCase();
    const platLower = (course.source_platform || '').toLowerCase();

    let rawList: Partial<Lecture>[] = NPTEL_ML_20_LECTURES_FALLBACK;
    let fallbackPlatform = 'NPTEL';
    let fallbackInstructor = 'Prof. Balaraman Ravindran, IIT Madras';

    if (
      titleLower.includes('algo') ||
      titleLower.includes('data struct') ||
      platLower.includes('algo') ||
      courseId === '167b50e6-0690-40f5-a17d-565eefcc0309'
    ) {
      rawList = ALGORITHMS_24_LECTURES_FALLBACK;
      fallbackPlatform = 'MIT OpenCourseWare';
      fallbackInstructor = 'Prof. Erik Demaine & Prof. Srini Devadas, MIT';
    } else if (titleLower.includes('math') || titleLower.includes('discrete') || platLower.includes('ocw')) {
      rawList = MIT_OCW_25_LECTURES_FALLBACK;
      fallbackPlatform = 'MIT OpenCourseWare';
      fallbackInstructor = 'Prof. Tom Leighton, MIT';
    } else if (titleLower.includes('swayam') || platLower.includes('swayam')) {
      rawList = SWAYAM_DS_8_LECTURES_FALLBACK;
      fallbackPlatform = 'SWAYAM';
      fallbackInstructor = 'Prof. Raghunathan Rengasamy, IIT Madras';
    } else if (titleLower.includes('khan') || titleLower.includes('linear algebra') || platLower.includes('khan')) {
      rawList = KHAN_ACADEMY_8_LECTURES_FALLBACK;
      fallbackPlatform = 'Khan Academy';
      fallbackInstructor = 'Sal Khan & Grant Sanderson';
    } else if (titleLower.includes('python') || titleLower.includes('intro') || platLower.includes('mitx')) {
      rawList = MITX_PYTHON_12_LECTURES_FALLBACK;
      fallbackPlatform = 'MITx';
      fallbackInstructor = 'Prof. John Guttag & Dr. Ana Bell, MIT';
    }

    const fullLectures: Lecture[] = rawList.map((l, idx) => {
      const ytId = l.youtubeId || '';
      return {
        id: l.id || `${courseId}-lec-${idx + 1}`,
        courseId,
        moduleId: l.moduleId || `mod-${(l.moduleTitle || 'unit-1').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        moduleTitle: l.moduleTitle || `Unit ${(idx >> 2) + 1}`,
        order: l.order || idx + 1,
        title: l.title || `Lecture ${idx + 1}`,
        durationMinutes: l.durationMinutes || 50,
        instructor: fallbackInstructor,
        platform: fallbackPlatform,
        youtubeId: ytId,
        videoUrl: ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1` : '',
        thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '',
        conceptName: l.conceptName || 'Core Concept',
        notes: l.notes || [
          'Fundamental principles and definitions.',
          'Worked mathematical formulation.',
          'Practical applications and algorithms.',
        ],
        transcript: l.transcript || [
          { seconds: 0, timestamp: '00:00', text: `Welcome to ${l.title || 'Lecture'}. Today we cover foundational concepts.` },
          { seconds: 300, timestamp: '05:00', text: 'Analyzing key theoretical formulations and mathematical properties.' },
          { seconds: 1200, timestamp: '20:00', text: 'Demonstrating practical implementations and algorithmic steps.' },
        ],
        resources: l.resources || [
          { title: `${l.title || 'Lecture'} Handout (PDF)`, type: 'pdf', url: '#' },
        ],
      };
    });

    const fallbackResponse: CourseLecturesResponse = {
      course_id: courseId,
      course_title: course.name || 'Course',
      platform: fallbackPlatform,
      total_lectures: fullLectures.length,
      total_duration_minutes: fullLectures.reduce((sum, item) => sum + (item.durationMinutes || 50), 0),
      lectures: fullLectures,
    };

    setStorage('lectures_' + courseId, fallbackResponse);
    return fallbackResponse;
  },

  // --- STUDY PLAN ---
  async getStudyPlan(courseId: string): Promise<StudyPlanBlock[]> {
    const cached = getStorage<StudyPlanBlock[] | null>('study_plan_' + courseId, null);
    if (cached && cached.length > 0) return cached;

    // Build course-aware study schedule
    const course = await this.getCourse(courseId);
    const titleLower = (course.name || '').toLowerCase();
    const isMath = titleLower.includes('math') || titleLower.includes('discrete');
    const isPython = titleLower.includes('python') || titleLower.includes('intro');

    let plan: StudyPlanBlock[];

    if (isMath) {
      plan = [
        {
          id: 'sb-math-1',
          day: 'today',
          timeSlot: '09:00 — 10:20',
          conceptId: 'c-math-1',
          conceptName: 'Introduction to Mathematical Proofs',
          activity: 'Study',
          durationMinutes: 80,
          reason: 'Unit 1 Foundational: Propositional logic, implication, and proof by contradiction',
          completed: false,
          lectureId: 'mit-6042-lec-1',
        },
        {
          id: 'sb-math-2',
          day: 'today',
          timeSlot: '10:30 — 10:50',
          conceptId: 'c-math-1',
          conceptName: 'Well Ordering Principle & Truth Tables',
          activity: 'Practice',
          durationMinutes: 20,
          reason: 'Solve 3 diagnostic problems on truth table deduction and least element proofs',
          completed: false,
        },
        {
          id: 'sb-math-3',
          day: 'today',
          timeSlot: '11:00 — 12:15',
          conceptId: 'c-math-2',
          conceptName: 'Principle of Mathematical Induction',
          activity: 'Study',
          durationMinutes: 75,
          reason: 'Core inductive reasoning and recursive structural proofs (Unit 1)',
          completed: false,
          lectureId: 'mit-6042-lec-2',
        },
        {
          id: 'sb-math-4',
          day: 'tomorrow',
          timeSlot: '09:00 — 10:20',
          conceptId: 'c-math-3',
          conceptName: 'Strong Induction & Invariants',
          activity: 'Study',
          durationMinutes: 78,
          reason: 'Deep dive into induction hypotheses and state machine transitions',
          completed: false,
          lectureId: 'mit-6042-lec-3',
        },
        {
          id: 'sb-math-5',
          day: 'tomorrow',
          timeSlot: '10:30 — 10:55',
          conceptId: 'c-math-2',
          conceptName: 'Induction Pitfalls & Fallacies',
          activity: 'Revise',
          durationMinutes: 25,
          reason: 'Remediate boundary condition errors in inductive proof construction',
          completed: false,
        },
        {
          id: 'sb-math-6',
          day: 'upcoming',
          timeSlot: 'Day 3 — 09:00',
          conceptId: 'c-math-4',
          conceptName: 'Number Theory I: GCD & Pulverizer',
          activity: 'Study',
          durationMinutes: 82,
          reason: 'Euclidean algorithm and linear Diophantine equations for cryptography',
          completed: false,
          lectureId: 'mit-6042-lec-4',
        },
      ];
    } else if (isPython) {
      plan = [
        {
          id: 'sb-py-1',
          day: 'today',
          timeSlot: '09:00 — 09:50',
          conceptId: 'c-py-1',
          conceptName: 'What is Computation?',
          activity: 'Study',
          durationMinutes: 50,
          reason: 'Unit 1 Foundational: Declarative vs imperative knowledge and Python types',
          completed: false,
          lectureId: 'mitx-600-lec-1',
        },
        {
          id: 'sb-py-2',
          day: 'today',
          timeSlot: '10:00 — 10:20',
          conceptId: 'c-py-1',
          conceptName: 'Python Syntax & Variable Bindings',
          activity: 'Practice',
          durationMinutes: 20,
          reason: 'Write and test basic expressions, type conversions, and print statements',
          completed: false,
        },
        {
          id: 'sb-py-3',
          day: 'today',
          timeSlot: '10:30 — 11:20',
          conceptId: 'c-py-2',
          conceptName: 'Branching and Iteration',
          activity: 'Study',
          durationMinutes: 48,
          reason: 'Conditionals (if/elif/else), while loops, and for loops with range()',
          completed: false,
          lectureId: 'mitx-600-lec-2',
        },
        {
          id: 'sb-py-4',
          day: 'tomorrow',
          timeSlot: '09:00 — 09:55',
          conceptId: 'c-py-3',
          conceptName: 'Functions and Decomposition',
          activity: 'Study',
          durationMinutes: 52,
          reason: 'Modularity, abstraction, local scopes, and call frame stacks',
          completed: false,
          lectureId: 'mitx-600-lec-4',
        },
      ];
    } else {
      // Machine Learning (NPTEL default)
      plan = [
        {
          id: 'sb-1',
          day: 'today',
          timeSlot: '09:00 — 09:55',
          conceptId: 'c1',
          conceptName: 'Regularization (L1 & L2)',
          activity: 'Study',
          durationMinutes: 55,
          reason: 'Low mastery (42%) · Watch recorded lecture on L1 vs L2 geometric sparsity',
          completed: false,
          lectureId: 'nptel-ml-lec-9',
        },
        {
          id: 'sb-2',
          day: 'today',
          timeSlot: '10:00 — 10:20',
          conceptId: 'c1',
          conceptName: 'Regularization (L1 & L2)',
          activity: 'Practice',
          durationMinutes: 20,
          reason: 'Remediate detected misconception on L1 diamond vertex tangency',
          completed: false,
        },
        {
          id: 'sb-3',
          day: 'today',
          timeSlot: '10:30 — 10:55',
          conceptId: 'c2',
          conceptName: 'Precision vs Recall',
          activity: 'Revise',
          durationMinutes: 25,
          reason: 'Resolve threshold inversion misconception and practice classification trade-offs',
          completed: false,
        },
        {
          id: 'sb-4',
          day: 'tomorrow',
          timeSlot: '09:00 — 09:50',
          conceptId: 'c8',
          conceptName: 'Linear Regression & Normal Equations',
          activity: 'Study',
          durationMinutes: 50,
          reason: 'Review closed-form derivation and gradient descent convergence',
          completed: false,
          lectureId: 'nptel-ml-lec-4',
        },
        {
          id: 'sb-5',
          day: 'tomorrow',
          timeSlot: '10:00 — 10:55',
          conceptId: 'c3',
          conceptName: 'Gradient Descent & Batch Optimization',
          activity: 'Study',
          durationMinutes: 55,
          reason: 'Reinforce momentum and adaptive learning rate mechanics',
          completed: false,
          lectureId: 'nptel-ml-lec-5',
        },
        {
          id: 'sb-6',
          day: 'upcoming',
          timeSlot: 'Day 3 — 10:00',
          conceptId: 'c6',
          conceptName: 'Cross Validation Strategies',
          activity: 'Revise',
          durationMinutes: 30,
          reason: 'Scheduled spaced repetition to prevent retention decay',
          completed: false,
        },
      ];
    }

    setStorage('study_plan_' + courseId, plan);
    return plan;
  },

  async toggleStudyBlock(courseId: string, blockId: string): Promise<void> {
    const plan = await this.getStudyPlan(courseId);
    const item = plan.find((b) => b.id === blockId);
    if (item) {
      item.completed = !item.completed;
      setStorage('study_plan_' + courseId, plan);
    }
  },

  async getPlanDiffs(courseId: string): Promise<PlanUpdateDiff[]> {
    return getStorage<PlanUpdateDiff[]>('plan_diffs_' + courseId, INITIAL_PLAN_DIFFS);
  },

  async updateStudyPlanAfterQuiz(courseId: string, weakConcepts: string[]): Promise<void> {
    if (weakConcepts.length === 0) return;
    const diffs = await this.getPlanDiffs(courseId);

    const newDiff: PlanUpdateDiff = {
      id: 'diff-' + Date.now(),
      timestamp: 'Just now (Post-Quiz Update)',
      triggerEvent: `Dynamic re-ranking triggered by quiz results (${weakConcepts.join(', ')})`,
      changes: weakConcepts.map((cName) => ({
        type: 'moved_up',
        conceptName: cName,
        note: 'Moved to top priority based on error detection',
      })),
    };
    diffs.unshift(newDiff);
    setStorage('plan_diffs_' + courseId, diffs);
  },

  // --- EVALUATION ---
  async getEvaluationMetrics(courseId?: string): Promise<EvaluationMetrics> {
    void courseId;
    return EVALUATION_METRICS;
  },

  // --- DISCOVERY & MULTI-PLATFORM CATALOG ---
  async searchCatalog(params: {
    query?: string;
    platforms?: SourcePlatform[];
    accessTypes?: AccessType[];
    categories?: string[];
    limit?: number;
  }): Promise<UnifiedSearchResponse> {
    const q = params.query || '';
    const queryParts: string[] = [`q=${encodeURIComponent(q)}`];
    if (params.platforms && params.platforms.length > 0) {
      queryParts.push(`platforms=${encodeURIComponent(params.platforms.join(','))}`);
    }
    if (params.accessTypes && params.accessTypes.length > 0) {
      queryParts.push(`access_types=${encodeURIComponent(params.accessTypes.join(','))}`);
    }
    if (params.categories && params.categories.length > 0) {
      queryParts.push(`categories=${encodeURIComponent(params.categories.join(','))}`);
    }
    if (params.limit) {
      queryParts.push(`limit=${params.limit}`);
    }

    try {
      const res = await fetch(`${API_BASE}/discover/search?${queryParts.join('&')}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Offline fallback
    }

    // Local client-side search fallback
    let filtered: CatalogCourse[] = [...MOCK_CATALOG_COURSES];
    if (q.trim()) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower) ||
          c.instructor.toLowerCase().includes(lower) ||
          c.institution.toLowerCase().includes(lower) ||
          c.category.toLowerCase().includes(lower) ||
          c.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }
    if (params.platforms && params.platforms.length > 0) {
      filtered = filtered.filter((c) => params.platforms!.includes(c.source_platform));
    }
    if (params.accessTypes && params.accessTypes.length > 0) {
      filtered = filtered.filter((c) => params.accessTypes!.includes(c.access_type));
    }
    if (params.categories && params.categories.length > 0) {
      filtered = filtered.filter((c) => params.categories!.includes(c.category));
    }

    const limit = params.limit || 50;
    const sliced = filtered.slice(0, limit);

    return {
      total: filtered.length,
      courses: sliced,
      platforms_searched:
        params.platforms && params.platforms.length > 0
          ? params.platforms
          : ['nptel', 'swayam', 'mit_ocw', 'mitx', 'khan_academy', 'edx', 'coursera'],
    };
  },

  async getCatalogSources(): Promise<PlatformInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/discover/sources`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return [
      { id: 'nptel', name: 'NPTEL' },
      { id: 'swayam', name: 'SWAYAM' },
      { id: 'mit_ocw', name: 'MIT OpenCourseWare' },
      { id: 'mitx', name: 'MITx' },
      { id: 'khan_academy', name: 'Khan Academy' },
      { id: 'edx', name: 'edX' },
      { id: 'coursera', name: 'Coursera' },
    ];
  },

  async getCatalogCourse(platform: string, sourceId: string): Promise<CatalogCourseDetail | null> {
    try {
      const res = await fetch(`${API_BASE}/discover/course/${platform}/${sourceId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const found = MOCK_CATALOG_COURSES.find(
      (c) => c.source_platform === platform && c.source_id === sourceId
    );
    return found || null;
  },

  async getCatalogCategories(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE}/discover/categories`);
      if (res.ok) {
        const data = await res.json();
        if (data.categories) return data.categories;
      }
    } catch {
      // Fallback
    }
    const set = new Set(MOCK_CATALOG_COURSES.map((c) => c.category).filter(Boolean));
    return Array.from(set).sort();
  },

  async ingestCatalogCourse(
    platform: string,
    sourceId: string
  ): Promise<{ courseId: string; title: string; status: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/discover/ingest`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
        body: JSON.stringify({ platform, source_id: sourceId }),
      });
      if (res.ok) {
        const data = await res.json();
        const courses = getStorage<Record<string, Course>>('courses', {});
        const enrolledCourse: Course = {
          id: String(data.course_id),
          name: data.title,
          domain: 'Computer Science',
          examDate: '',
          hoursAvailablePerDay: 2,
          targetMastery: 80,
          createdAt: new Date().toISOString().split('T')[0],
          materialsCount: 4,
          conceptCount: 6,
          overallMastery: 50,
          activeMisconceptionsCount: 1,
        };
        courses[enrolledCourse.id] = enrolledCourse;
        setStorage('courses', courses);
        return {
          courseId: String(data.course_id),
          title: data.title,
          status: data.status,
          message: data.message,
        };
      }
    } catch {
      // Fallback
    }

    const detail = await this.getCatalogCourse(platform, sourceId);
    const newId = `enrolled-${platform}-${sourceId}-${Date.now()}`;
    const enrolledCourse: Course = {
      id: newId,
      name: detail ? detail.title : 'Enrolled Course',
      domain: detail?.category || 'General',
      examDate: '',
      hoursAvailablePerDay: 2,
      targetMastery: 80,
      createdAt: new Date().toISOString().split('T')[0],
      materialsCount: detail ? (detail.video_count > 0 ? 1 : 0) + (detail.lecture_note_count > 0 ? 1 : 0) : 2,
      conceptCount: 8,
      overallMastery: 40,
      activeMisconceptionsCount: 1,
    };
    const courses = getStorage<Record<string, Course>>('courses', {});
    courses[newId] = enrolledCourse;
    setStorage('courses', courses);

    return {
      courseId: newId,
      title: enrolledCourse.name,
      status: 'enrolled',
      message: `Enrolled successfully from ${platform.toUpperCase()}`,
    };
  },

  // --- CERTIFICATES & ACCREDITATION ---
  async getCertificate(courseId: string, userId?: string): Promise<CourseCertificateDetails> {
    // 1. Calculate actual syllabus completion percentage from recorded user progress
    let actualLecturePct = 0;
    let completedCount = 0;
    let totalLectures = 10;
    try {
      const completedMap = getStorage<Record<string, boolean>>('completed_lectures_' + courseId, {});
      completedCount = Object.values(completedMap).filter(Boolean).length;
      const lecturesResp = await this.getCourseLectures(courseId);
      totalLectures = lecturesResp?.total_lectures || lecturesResp?.lectures?.length || 10;
      actualLecturePct = totalLectures > 0 ? Math.min(100, Math.round((completedCount / totalLectures) * 100)) : 0;
    } catch {
      // Use fallback defaults
    }

    const isLectureMet = actualLecturePct >= 80;

    try {
      const queryParams = new URLSearchParams();
      if (userId) queryParams.set('user_id', userId);
      queryParams.set('lectures_completed_pct', actualLecturePct.toString());

      const res = await fetch(`${API_BASE}/certificates/${courseId}?${queryParams.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const raw = await res.json();
        const course = await this.getCourse(courseId);
        const rawMastery = typeof raw.overall_mastery === 'number' ? raw.overall_mastery : (course.overallMastery ?? 82.5);
        const conceptMet = rawMastery >= 80;
        const examMet = (raw.criteria?.diagnostic_exam?.met ?? true);
        const activeMisc = course.activeMisconceptionsCount ?? 0;
        const misconceptionsMet = (raw.criteria?.critical_misconceptions?.met ?? (activeMisc === 0));
        const overallEligible = conceptMet && isLectureMet && examMet && misconceptionsMet;

        const criteriaObj = {
          concept_mastery: {
            name: 'Concept Mastery',
            required: 80.0,
            current: rawMastery,
            met: conceptMet,
            description: 'Demonstrate >= 80% Bayesian calibrated mastery across syllabus concepts.',
          },
          lecture_progress: {
            name: 'Lecture Progress',
            required: 80.0,
            current: actualLecturePct,
            met: isLectureMet,
            description: `Complete >= 80% of recorded video lectures (${completedCount}/${totalLectures} completed).`,
          },
          diagnostic_exam: {
            name: 'Diagnostic / Final Exam',
            required: 75.0,
            current: raw.criteria?.diagnostic_exam?.current || 88.0,
            met: examMet,
            description: 'Pass the KnowTrace comprehensive summative evaluation with >= 75% score.',
          },
          critical_misconceptions: {
            name: 'Zero Critical Misconceptions',
            required: 0,
            current: raw.criteria?.critical_misconceptions?.current || activeMisc,
            met: misconceptionsMet,
            description: 'Resolve all active cognitive misconceptions detected by KT diagnostic engine.',
          },
        };

        return {
          course_id: raw.course_id || courseId,
          course_name: course.name || raw.course_name || raw.course_title || 'Course',
          source_platform: course.source_platform || raw.source_platform || raw.platform_info?.platform || 'NPTEL',
          institution: course.institution || raw.institution || raw.platform_info?.institution || 'IIT Madras',
          instructor: course.instructor || raw.instructor || 'Prof. Balaraman Ravindran',
          certificate_available: Boolean(raw.certificate_available ?? true),
          eligible: overallEligible,
          overall_progress_pct: Math.round((rawMastery + actualLecturePct) / 2),
          criteria: criteriaObj,
          student: raw.student || {
            name: raw.student_name || 'Learner',
            id: raw.student_id || 'KT-4829',
            completion_date: raw.issue_date || 'October 10, 2026',
            certificate_id: raw.credential_id || `KT-NPTE-${courseId.slice(0, 6).toUpperCase()}-2026`,
            verification_hash: raw.verification_hash || 'd8f4e2c9a17b889360c7f12e9647201bc6f32890',
          },
          platform_info: {
            platform: raw.platform_info?.platform || 'NPTEL',
            exam_type: raw.platform_info?.exam_type || raw.platform_info?.official_certificate_name || 'In-Person Proctored Examination (Designated TCS iON Centers across India)',
            exam_registration_window: raw.platform_info?.exam_registration_window || raw.platform_info?.registration_window || 'Open for Upcoming Exam Cycle',
            fee: raw.platform_info?.fee || raw.platform_info?.exam_fee || '₹1,000 per course exam',
            eligibility_rule: raw.platform_info?.eligibility_rule || raw.platform_info?.passing_criteria || 'Passing grade across continuous evaluations and proctored examination.',
            portal_url: raw.platform_info?.portal_url || raw.platform_info?.exam_portal_url || 'https://swayam.gov.in',
            credit_transfer: raw.platform_info?.credit_transfer || raw.platform_info?.credit_eligibility || 'AICTE & UGC approved university credit transfer.',
            exam_dates: raw.platform_info?.exam_dates || 'October / November 2026',
            registration_deadline: raw.platform_info?.registration_deadline || 'Open on portal',
            exam_fee: raw.platform_info?.exam_fee || raw.platform_info?.fee || '₹1,000 / $15',
            passing_criteria: raw.platform_info?.passing_criteria || '25% Assignments + 75% Proctored Exam >= 40%',
            guidelines: raw.platform_info?.guidelines || [
              'Carry Government issued Photo ID Card & Admit Card',
              'Calculator permitted according to course syllabus specifications',
            ],
          },
        };
      }
    } catch (e) {
      console.warn('Backend certificates API not reached, using fallback', e);
    }

    // High fidelity fallback matching course details
    const course = await this.getCourse(courseId);
    const platform = course.source_platform || 'NPTEL';
    const isNptel = platform.toUpperCase().includes('NPTEL');
    const isSwayam = platform.toUpperCase().includes('SWAYAM');
    const isMitx = platform.toUpperCase().includes('MIT');
    const conceptMet = (course.overallMastery || 76.0) >= 80.0;
    const overallEligible = conceptMet && isLectureMet;

    return {
      course_id: courseId,
      course_name: course.name,
      source_platform: platform,
      institution: course.institution || (isNptel ? 'IIT Madras' : isMitx ? 'MIT' : 'KnowTrace Academy'),
      instructor: course.instructor || (isNptel ? 'Prof. Balaraman Ravindran' : 'Lead Faculty'),
      certificate_available: true,
      eligible: overallEligible,
      overall_progress_pct: Math.min(100, Math.round(((course.overallMastery || 76.0) + actualLecturePct) / 2)),
      criteria: {
        concept_mastery: {
          name: 'Concept Mastery',
          required: 80.0,
          current: course.overallMastery || 76.0,
          met: conceptMet,
          description: 'Demonstrate >= 80% Bayesian calibrated mastery across syllabus concepts.',
        },
        lecture_progress: {
          name: 'Lecture Progress',
          required: 80.0,
          current: actualLecturePct,
          met: isLectureMet,
          description: `Complete >= 80% of recorded video lectures (${completedCount}/${totalLectures} completed).`,
        },
        diagnostic_exam: {
          name: 'Diagnostic / Final Exam',
          required: 75.0,
          current: 78.5,
          met: true,
          description: 'Pass the KnowTrace comprehensive summative evaluation with >= 75% score.',
        },
        critical_misconceptions: {
          name: 'Zero Critical Misconceptions',
          required: 0,
          current: course.activeMisconceptionsCount || 0,
          met: (course.activeMisconceptionsCount || 0) === 0,
          description: 'Resolve all active cognitive misconceptions detected by KT diagnostic engine.',
        },
      },
      student: {
        name: 'Learner',
        id: 'kt-learner-demo',
        completion_date: 'October 10, 2026',
        certificate_id: `KT-${platform.slice(0, 4).toUpperCase()}-${courseId.slice(0, 6).toUpperCase()}-2026`,
        verification_hash: 'd8f4e2c9a17b889360c7f12e9647201bc6f32890',
      },
      platform_info: {
        platform: platform,
        exam_type: isNptel || isSwayam
          ? 'In-Person Proctored Examination (Designated TCS iON Centers across India)'
          : 'Online Proctored Summative Assessment & Identity Verification',
        exam_registration_window: 'Open for Upcoming Exam Cycle (September - October)',
        fee: isNptel || isSwayam ? '₹1,000 per course exam' : '$49 - $99 for verified edX track',
        eligibility_rule: isNptel || isSwayam
          ? 'Average assignment score (25%) >= 10/25 AND Proctored exam score (75%) >= 30/75. Overall score >= 40%.'
          : 'Passing grade of 70%+ across all graded problem sets and timed final exams.',
        portal_url: isNptel ? 'https://nptel.ac.in' : isSwayam ? 'https://swayam.gov.in' : 'https://mitxonline.mit.edu',
        credit_transfer: isNptel || isSwayam
          ? 'AICTE approved; eligible for 3 to 4 university MOOC credit transfers under UGC regulations.'
          : 'Eligible for CEU / ECTS micro-credentials upon verification.',
        exam_dates: 'October / November 2026',
        registration_deadline: 'Open on portal',
        exam_fee: isNptel || isSwayam ? '₹1,000 / $15' : '$49 - $99',
        passing_criteria: '25% Assignments + 75% Proctored Exam >= 40%',
        guidelines: [
          'Carry Government issued Photo ID Card & Admit Card',
          'Calculator permitted according to course syllabus specifications',
        ],
      },
    };
  },

  async claimCertificate(courseId: string): Promise<{ success: boolean; certificate_id: string; message: string }> {
    const cert = await this.getCertificate(courseId);
    if (!cert.eligible) {
      throw new Error('Course requirements not met. Please complete at least 80% of the syllabus before claiming your certificate.');
    }

    const completedMap = getStorage<Record<string, boolean>>('completed_lectures_' + courseId, {});
    const completedCount = Object.values(completedMap).filter(Boolean).length;
    const lecturesResp = await this.getCourseLectures(courseId);
    const totalLectures = lecturesResp?.total_lectures || lecturesResp?.lectures?.length || 10;
    const actualLecturePct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    try {
      const res = await fetch(`${API_BASE}/certificates/${courseId}/claim?lectures_completed_pct=${actualLecturePct}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStorage('claimed_cert_' + courseId, true);
        return await res.json();
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to claim certificate');
      }
    } catch (e: any) {
      if (e.message?.includes('Course requirements not met') || e.message?.includes('syllabus')) {
        throw e;
      }
      console.warn('Backend claim certificate API not reached, using local stamp', e);
    }

    setStorage('claimed_cert_' + courseId, true);
    return {
      success: true,
      certificate_id: `KT-CLAIMED-${courseId.slice(0, 6).toUpperCase()}-2026`,
      message: 'Certificate successfully verified and claimed.',
    };
  },

  // Reset to initial demo state
  resetDemoData(courseId = 'cs229-ml'): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_PREFIX + 'courses');
    window.localStorage.removeItem(STORAGE_PREFIX + 'materials_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'proc_status_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'concepts_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'kg_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'tutor_msgs_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'misconceptions_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'study_plan_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'plan_diffs_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'completed_lectures_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'lectures_' + courseId);
    window.localStorage.removeItem(STORAGE_PREFIX + 'claimed_cert_' + courseId);
  },
};

