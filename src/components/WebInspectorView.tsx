import React, { useState } from "react";
import {
  Globe,
  Search,
  ShieldCheck,
  ShieldAlert,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  FileCode,
  ArrowRight,
  Eye,
  Lock,
  Zap,
  Wrench,
  Palette,
  Terminal,
  RefreshCw,
  Download,
} from "lucide-react";
import { WebPageAnalysis, DynamicTool, AppProject } from "../types";
import { analyzeWebPage } from "../services/aiApi";

interface WebInspectorViewProps {
  currentApp?: AppProject | null;
  onAdoptApp: (app: AppProject) => void;
  onAddSynthesizedTool: (tool: DynamicTool) => void;
  simulateDisconnect: boolean;
  onNavigateToStudio: () => void;
}

const PRESET_WEBSITES = [
  {
    name: "FinTech & Auth Portal",
    url: "https://fintech-secure-portal.example",
    badge: "Alta Seguridad",
    sampleHtml: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banco Digital Seguro - Portal Transaccional</title>
  <link rel="stylesheet" href="https://cdn.tailwindcss.com">
</head>
<body class="bg-slate-900 text-slate-100">
  <header class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
    <div class="font-bold text-cyan-400 text-lg flex items-center gap-2">
      <i class="fa-solid fa-building-columns"></i> NexusBank Secure
    </div>
    <nav class="flex gap-4 text-xs text-slate-300">
      <a href="#cuentas" class="hover:text-cyan-400">Cuentas</a>
      <a href="#transferencias" class="hover:text-cyan-400">Transferencias</a>
      <a href="#seguridad" class="hover:text-cyan-400">Seguridad 2FA</a>
    </nav>
  </header>
  <main class="max-w-4xl mx-auto p-6 space-y-6">
    <section class="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
      <h1 class="text-2xl font-black mb-2">Panel Transaccional Protegido</h1>
      <p class="text-xs text-slate-400">Cifrado de extremo a extremo con autenticación biométrica y tokens temporales.</p>
    </section>
    <div class="grid grid-cols-2 gap-4">
      <form class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <h2 class="text-sm font-bold text-white">Transferencia Inmediata</h2>
        <input type="text" placeholder="Cuenta Destino" class="w-full bg-slate-900 p-2 text-xs rounded border border-slate-700">
        <input type="number" placeholder="Monto ($)" class="w-full bg-slate-900 p-2 text-xs rounded border border-slate-700">
        <button type="button" class="w-full bg-cyan-600 p-2 text-xs font-bold rounded">Confirmar Operación</button>
      </form>
      <div class="p-4 bg-slate-950 rounded-xl border border-slate-800">
        <h2 class="text-sm font-bold text-white mb-2">Historial Cifrado</h2>
        <ul class="text-xs text-slate-400 space-y-2">
          <li class="flex justify-between"><span>Pago Nómina</span><span class="text-emerald-400">+$2,450.00</span></li>
          <li class="flex justify-between"><span>Suscripción Cloud</span><span class="text-rose-400">-$49.00</span></li>
        </ul>
      </div>
    </div>
  </main>
  <footer class="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
    © NexusBank • Cifrado AES-256
  </footer>
</body>
</html>`,
  },
  {
    name: "SaaS Dashboard & Analytics",
    url: "https://metricflow-cloud.example",
    badge: "Métricas & UI",
    sampleHtml: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MetricFlow - Cloud Analytics & Observability</title>
  <link rel="stylesheet" href="https://cdn.tailwindcss.com">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-slate-950 text-slate-200">
  <header class="h-14 border-b border-slate-800 px-6 flex items-center justify-between">
    <div class="font-black text-indigo-400">MetricFlow AI</div>
    <div class="text-xs text-slate-400">Estado: Telemetría Activa</div>
  </header>
  <div class="flex">
    <aside class="w-48 border-r border-slate-800 p-4 min-h-screen text-xs space-y-3">
      <nav class="space-y-2">
        <a href="#" class="block text-indigo-400 font-bold">Consola</a>
        <a href="#" class="block text-slate-400 hover:text-white">Rendimiento</a>
        <a href="#" class="block text-slate-400 hover:text-white">Alertas</a>
      </nav>
    </aside>
    <main class="flex-1 p-6 space-y-6">
      <h1 class="text-xl font-bold">Rendimiento del Sistema en Tiempo Real</h1>
      <div class="grid grid-cols-3 gap-4">
        <div class="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-400">Latencia Promedio</div>
          <div class="text-xl font-mono font-bold text-emerald-400">18 ms</div>
        </div>
        <div class="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-400">Peticiones / seg</div>
          <div class="text-xl font-mono font-bold text-cyan-400">4,820 req/s</div>
        </div>
        <div class="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-400">Disponibilidad SLA</div>
          <div class="text-xl font-mono font-bold text-purple-400">99.98%</div>
        </div>
      </div>
      <section class="p-4 bg-slate-900 rounded-xl border border-slate-800">
        <h2 class="text-xs font-bold text-white mb-2">Tráfico de Red</h2>
        <canvas id="trafficChart" height="100"></canvas>
      </section>
    </main>
  </div>
</body>
</html>`,
  },
  {
    name: "E-Commerce Store & Checkout",
    url: "https://hyperstore-fashion.example",
    badge: "Catálogo & Carrito",
    sampleHtml: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HyperStore - Tienda Online de Moda y Calzado</title>
  <link rel="stylesheet" href="https://cdn.tailwindcss.com">
</head>
<body class="bg-slate-900 text-slate-100">
  <header class="p-4 border-b border-slate-800 flex justify-between items-center">
    <div class="text-lg font-black text-rose-400">HYPERSTORE</div>
    <div class="flex items-center gap-3">
      <input type="search" placeholder="Buscar productos..." class="bg-slate-800 text-xs px-3 py-1.5 rounded-lg border border-slate-700">
      <button class="text-xs bg-rose-600 px-3 py-1.5 rounded-lg font-bold">Carrito (3)</button>
    </div>
  </header>
  <main class="max-w-6xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Colección Nueva Temporada</h1>
    <div class="grid grid-cols-3 gap-6">
      <article class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
        <div class="h-32 bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-xs">Foto Producto</div>
        <h3 class="font-bold text-sm">Sneakers Stealth Edition</h3>
        <p class="text-xs text-slate-400">$129.99 USD</p>
        <button class="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold">Añadir al Carrito</button>
      </article>
      <article class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
        <div class="h-32 bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-xs">Foto Producto</div>
        <h3 class="font-bold text-sm">Chaqueta Cyberpunk Tech</h3>
        <p class="text-xs text-slate-400">$189.50 USD</p>
        <button class="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold">Añadir al Carrito</button>
      </article>
      <article class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
        <div class="h-32 bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-xs">Foto Producto</div>
        <h3 class="font-bold text-sm">Mochila Modular Waterproof</h3>
        <p class="text-xs text-slate-400">$85.00 USD</p>
        <button class="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold">Añadir al Carrito</button>
      </article>
    </div>
  </main>
  <footer class="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
    Envíos globales • Pasarela protegida con Stripe
  </footer>
</body>
</html>`,
  },
];

export const WebInspectorView: React.FC<WebInspectorViewProps> = ({
  currentApp,
  onAdoptApp,
  onAddSynthesizedTool,
  simulateDisconnect,
  onNavigateToStudio,
}) => {
  const [inputMode, setInputMode] = useState<"url" | "html">("url");
  const [targetUrl, setTargetUrl] = useState("https://tailwindcss.com");
  const [rawHtmlInput, setRawHtmlInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebPageAnalysis | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<"overview" | "security" | "architecture" | "code">("overview");
  const [previewTab, setPreviewTab] = useState<"preview" | "code">("preview");
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunAnalysis = async (customUrl?: string, customHtml?: string) => {
    const urlToUse = customUrl || targetUrl;
    const htmlToUse = customHtml || (inputMode === "html" ? rawHtmlInput : "");

    if (inputMode === "url" && !urlToUse.trim()) return;
    if (inputMode === "html" && !htmlToUse.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeWebPage({
        url: urlToUse,
        rawHtml: htmlToUse || undefined,
        simulateDisconnect,
      });

      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
        showToast("¡Análisis completado! Estructura, seguridad y lecciones arquitectónicas listas.");
      } else {
        showToast("No se pudo completar el análisis: " + (res.error || "error desconocido"));
      }
    } catch (err: any) {
      showToast("Error de análisis: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAuditCurrentStudioApp = () => {
    if (!currentApp?.code) {
      showToast("No hay ninguna aplicación activa en el Estudio actualmente.");
      return;
    }
    setTargetUrl(currentApp.title);
    setInputMode("html");
    setRawHtmlInput(currentApp.code);
    handleRunAnalysis(currentApp.title, currentApp.code);
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omniforge-audit-${analysis.title.slice(0, 20).replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Reporte de seguridad descargado como JSON.");
  };

  // Select a preset site
  const handleSelectPreset = (preset: (typeof PRESET_WEBSITES)[0]) => {
    setTargetUrl(preset.url);
    handleRunAnalysis(preset.url, preset.sampleHtml);
  };

  // Adopt structure into a live OmniForge app in AppStudio
  const handleAdoptStructureAsApp = () => {
    if (!analysis) return;

    const blueprintCode = analysis.codeImprovements.synthesizedTemplateBlueprint;
    const newApp: AppProject = {
      id: "app_web_evolved_" + Date.now(),
      title: `Evolución de ${analysis.title.slice(0, 28)}`,
      prompt: `Aplicación reconstruida con arquitectura blindada y diseño inspirado en ${analysis.url || analysis.title}.`,
      code: blueprintCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedProvider: "OmniForge Web Inspector Architecture Learner",
      offlineMode: false,
      history: [
        {
          prompt: `Adopción de estructura de ${analysis.title}`,
          code: blueprintCode,
          timestamp: new Date().toISOString(),
          provider: "Web Architecture Learner",
        },
      ],
    };

    onAdoptApp(newApp);
    onNavigateToStudio();
  };

  // Synthesize customized security guardian tool into SelfEvolvingToolsView
  const handleSynthesizeGuardianTool = () => {
    if (!analysis) return;

    const toolDef = analysis.codeImprovements.suggestedTool;
    const highestVuln = analysis.securityAudit.vulnerabilities[0];

    const newTool: DynamicTool = {
      id: "web_guardian_" + Date.now(),
      name: toolDef.name,
      category: toolDef.category,
      description: toolDef.description,
      icon: "ShieldAlert",
      isDefault: false,
      isSynthesized: true,
      enabled: true,
      code: `async function analyze(html) {
  const issues = [];
  const recommendations = [];
  let score = 100;

  // Auditoría aprendida de la web analizada (${analysis.title.replace(/['"]/g, "")})
  if (html.includes('onclick=') || html.includes('onload=') || html.includes('onerror=')) {
    issues.push('Riesgo de Inyección DOM XSS: Se detectaron eventos JavaScript inline.');
    score -= 25;
    recommendations.push('Reemplazar onclick por addEventListener() en un script seguro.');
  }

  if (html.includes('javascript:')) {
    issues.push('Uso de pseudoprotocolo javascript: en atributos href.');
    score -= 20;
    recommendations.push('Usar botones semánticos <button type="button">.');
  }

  if (!html.includes('<meta name="viewport"')) {
    issues.push('Falta directiva meta viewport para responsividad.');
    score -= 15;
    recommendations.push('Añadir <meta name="viewport" content="width=device-width, initial-scale=1.0">.');
  }

  if (!html.includes('localStorage') && !html.includes('sessionStorage')) {
    issues.push('Persistencia ausente: los datos se perderán al recargar la página.');
    score -= 15;
    recommendations.push('Implementar guardado automático con localStorage.');
  }

  if (issues.length === 0) {
    recommendations.push('Código blindado: Cumple con las defensas estructurales extraídas.');
  }

  return {
    score: Math.max(20, score),
    issues,
    recommendations,
    passed: score >= 75
  };
}`,
    };

    onAddSynthesizedTool(newTool);
    showToast(`¡Herramienta "${newTool.name}" sintetizada y agregada a tu suite activa!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" /> Web Architecture & Security Intelligence
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                Auto-Aprendizaje
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Analizador Autónomo de Páginas Web
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Inspecciona cualquier sitio web por URL o código HTML. El sistema extrae su estructura semántica, audita vectores de ataque (XSS, CSP, Clickjacking, dependencias no verificadas) y utiliza sus mejores patrones para <strong>proteger el sistema</strong> y <strong>mejorar la generación de código</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => handleSelectPreset(PRESET_WEBSITES[0])}
              className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Probar Demo Rápido
            </button>
          </div>
        </div>
      </div>

      {/* Search & Input Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              onClick={() => setInputMode("url")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                inputMode === "url"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Analizar por URL</span>
            </button>
            <button
              onClick={() => setInputMode("html")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                inputMode === "html"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pegar Código HTML</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Tolerante a caídas de red y restricciones CORS
          </span>
        </div>

        {/* URL Input Bar */}
        {inputMode === "url" ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://ejemplo.com (introduce cualquier sitio web)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono transition"
                onKeyDown={(e) => e.key === "Enter" && handleRunAnalysis()}
              />
            </div>
            <button
              onClick={() => handleRunAnalysis()}
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Inspeccionando DOM y Seguridad...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Analizar Sitio Web</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={rawHtmlInput}
              onChange={(e) => setRawHtmlInput(e.target.value)}
              placeholder="Pega aquí el código HTML completo (<!DOCTYPE html>...) de la página que deseas analizar..."
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 transition"
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isAnalyzing || !rawHtmlInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditoría en curso...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Analizar Código HTML Pegado</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quick Benchmark Presets & Current App Audit */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {currentApp && (
            <button
              onClick={handleAuditCurrentStudioApp}
              className="text-[11px] bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold px-3 py-1 rounded-lg transition flex items-center gap-1.5 shadow-sm"
              title="Inspeccionar el código y arquitectura de la app activa en el Estudio"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Auditar App del Estudio: "{currentApp.title.slice(0, 18)}..."</span>
            </button>
          )}

          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold ml-1">
            Plantillas Benchmark:
          </span>
          {PRESET_WEBSITES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset)}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1 rounded-lg transition flex items-center gap-1.5"
            >
              <span>{preset.name}</span>
              <span className="text-[9px] bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Security Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Score de Seguridad</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                    analysis.securityScore >= 80
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                      : analysis.securityScore >= 60
                      ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                      : "bg-rose-950 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  Grado {analysis.securityAudit.grade}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {analysis.securityScore}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    analysis.securityScore >= 80
                      ? "bg-emerald-400"
                      : analysis.securityScore >= 60
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                  style={{ width: `${analysis.securityScore}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {analysis.securityAudit.vulnerabilities.length} vectores de riesgo evaluados
              </p>
            </div>

            {/* Architecture Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Calidad Arquitectura</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {analysis.architectureScore}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${analysis.architectureScore}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                Semántica HTML5 y jerarquía de componentes
              </p>
            </div>

            {/* Vulnerability Count */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Vulnerabilidades</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-rose-400">
                  {analysis.securityAudit.vulnerabilities.length}
                </span>
                <span className="text-xs text-slate-500">detectadas</span>
              </div>
              <div className="flex gap-1.5 text-[10px] font-mono">
                <span className="text-rose-400">
                  {analysis.securityAudit.vulnerabilities.filter((v) => v.severity === "alta").length} Altas
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400">
                  {analysis.securityAudit.vulnerabilities.filter((v) => v.severity === "media").length} Medias
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Mitigaciones automáticas disponibles</p>
            </div>

            {/* Frameworks & Tech */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Tecnologías y Estilos</span>
                <Code2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.structure.detectedFrameworks.map((fw) => (
                  <span
                    key={fw}
                    className="px-2 py-0.5 rounded text-[10px] bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-mono"
                  >
                    {fw}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Paleta:</span>
                {analysis.structure.colorPalette.slice(0, 5).map((col, idx) => (
                  <span
                    key={idx}
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  ¿Deseas adoptar la estructura y blindar el sistema con esta web?
                </h4>
                <p className="text-[11px] text-slate-300">
                  Puedes reconstruirla como una aplicación segura en el Estudio o sintetizar un nuevo guardián dinámico de protección.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSynthesizeGuardianTool}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-900/30"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Sintetizar Guardián a Medida</span>
              </button>
              <button
                onClick={handleAdoptStructureAsApp}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-900/30"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Recrear como App Blindada</span>
              </button>
            </div>
          </div>

          {/* Report Sub-Tabs Navigation */}
          <div className="border-b border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setActiveReportTab("overview")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeReportTab === "overview"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visión General & Diagnóstico</span>
            </button>
            <button
              onClick={() => setActiveReportTab("security")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeReportTab === "security"
                  ? "border-rose-400 text-rose-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Protección & Vulnerabilidades ({analysis.securityAudit.vulnerabilities.length})</span>
            </button>
            <button
              onClick={() => setActiveReportTab("architecture")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeReportTab === "architecture"
                  ? "border-indigo-400 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Estructura DOM & Diseño</span>
            </button>
            <button
              onClick={() => setActiveReportTab("code")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeReportTab === "code"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Código Blindado Generado</span>
            </button>
          </div>

          {/* Sub-Tab 1: Overview */}
          {activeReportTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Fortalezas Estructurales Detectadas</span>
                </div>
                <div className="space-y-2">
                  {analysis.codeImprovements.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-850 p-3 rounded-xl text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Recomendaciones para Fortalecer el Sistema</span>
                </div>
                <div className="space-y-2">
                  {analysis.codeImprovements.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-850 p-3 rounded-xl text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Security & Vulnerabilities */}
          {activeReportTab === "security" && (
            <div className="space-y-6">
              {/* Vulnerabilities List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Vectores de Ataque y Defensas Requeridas</span>
                </h3>

                <div className="space-y-3">
                  {analysis.securityAudit.vulnerabilities.map((v, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              v.severity === "alta"
                                ? "bg-rose-500"
                                : v.severity === "media"
                                ? "bg-amber-500"
                                : "bg-cyan-500"
                            }`}
                          ></span>
                          {v.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                            v.severity === "alta"
                              ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                              : v.severity === "media"
                              ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                              : "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{v.description}</p>
                      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[11px] text-emerald-300 flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Mitigación OmniForge:</strong> {v.remediation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CSP Recommendations */}
              {analysis.securityAudit.cspRecommendations.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span>Directivas Recomendadas de Content-Security-Policy (CSP)</span>
                  </h3>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 space-y-1">
                    {analysis.securityAudit.cspRecommendations.map((dir, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-slate-500">•</span>
                        <span>{dir};</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3: DOM Architecture */}
          {activeReportTab === "architecture" && (
            <div className="space-y-6">
              {/* Semantic Tag Counters */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Desglose de Elementos Semánticos Detectados
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(analysis.structure.semanticTags).map(([tag, count]) => (
                    <div
                      key={tag}
                      className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-xs font-mono text-slate-400">&lt;{tag}&gt;</span>
                      <span className="text-sm font-black font-mono text-cyan-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hierarchy Diagram */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Jerarquía de Componentes Identificada
                </h3>
                <div className="space-y-2">
                  {analysis.structure.layoutHierarchy.map((layer, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs flex items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 font-medium">{layer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Synthesized Hardened Code & Live Preview */}
          {activeReportTab === "code" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>Plantilla de Aplicación Blindada</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Código HTML autónomo con diseño extraído, persistencia en localStorage y sanitización estricta.
                  </p>
                </div>

                {/* Sub-toggle: Preview vs Source Code */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center">
                    <button
                      onClick={() => setPreviewTab("preview")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        previewTab === "preview"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Vista Previa
                    </button>
                    <button
                      onClick={() => setPreviewTab("code")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        previewTab === "code"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Código
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadReport}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title="Descargar Reporte Completo en JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(analysis.codeImprovements.synthesizedTemplateBlueprint);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copiado" : "Copiar"}</span>
                  </button>

                  <button
                    onClick={handleAdoptStructureAsApp}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Abrir en Estudio</span>
                  </button>
                </div>
              </div>

              {previewTab === "preview" ? (
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                  <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Sandbox Aislado OmniForge (localStorage Activo)
                    </span>
                    <span>100% Interactivo</span>
                  </div>
                  <iframe
                    srcDoc={analysis.codeImprovements.synthesizedTemplateBlueprint}
                    title="Vista Previa de la App Blindada"
                    sandbox="allow-scripts allow-modals"
                    className="w-full h-96 bg-slate-950"
                  />
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto">
                  <pre>{analysis.codeImprovements.synthesizedTemplateBlueprint}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
