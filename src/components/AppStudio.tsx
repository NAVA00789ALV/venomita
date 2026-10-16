import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  RotateCcw,
  Copy,
  Check,
  Download,
  ExternalLink,
  Code2,
  Play,
  Terminal,
  ShieldCheck,
  Zap,
  Wrench,
  AlertTriangle,
  Flame,
  MessageSquare,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";
import { AppProject, DynamicTool, AnalysisReport, FailoverLog } from "../types";
import { generateContentWithFailover } from "../services/aiApi";
import { runFullAudit } from "../services/toolRunner";

interface AppStudioProps {
  currentApp: AppProject | null;
  setCurrentApp: (app: AppProject) => void;
  onSaveToGallery: (app: AppProject) => void;
  tools: DynamicTool[];
  simulateDisconnect: boolean;
  onLogFailover: (log: FailoverLog) => void;
  onNavigateToTools: () => void;
  onNavigateToWebInspector?: () => void;
}

const SAMPLE_PROMPTS = [
  {
    title: "⚡ Generador de Contraseñas",
    desc: "Seguridad con opciones, medidor de entropía y copia",
    prompt: "Crea una herramienta generadora de contraseñas seguras con controles deslizantes de longitud, selector de símbolos, números, medidor de seguridad en tiempo real y botón de copiar al portapapeles con localStorage.",
  },
  {
    title: "🎵 Secuenciador Chiptune 8-Bit",
    desc: "Sintetizador Web Audio con patrones y localStorage",
    prompt: "Crea un secuenciador de música chiptune 8-bit interactivo con Web Audio API, botones de pasos, selector de BPM, ritmos de batería y guardado en localStorage.",
  },
  {
    title: "🚀 Arcade Retro Espacial",
    desc: "Nave en canvas con estrellas, partículas, puntuación y vidas",
    prompt: "Crea un juego arcade retro espacial en Canvas 2D con efectos de sonido, partículas de explosión, puntuación más alta, controles táctiles y con flechas.",
  },
  {
    title: "📊 Calculadora de Hipotecas",
    desc: "Simulador con amortización, gráficos y cuotas mensuales",
    prompt: "Crea una calculadora interactiva de préstamos hipotecarios con sliders de tasa y plazo, tabla de amortización detallada y gráfico circular de capital vs intereses con Chart.js.",
  },
  {
    title: "📋 Kanban & Pomodoro",
    desc: "Tablero con drag-and-drop, prioridades y cronómetro",
    prompt: "Crea un tablero Kanban con columnas Por Hacer, En Progreso y Terminado con drag-and-drop, selector de prioridad por color, y un temporizador Pomodoro integrado con alertas y localStorage.",
  },
  {
    title: "🌍 Simulador de Órbitas",
    desc: "Física gravitacional 2D en Canvas con planetas ajustables",
    prompt: "Crea un simulador interactivo de órbitas gravitacionales planetarias en Canvas donde el usuario pueda hacer clic para colocar soles y planetas con vectores de velocidad y trazas orbitales.",
  },
  {
    title: "📈 Dashboard Cripto & Finanzas",
    desc: "Cotizaciones en vivo, conversor de divisas y gráfico",
    prompt: "Crea un panel financiero moderno con cotizaciones simuladas en tiempo real de Bitcoin, Ethereum y Solana, gráfico interactivo de velas/líneas y calculadora de rentabilidad.",
  },
  {
    title: "🛡️ Portal Web Blindado (Arquitectura Segura)",
    desc: "Patrón de seguridad bancaria con CSP, sanitización DOM y localStorage",
    prompt: "Crea un portal web corporativo blindado con sanitización estricta de entradas de usuario, persistencia automática en localStorage, diseño semántico accesible y panel de seguridad contra inyecciones XSS.",
  },
];

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  time: string;
}

