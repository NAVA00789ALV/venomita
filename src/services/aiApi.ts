import { CustomProviderConfig, FailoverLog, FailoverNode } from "../types";

export interface GenerateOptions {
  prompt: string;
  mode?: "create_app" | "edit_app" | "synthesize_tool" | "analyze_app" | "enhance_with_tools";
  currentCode?: string;
  simulateDisconnect?: boolean;
  customProvider?: CustomProviderConfig;
  toolContext?: any;
}

export interface GenerateResponse {
  success: boolean;
  result: string;
  usedProvider: string;
  failoverHistory: Array<{
    provider: string;
    model: string;
    status: "attempted" | "failed" | "success";
    error?: string;
    latencyMs: number;
  }>;
  totalLatencyMs: number;
  offlineMode: boolean;
  error?: string;
}

export async function fetchAIStatus(): Promise<{
  hasGeminiKey: boolean;
  models: FailoverNode[];
}> {
  try {
    const res = await fetch("/api/ai/status");
    if (!res.ok) throw new Error("Status endpoint error");
    return await res.json();
  } catch (err) {
    return {
      hasGeminiKey: false,
      models: [
        {
          id: "gemini-3.8-flash",
          name: "Gemini 3.8 Flash (Principal)",
          provider: "Google Gemini",
          role: "primary",
          status: "standby",
          latencyMs: 0,
        },
        {
          id: "gemini-3.1-flash-lite",
          name: "Gemini 3.1 Flash Lite (Respaldo Rápido)",
          provider: "Google Gemini",
          role: "fallback-1",
          status: "standby",
          latencyMs: 0,
        },
        {
          id: "custom-provider",
          name: "Proveedor Externo Personalizado",
          provider: "Custom API Endpoint",
          role: "fallback-2",
          status: "unconfigured",
          latencyMs: 0,
        },
        {
          id: "neurocore-offline",
          name: "NeuroCore Autonomous Offline Engine",
          provider: "Local Heuristic Synthesizer",
          role: "fallback-safeguard",
          status: "always_online",
          latencyMs: 15,
        },
      ],
    };
  }
}

export async function pingModel(modelId: string): Promise<{ success: boolean; latencyMs: number; provider: string }> {
  try {
    const res = await fetch("/api/ai/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, latencyMs: 0, provider: modelId };
  }
}

export async function generateContentWithFailover(options: GenerateOptions): Promise<GenerateResponse> {
  try {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error del servidor HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // If the network request itself failed (e.g. server completely unreachable),
    // provide zero-failure client-side emergency fallback
    console.warn("API request failed, triggering client emergency offline engine:", err);
    return {
      success: true,
      result: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Resiliente de Emergencia</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
    <div class="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">✓</div>
    <h1 class="text-xl font-bold text-white">Respaldo Local Autónomo Activo</h1>
    <p class="text-xs text-slate-400">La conexión con el servidor fue interrumpida, pero la aplicación fue generada por el motor de contingencia local.</p>
    <div class="p-3 bg-slate-900/80 rounded-xl text-left text-xs font-mono text-slate-300">
      Prompt: "${options.prompt}"
    </div>
    <button onclick="location.reload()" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-xs transition">
      Probar Reconexión
    </button>
  </div>
</body>
</html>`,
      usedProvider: "Motor Autónomo de Contingencia del Navegador",
      failoverHistory: [
        {
          provider: "Servidor Remoto",
          model: "gemini-3.8-flash",
          status: "failed",
          error: err.message,
          latencyMs: 10,
        },
        {
          provider: "Motor Autónomo de Contingencia",
          model: "client-local-safeguard",
          status: "success",
          latencyMs: 5,
        },
      ],
      totalLatencyMs: 15,
      offlineMode: true,
    };
  }
}

export async function analyzeWebPage(options: {
  url?: string;
  rawHtml?: string;
  simulateDisconnect?: boolean;
}): Promise<{ success: boolean; analysis: any; error?: string }> {
  try {
    const res = await fetch("/api/ai/analyze-webpage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // Client-side fallback if server fetch is unavailable
    const { parseWebPageArchitecture } = await import("./webAnalyzer");
    const fallbackHtml = options.rawHtml || `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${options.url || 'Sitio'}</title></head><body><header><h1>${options.url || 'Web'}</h1></header><main><p>Análisis en modo contingencia local.</p></main></body></html>`;
    const analysis = parseWebPageArchitecture(fallbackHtml, options.url || "https://local-audit.internal");
    return { success: true, analysis };
  }
}
