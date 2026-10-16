export interface AppProject {
  id: string;
  title: string;
  prompt: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  usedProvider: string;
  offlineMode: boolean;
  history: Array<{
    prompt: string;
    code: string;
    timestamp: string;
    provider: string;
  }>;
  lastAnalysis?: AnalysisReport;
}

export interface DynamicTool {
  id: string;
  name: string;
  category: "Seguridad" | "Rendimiento" | "Accesibilidad" | "UX" | "Calidad" | "Código";
  description: string;
  icon: string;
  code: string;
  isDefault: boolean;
  isSynthesized: boolean;
  enabled: boolean;
  lastRun?: {
    timestamp: string;
    score: number;
    issues: string[];
    recommendations: string[];
    passed: boolean;
  };
}

export interface AnalysisReport {
  overallScore: number;
  timestamp: string;
  toolResults: Array<{
    toolId: string;
    toolName: string;
    category: string;
    score: number;
    issues: string[];
    recommendations: string[];
    passed: boolean;
  }>;
  summary: string;
}

export interface FailoverNode {
  id: string;
  name: string;
  provider: string;
  role: "primary" | "fallback-1" | "fallback-2" | "fallback-safeguard";
  status: "online" | "standby" | "active" | "failed" | "unconfigured" | "always_online";
  latencyMs: number;
}

export interface FailoverLog {
  id: string;
  timestamp: string;
  prompt: string;
  finalProvider: string;
  chain: Array<{
    provider: string;
    model: string;
    status: "attempted" | "failed" | "success";
    error?: string;
    latencyMs: number;
  }>;
  totalLatencyMs: number;
  offlineMode: boolean;
}

export interface CustomProviderConfig {
  enabled: boolean;
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface WebPageAnalysis {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  overallHealthScore: number;
  securityScore: number;
  architectureScore: number;
  meta: {
    description?: string;
    viewport?: string;
    charset?: string;
    hasHttps: boolean;
    hasCsp: boolean;
    hasXFrameOptions: boolean;
    hasHsts: boolean;
  };
  structure: {
    semanticTags: Record<string, number>;
    headingsCount: { h1: number; h2: number; h3: number };
    formsCount: number;
    inputsCount: number;
    buttonsCount: number;
    imagesCount: number;
    scriptsCount: number;
    stylesCount: number;
    detectedFrameworks: string[];
    colorPalette: string[];
    layoutHierarchy: string[];
  };
  securityAudit: {
    grade: "A+" | "A" | "B" | "C" | "F";
    vulnerabilities: Array<{
      severity: "alta" | "media" | "baja" | "informativa";
      title: string;
      description: string;
      remediation: string;
    }>;
    protectionStrengths: string[];
    cspRecommendations: string[];
  };
  codeImprovements: {
    strengths: string[];
    recommendations: string[];
    synthesizedTemplateBlueprint: string;
    suggestedTool: {
      name: string;
      category: "Seguridad" | "Calidad" | "Rendimiento" | "Accesibilidad";
      description: string;
    };
  };
}