export const AppStudio: React.FC<AppStudioProps> = ({
  currentApp,
  setCurrentApp,
  onSaveToGallery,
  tools,
  simulateDisconnect,
  onLogFailover,
  onNavigateToTools,
  onNavigateToWebInspector,
}) => {
  const [prompt, setPrompt] = useState("");
  const [modifyPrompt, setModifyPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [activeView, setActiveView] = useState<"preview" | "code" | "audit" | "chat">("preview");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: "log" | "error" | "warn"; text: string; time: string }>>([]);
  const [auditReport, setAuditReport] = useState<AnalysisReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "¡Hola! Soy tu co-piloto conversacional en OmniForge AI. Pregúntame sobre el código de esta aplicación, pide explicaciones técnicas o solicita ideas de mejora.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize with a default rich app if empty
  useEffect(() => {
    if (!currentApp) {
      const initialPrompt = "Tablero Kanban ágil con Drag & Drop y Pomodoro";
      handleGenerate(initialPrompt);
    }
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeView === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeView]);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "OMNIFORGE_CONSOLE") {
        setConsoleLogs((prev) => [
          ...prev.slice(-30),
          {
            type: event.data.level || "log",
            text: event.data.message || "",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Automatically run tool audit when code changes
  useEffect(() => {
    if (currentApp?.code) {
      runAuditOnCurrentCode(currentApp.code);
    }
  }, [currentApp?.code]);

  const runAuditOnCurrentCode = async (code: string) => {
    setIsAuditing(true);
    try {
      const report = await runFullAudit(tools, code);
      setAuditReport(report);
      if (currentApp) {
        setCurrentApp({
          ...currentApp,
          lastAnalysis: report,
        });
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Generate App from text prompt
  const handleGenerate = async (inputPrompt?: string) => {
    const targetPrompt = inputPrompt || prompt;
    if (!targetPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep("1. Iniciando enrutador Multi-IA...");
    setConsoleLogs([]);

    try {
      setGenerationStep(
        simulateDisconnect
          ? "⚡ Desconexión activa: Redirigiendo a motores de contingencia offline..."
          : "1. Consultando motor primario Gemini 3.8 Flash..."
      );

      const res = await generateContentWithFailover({
        prompt: targetPrompt,
        mode: "create_app",
        simulateDisconnect,
      });

      setGenerationStep("2. Auto-verificando integridad y componentes...");

      // Prepare app code
      let appCode = res.result;

      // Inject console interceptor script for user live debugging
      const consoleInterceptor = `
        <script>
          (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            console.log = function(...args) {
              originalLog.apply(console, args);
              try { window.parent.postMessage({ type: 'OMNIFORGE_CONSOLE', level: 'log', message: args.join(' ') }, '*'); } catch(e){}
            };
            console.error = function(...args) {
              originalError.apply(console, args);
              try { window.parent.postMessage({ type: 'OMNIFORGE_CONSOLE', level: 'error', message: args.join(' ') }, '*'); } catch(e){}
            };
            console.warn = function(...args) {
              originalWarn.apply(console, args);
              try { window.parent.postMessage({ type: 'OMNIFORGE_CONSOLE', level: 'warn', message: args.join(' ') }, '*'); } catch(e){}
            };
          })();
        </script>
      `;
      if (appCode.includes("<head>")) {
        appCode = appCode.replace("<head>", `<head>${consoleInterceptor}`);
      } else {
        appCode = consoleInterceptor + appCode;
      }

      setGenerationStep("3. Compilando y desplegando en sandbox seguro...");

      const newApp: AppProject = {
        id: "app_" + Date.now(),
        title: targetPrompt.slice(0, 36).replace(/["'`<>]/g, ""),
        prompt: targetPrompt,
        code: appCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usedProvider: res.usedProvider,
        offlineMode: res.offlineMode,
        history: [
          {
            prompt: targetPrompt,
            code: appCode,
            timestamp: new Date().toISOString(),
            provider: res.usedProvider,
          },
        ],
      };

      setCurrentApp(newApp);
      onSaveToGallery(newApp);

      // Record failover log for monitoring
      onLogFailover({
        id: "log_" + Date.now(),
        timestamp: new Date().toISOString(),
        prompt: targetPrompt,
        finalProvider: res.usedProvider,
        chain: res.failoverHistory,
        totalLatencyMs: res.totalLatencyMs,
        offlineMode: res.offlineMode,
      });

      // Add notification to chat
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `He creado la aplicación "${newApp.title}" con el motor ${res.usedProvider}. ¿Quieres realizar alguna modificación o tienes preguntas sobre su funcionamiento?`,
          time: new Date().toLocaleTimeString(),
        },
      ]);

      if (!inputPrompt) {
        setPrompt("");
      }
    } catch (err: any) {
      alert("Error al generar la aplicación: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Modify / refine current app
  const handleModify = async () => {
    if (!modifyPrompt.trim() || !currentApp || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep("Aplicando modificaciones con el enrutador Multi-IA...");

    try {
      const res = await generateContentWithFailover({
        prompt: modifyPrompt,
        mode: "edit_app",
        currentCode: currentApp.code,
        simulateDisconnect,
      });

      const updatedCode = res.result;
      const updatedApp: AppProject = {
        ...currentApp,
        code: updatedCode,
        updatedAt: new Date().toISOString(),
        usedProvider: res.usedProvider,
        offlineMode: res.offlineMode,
        history: [
          ...currentApp.history,
          {
            prompt: modifyPrompt,
            code: updatedCode,
            timestamp: new Date().toISOString(),
            provider: res.usedProvider,
          },
        ],
      };

      setCurrentApp(updatedApp);
      onSaveToGallery(updatedApp);
      setModifyPrompt("");

      onLogFailover({
        id: "log_" + Date.now(),
        timestamp: new Date().toISOString(),
        prompt: `[Modificación] ${modifyPrompt}`,
        finalProvider: res.usedProvider,
        chain: res.failoverHistory,
        totalLatencyMs: res.totalLatencyMs,
        offlineMode: res.offlineMode,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `He aplicado el cambio: "${modifyPrompt}". La vista previa se ha actualizado en tiempo real.`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      alert("Error al modificar la app: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Chat message submit handler
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || isChatting) return;

    if (!presetText) setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: textToSend, time: new Date().toLocaleTimeString() },
    ]);
    setIsChatting(true);

    try {
      const chatPrompt = `Actúa como un arquitecto y co-piloto experto en ingeniería de software web.
El usuario te está consultando sobre la siguiente aplicación generada:
Título: ${currentApp?.title || "Aplicación Web"}
Código HTML/JS:
${currentApp?.code ? currentApp.code.slice(0, 3000) : "Sin código"}

Pregunta del usuario:
"${textToSend}"

Responde en español de forma directa, útil y pedagógica. Si recomiendas un cambio en el código, sugiérele la instrucción exacta que puede ingresar en la barra de modificación.`;

      const res = await generateContentWithFailover({
        prompt: chatPrompt,
        mode: "analyze_app",
        simulateDisconnect,
      });

      let reply = res.result;
      try {
        const parsed = JSON.parse(res.result);
        if (parsed.suggestedPatch) {
          reply = parsed.suggestedPatch;
        }
      } catch (e) {}

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: reply || "He revisado la aplicación. ¿Te gustaría que aplique estos ajustes directamente?",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Hubo un error de conexión al consultar el asistente. Puedes continuar trabajando en el código o en la vista previa.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  // Auto-Improve App with tool audit recommendations
  const handleAutoImproveWithTools = async () => {
    if (!currentApp || !auditReport || isGenerating) return;

    const allIssues = auditReport.toolResults.flatMap((r) => r.issues);
    const allRecs = auditReport.toolResults.flatMap((r) => r.recommendations);

    const improvementPrompt = `Optimiza y corrige automáticamente la aplicación resolviendo los siguientes hallazgos detectados por las herramientas de auto-auditoría:
Problemas a resolver:
${allIssues.map((i) => `- ${i}`).join("\n")}
Recomendaciones:
${allRecs.map((r) => `- ${r}`).join("\n")}
Asegura que el código sea 100% interactivo, accesible y sin errores.`;

    setIsGenerating(true);
    setGenerationStep("Aplicando parches de seguridad, accesibilidad y rendimiento...");

    try {
      const res = await generateContentWithFailover({
        prompt: improvementPrompt,
        mode: "enhance_with_tools",
        currentCode: currentApp.code,
        simulateDisconnect,
        toolContext: auditReport,
      });

      const updatedCode = res.result;
      const updatedApp: AppProject = {
        ...currentApp,
        code: updatedCode,
        updatedAt: new Date().toISOString(),
        usedProvider: res.usedProvider,
        offlineMode: res.offlineMode,
        history: [
          ...currentApp.history,
          {
            prompt: "Auto-Optimización por Herramientas de Auditoría",
            code: updatedCode,
            timestamp: new Date().toISOString(),
            provider: res.usedProvider,
          },
        ],
      };

      setCurrentApp(updatedApp);
      onSaveToGallery(updatedApp);

      onLogFailover({
        id: "log_" + Date.now(),
        timestamp: new Date().toISOString(),
        prompt: "Auto-Optimización con Herramientas Auto-Creadas",
        finalProvider: res.usedProvider,
        chain: res.failoverHistory,
        totalLatencyMs: res.totalLatencyMs,
        offlineMode: res.offlineMode,
      });
    } catch (err: any) {
      alert("Error al aplicar mejoras: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleCopyCode = () => {
    if (!currentApp?.code) return;
    navigator.clipboard.writeText(currentApp.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!currentApp?.code) return;
    const blob = new Blob([currentApp.code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentApp.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "omniforge-app"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenNewWindow = () => {
    if (!currentApp?.code) return;
    const blob = new Blob([currentApp.code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const reloadIframe = () => {
    if (iframeRef.current && currentApp?.code) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(currentApp.code);
        doc.close();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Prompt Creation Hero Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Crea Aplicaciones con Solo Texto
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Describe lo que quieres construir. El sistema Multi-IA enrutará tu petición y creará una aplicación completa, funcional y visualmente moderna.
              </p>
            </div>

            {/* AI Engine Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                {simulateDisconnect ? (
                  <span className="text-rose-400 font-semibold">Respaldo Offline Activo</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Gemini 3.8 Flash + Cascada</span>
                )}
              </span>
            </div>
          </div>

          {/* Text Input Box */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Ejemplo: Crea un generador de contraseñas seguras con medidor de fuerza, o un simulador de física..."
              rows={3}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 pr-32 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none shadow-inner"
            />
            <div className="absolute right-3 bottom-3.5 flex items-center gap-2">
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Crear App</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Inspiration Prompts */}
          <div className="pt-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Plantillas de Texto Rápidas (1 Clic)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {SAMPLE_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(item.prompt);
                    handleGenerate(item.prompt);
                  }}
                  className="bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Generation Progress Banner */}
        {isGenerating && (
          <div className="mt-4 p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-cyan-200 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-mono font-medium">{generationStep || "Procesando arquitectura de la app..."}</span>
            </div>
            <span className="text-[11px] text-cyan-300/80 font-mono">
              Enrutamiento Tolerante a Fallas
            </span>
          </div>
        )}
      </div>

      {/* 2. Interactive App Workspace */}
      {currentApp && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* Workspace Toolbar */}
          <div className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            {/* App Title & Provider Badge */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow">
                APP
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                  {currentApp.title}
                  {currentApp.offlineMode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      Offline Resiliente
                    </span>
                  )}
                </h3>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Motor: <strong className="text-slate-300">{currentApp.usedProvider}</strong></span>
                  <span>•</span>
                  <span>{new Date(currentApp.updatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* View Mode Switcher (Preview, Code, Tool Audit, Chat) */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveView("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === "preview"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Vista Previa</span>
              </button>
              <button
                onClick={() => setActiveView("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === "code"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Código</span>
              </button>
              <button
                onClick={() => setActiveView("audit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                  activeView === "audit"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Auditoría</span>
                {auditReport && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      auditReport.overallScore >= 80
                        ? "bg-emerald-500/30 text-emerald-300"
                        : "bg-amber-500/30 text-amber-300"
                    }`}
                  >
                    {auditReport.overallScore}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveView("chat")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === "chat"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Co-Piloto Chat</span>
              </button>
            </div>

            {/* Viewport & Quick Actions */}
            <div className="flex items-center gap-2">
              {activeView === "preview" && (
                <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-slate-400">
                  <button
                    onClick={() => setViewport("desktop")}
                    title="Escritorio (100%)"
                    className={`p-1.5 rounded ${viewport === "desktop" ? "bg-slate-800 text-cyan-400" : "hover:text-white"}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewport("tablet")}
                    title="Tablet (768px)"
                    className={`p-1.5 rounded ${viewport === "tablet" ? "bg-slate-800 text-cyan-400" : "hover:text-white"}`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewport("mobile")}
                    title="Móvil (375px)"
                    className={`p-1.5 rounded ${viewport === "mobile" ? "bg-slate-800 text-cyan-400" : "hover:text-white"}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              )}

              {onNavigateToWebInspector && (
                <button
                  onClick={onNavigateToWebInspector}
                  title="Inspeccionar seguridad y arquitectura de esta app en el Analizador Web"
                  className="px-2.5 py-1.5 bg-sky-950/70 hover:bg-sky-900/90 text-sky-300 border border-sky-500/30 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden lg:inline">Analizador Web</span>
                </button>
              )}

              <button
                onClick={reloadIframe}
                title="Recargar App"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopyCode}
                title="Copiar Código HTML"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition flex items-center gap-1 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleDownloadHtml}
                title="Descargar archivo .html"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleOpenNewWindow}
                title="Abrir en ventana completa"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="Pantalla Completa"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="bg-slate-950 p-3 sm:p-6 flex-1 flex flex-col items-center justify-center min-h-[500px]">
            {activeView === "preview" && (
              <div
                className={`w-full transition-all duration-300 flex flex-col items-center ${
                  viewport === "mobile"
                    ? "max-w-[375px]"
                    : viewport === "tablet"
                    ? "max-w-[768px]"
                    : "max-w-full"
                } ${isFullscreen ? "fixed inset-0 z-50 bg-slate-950 p-4 max-w-none" : ""}`}
              >
                {isFullscreen && (
                  <div className="w-full flex justify-end pb-2">
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl"
                    >
                      Salir de Pantalla Completa
                    </button>
                  </div>
                )}

                {/* Prominent NeuroCore Offline Contingency Notice */}
                {(currentApp.offlineMode || simulateDisconnect) && (
                  <div className="w-full mb-3 bg-gradient-to-r from-amber-950/95 via-orange-950/90 to-amber-950/95 border-2 border-amber-500/70 rounded-2xl p-3.5 px-4 shadow-2xl shadow-amber-950/60 flex flex-wrap items-center justify-between gap-3 text-amber-200 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
                        <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs sm:text-sm tracking-wider text-amber-100 uppercase">
                            ⚡ Motor de Contingencia Local NeuroCore Activo
                          </span>
                          <span className="text-[10px] bg-amber-500/30 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                            100% Autónomo
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-300/80 mt-0.5">
                          Esta aplicación está operando bajo el motor de contingencia local. Todos tus cambios y datos se guardan automáticamente en <strong>localStorage</strong> sin depender de servidores externos.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs font-mono text-amber-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      <span>Zero-Downtime • Auto-Save ON</span>
                    </div>
                  </div>
                )}

                <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-white relative">
                  <iframe
                    ref={iframeRef}
                    srcDoc={currentApp.code}
                    title="Live App Sandbox"
                    sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                    className="w-full h-[520px] border-none block"
                  />
                </div>

                {/* Console Log Toggle Bar */}
                <div className="w-full mt-3">
                  <button
                    onClick={() => setShowConsole(!showConsole)}
                    className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Consola de Ejecución en Vivo de la App</span>
                      {consoleLogs.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-cyan-300 font-mono">
                          {consoleLogs.length} eventos
                        </span>
                      )}
                    </div>
                    {showConsole ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showConsole && (
                    <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
                      {consoleLogs.length === 0 ? (
                        <div className="text-slate-600 text-center py-2">
                          No se han emitido eventos en consola. Interactúa con la app para ver logs.
                        </div>
                      ) : (
                        consoleLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 ${
                              log.type === "error"
                                ? "text-rose-400"
                                : log.type === "warn"
                                ? "text-amber-400"
                                : "text-slate-300"
                            }`}
                          >
                            <span className="text-[10px] text-slate-500">{log.time}</span>
                            <span className="font-semibold">[{log.type.toUpperCase()}]</span>
                            <span className="flex-1 break-all">{log.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Code Inspector View */}
            {activeView === "code" && (
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px]">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">index.html (Autónomo con Tailwind y JavaScript)</span>
                  <span>{currentApp.code.length} caracteres • {currentApp.code.split("\n").length} líneas</span>
                </div>
                <pre className="p-4 flex-1 overflow-auto text-xs font-mono text-slate-200 leading-relaxed select-all">
                  <code>{currentApp.code}</code>
                </pre>
              </div>
            )}

            {/* Tool Audit View */}
            {activeView === "audit" && auditReport && (
              <div className="w-full space-y-4 max-w-4xl">
                {/* Score Summary Banner */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-2xl border ${
                        auditReport.overallScore >= 85
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : auditReport.overallScore >= 70
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                          : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                      }`}
                    >
                      <span>{auditReport.overallScore}</span>
                      <span className="text-[9px] font-sans font-normal text-slate-400">/ 100</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        Puntuación de Calidad por Herramientas Auto-Creadas
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{auditReport.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoImproveWithTools}
                      disabled={isGenerating}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-900/30 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Mejorar App con Hallazgos</span>
                    </button>
                    <button
                      onClick={onNavigateToTools}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
                    >
                      Ver Todas las Herramientas
                    </button>
                  </div>
                </div>

                {/* Tool Findings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditReport.toolResults.map((result) => (
                    <div key={result.toolId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{result.toolName}</span>
                          <span className="text-[10px] px-2 py-0.2 bg-slate-800 text-slate-400 rounded-full">
                            {result.category}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                            result.score >= 80 ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {result.score}%
                        </span>
                      </div>

                      {result.issues.length > 0 ? (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Observaciones a corregir:
                          </span>
                          <ul className="text-xs text-slate-300 space-y-1 pl-3 list-disc">
                            {result.issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> No se detectaron problemas críticos.
                        </div>
                      )}

                      {result.recommendations.length > 0 && (
                        <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                          <strong>Recomendación:</strong> {result.recommendations.join(" ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Co-pilot View */}
            {activeView === "chat" && (
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px] max-w-4xl shadow-2xl">
                {/* Chat Header */}
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">Co-Piloto Conversacional OmniForge</h4>
                      <p className="text-[10px] text-slate-400">Preguntas sobre el código y sugerencias en tiempo real</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setChatMessages([
                        {
                          sender: "assistant",
                          text: "Historial reiniciado. ¿En qué puedo ayudarte ahora?",
                          time: new Date().toLocaleTimeString(),
                        },
                      ])
                    }
                    className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    Limpiar Chat
                  </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/60">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                          msg.sender === "user"
                            ? "bg-cyan-600 text-white"
                            : "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                        }`}
                      >
                        {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-cyan-600 text-white rounded-tr-none shadow-md"
                            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <span className="block text-[9px] text-slate-400 text-right mt-1 opacity-70">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isChatting && (
                    <div className="flex gap-3 max-w-[85%] mr-auto items-center text-xs text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                        <span>Analizando código con la red Multi-IA...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Quick suggestions pills */}
                <div className="bg-slate-950 px-4 py-2 border-t border-slate-850 flex items-center gap-2 overflow-x-auto text-[11px]">
                  <span className="text-slate-500 shrink-0">Sugerencias:</span>
                  <button
                    onClick={() => handleSendChatMessage("¿Cómo funciona el almacenamiento localStorage en esta app?")}
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition"
                  >
                    ¿Cómo funciona localStorage?
                  </button>
                  <button
                    onClick={() => handleSendChatMessage("Explícame la arquitectura principal del código")}
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition"
                  >
                    Explicar arquitectura
                  </button>
                  <button
                    onClick={() => handleSendChatMessage("¿Qué mejoras de UX o diseño me recomiendas?")}
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition"
                  >
                    Sugerencias de UX
                  </button>
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    placeholder="Escribe tu consulta sobre el código o pide recomendaciones..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleSendChatMessage()}
                    disabled={isChatting || !chatInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Iterative Refinement Input Bar */}
          <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={modifyPrompt}
                  onChange={(e) => setModifyPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleModify();
                    }
                  }}
                  placeholder="Instrucción de ajuste (ej: 'Haz los botones más grandes', 'Agrega modo oscuro neón', 'Permite exportar a CSV')..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
              <button
                onClick={handleModify}
                disabled={isGenerating || !modifyPrompt.trim()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-400 hover:text-cyan-300 font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aplicar Modificación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
