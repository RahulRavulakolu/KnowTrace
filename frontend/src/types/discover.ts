/**
 * Types for the multi-platform course discovery system.
 */

export type SourcePlatform =
  | 'nptel'
  | 'swayam'
  | 'mit_ocw'
  | 'mitx'
  | 'khan_academy'
  | 'edx'
  | 'coursera';

export type AccessType =
  | 'free'
  | 'free_paid_cert'
  | 'audit_limited'
  | 'paid'
  | 'unknown';

export interface PlatformInfo {
  id: SourcePlatform;
  name: string;
}

export interface CatalogCourse {
  source_platform: SourcePlatform;
  source_platform_name: string;
  source_id: string;
  title: string;
  description: string;
  instructor: string;
  institution: string;
  category: string;
  language: string;
  duration: string;
  source_url: string;
  access_type: AccessType;
  access_type_label: string;
  is_free_learning: boolean;
  certificate_available: boolean;
  thumbnail_url: string;
  tags: string[];
  start_date: string | null;
  video_count: number;
  lecture_note_count: number;
  assignment_count: number;
  quiz_count: number;
  exam_count: number;
  resource_summary: string[];
}

export interface CourseResource {
  title: string;
  resource_type: string;
  url: string | null;
  description: string | null;
  duration_minutes: number | null;
  downloadable: boolean;
  order: number;
}

export interface CourseModule {
  title: string;
  order: number;
  description: string | null;
  resources: CourseResource[];
}

export interface CatalogCourseDetail extends CatalogCourse {
  modules: CourseModule[];
}

export interface UnifiedSearchResponse {
  total: number;
  courses: CatalogCourse[];
  platforms_searched: string[];
}

/** Visual configuration for each platform */
export interface PlatformConfig {
  id: SourcePlatform;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/** Access type display configuration */
export interface AccessTypeConfig {
  type: AccessType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const PLATFORM_CONFIGS: Record<SourcePlatform, PlatformConfig> = {
  nptel: {
    id: 'nptel',
    name: 'NPTEL',
    icon: '🏛️',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  swayam: {
    id: 'swayam',
    name: 'SWAYAM',
    icon: '🇮🇳',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/60',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  mit_ocw: {
    id: 'mit_ocw',
    name: 'MIT OpenCourseWare',
    icon: '🎓',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/60',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  mitx: {
    id: 'mitx',
    name: 'MITx',
    icon: '🔬',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/60',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  khan_academy: {
    id: 'khan_academy',
    name: 'Khan Academy',
    icon: '📗',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/60',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  edx: {
    id: 'edx',
    name: 'edX',
    icon: '📘',
    color: 'text-sky-700 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/60',
    borderColor: 'border-sky-200 dark:border-sky-800',
  },
  coursera: {
    id: 'coursera',
    name: 'Coursera',
    icon: '📕',
    color: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
};

export const ACCESS_TYPE_CONFIGS: Record<AccessType, AccessTypeConfig> = {
  free: {
    type: 'free',
    label: 'Free',
    icon: '🟢',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
  free_paid_cert: {
    type: 'free_paid_cert',
    label: 'Free Learning',
    icon: '🟢',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
  audit_limited: {
    type: 'audit_limited',
    label: 'Audit / Limited Free',
    icon: '🟡',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/60',
  },
  paid: {
    type: 'paid',
    label: 'Paid',
    icon: '🔴',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/60',
  },
  unknown: {
    type: 'unknown',
    label: 'Access Unknown',
    icon: '⚪',
    color: 'text-zinc-500 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
  },
};
