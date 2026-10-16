import React, { useState } from "react";
import {
  Wrench,
  Sparkles,
  ShieldAlert,
  Eye,
  Gauge,
  Smartphone,
  Stethoscope,
  Plus,
  Play,
  Check,
  AlertTriangle,
  Code2,
  Trash2,
  Cpu,
  ArrowRight,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { DynamicTool, AppProject, AnalysisReport } from "../types";
import { generateContentWithFailover } from "../services/aiApi";
import { executeTool, runFullAudit } from "../services/toolRunner";

interface SelfEvolvingToolsViewProps {
  tools: DynamicTool[];
  setTools: React.Dispatch<React.SetStateAction<DynamicTool[]>>;
  currentApp: AppProject | null;
  setCurrentApp: (app: AppProject) => void;
  simulateDisconnect: boolean;
  onNavigateToStudio: () => void;
}

const TOOL_IDEAS = [
  "Crea una herramienta que audite si la app tiene atajos de teclado y accesibilidad por teclas.",
  "Crea una herramienta que verifique la paleta de colores para modo oscuro y contraste de temas.",
  "Crea una herramienta que detecte posibles fugas de memoria o bucles sin cancelar en Canvas o WebAudio.",
  "Crea una herramienta que analice la densidad de contenido y legibilidad tipográfica en móviles.",
];

export const SelfEvolvingToolsView: React.FC<SelfEvolvingToolsViewProps> = ({
  tools,
  setTools,
  currentApp,
  setCurrentApp,
  simulateDisconnect,
  onNavigateToStudio,
}) => {
  const [toolPrompt, setToolPrompt] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<DynamicTool | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [lastAudit, setLastAudit] = useState<AnalysisReport | null>(currentApp?.lastAnalysis || null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const getToolIcon = (name: string, category: string) => {
    if (category === "Seguridad") return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    if (category === "Accesibilidad") return <Eye className="w-5 h-5 text-amber-400" />;
    if (category === "Rendimiento") return <Gauge className="w-5 h-5 text-cyan-400" />;
    if (category === "UX") return <Smartphone className="w-5 h-5 text-indigo-400" />;
    if (category === "Código") return <Stethoscope className="w-5 h-5 text-emerald-400" />;
    return <Cpu className="w-5 h-5 text-purple-400" />;
  };

  // Synthesize new tool with AI
  const handleSynthesizeTool = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || toolPrompt;
    if (!targetPrompt.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    try {
      const res = await generateContentWithFailover({
        prompt: `Crea una nueva herramienta de software para analizar y mejorar código web: "${targetPrompt}".
Asegúrate de devolver un objeto JSON con { id, name, category, description, code }.
El campo "code" debe ser una función JavaScript ejecutable con firma: async function analyze(html) { ... devuelve { score, issues, recommendations, passed } }`,
        mode: "synthesize_tool",
        simulateDisconnect,
      });

      let parsedTool: any = null;
      try {
        // Strip markdown blocks if returned
        const cleaned = res.result.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsedTool = JSON.parse(cleaned);
      } catch (e) {
        // Fallback tool object if JSON parsing was loose
        parsedTool = {
          id: "synth_" + Date.now(),
          name: targetPrompt.slice(0, 35),
          category: "Calidad",
          description: targetPrompt,
          code: `async function analyze(html) {
            const issues = [];
            const recommendations = [];
            let score = 90;
            if (!html.includes('id=')) {
              issues.push('Pocos identificadores semánticos en el DOM.');
              score -= 10;
            }
            recommendations.push('Revisar la integración dinámica.');
            return { score, issues, recommendations, passed: score >= 70 };
          }`,
        };
      }

      const newTool: DynamicTool = {
        id: parsedTool.id || "tool_" + Date.now(),
        name: parsedTool.name || "Herramienta Sintetizada",
        category: parsedTool.category || "Calidad",
        description: parsedTool.description || targetPrompt,
        icon: "Cpu",
        code: parsedTool.code,
        isDefault: false,
        isSynthesized: true,
        enabled: true,
      };

      setTools((prev) => [newTool, ...prev]);
      setToolPrompt("");
      setSuccessToast(`¡Herramienta "${newTool.name}" sintetizada y agregada a la suite activa!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert("Error al sintetizar herramienta: " + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Run all tools on current app
  const handleRunAllTools = async () => {
    if (!currentApp?.code) {
      alert("No hay una aplicación activa en el estudio. Crea una en el Estudio primero.");
      return;
    }
    setIsRunningAudit(true);
    try {
      const report = await runFullAudit(tools, currentApp.code);
      setLastAudit(report);
      setCurrentApp({
        ...currentApp,
        lastAnalysis: report,
      });
      setSuccessToast("Auditoría completada exitosamente con todas las herramientas activas.");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert("Error ejecutando auditoría: " + err.message);
    } finally {
      setIsRunningAudit(false);
    }
  };

  // Toggle tool
  const toggleTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  // Delete synthesized tool
  const deleteTool = (toolId: string) => {
    setTools((prev) => prev.filter((t) => t.id !== toolId));
    if (selectedTool?.id === toolId) setSelectedTool(null);
  };

  // Test single tool
  const handleTestSingleTool = async (tool: DynamicTool) => {
    if (!currentApp?.code) {
      alert("No hay una aplicación cargada para probar.");
      return;
    }
    const result = await executeTool(tool, currentApp.code);
    alert(`Resultado de "${tool.name}":\nPuntuación: ${result.score}/100\nProblemas: ${result.issues.length ? result.issues.join("\n- ") : "Ninguno"}\nRecomendaciones: ${result.recommendations.join("\n- ")}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Meta-Programación Autónoma
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              Herramientas que la IA Crea para Analizar y Mejorar
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              La IA no está limitada a funciones predeterminadas: puede programar dinámicamente nuevas herramientas de software en JavaScript, registrarlas en su suite activa y ejecutarlas sobre el código de la app para auto-mejorarse continuamente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAllTools}
              disabled={isRunningAudit || !currentApp}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-purple-900/30 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{isRunningAudit ? "Auditando..." : "Ejecutar Suite Completa"}</span>
            </button>
          </div>
        </div>

        {/* Synthesizer Form */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-purple-400" /> Sintetizar Nueva Herramienta a Medida
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={toolPrompt}
              onChange={(e) => setToolPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSynthesizeTool();
                }
              }}
              placeholder="Ej: 'Crea una herramienta que revise si el código tiene animaciones fluidas de 60fps'..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => handleSynthesizeTool()}
              disabled={isSynthesizing || !toolPrompt.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Programando Herramienta...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sintetizar con IA</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Idea Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" /> Ideas rápidas:
            </span>
            {TOOL_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setToolPrompt(idea);
                  handleSynthesizeTool(idea);
                }}
                className="text-[11px] bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-purple-300 px-2.5 py-1 rounded-lg border border-slate-800 transition truncate max-w-xs"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Report Banner if exists */}
      {lastAudit && currentApp && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-xl border ${
                lastAudit.overallScore >= 80
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/40 text-amber-400"
              }`}
            >
              <span>{lastAudit.overallScore}</span>
              <span className="text-[8px] font-sans text-slate-400">PUNTOS</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Auditoría de la App Actual ("{currentApp.title}")
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{lastAudit.summary}</div>
            </div>
          </div>

          <button
            onClick={onNavigateToStudio}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>Ver Aplicación en el Estudio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-400" /> Suite de Herramientas Dinámicas ({tools.length})
          </h3>
          <span className="text-xs text-slate-400">
            {tools.filter((t) => t.enabled).length} de {tools.length} activadas para auditar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                tool.enabled
                  ? "border-slate-800 shadow-md hover:border-slate-700"
                  : "border-slate-900 opacity-60 bg-slate-950/60"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getToolIcon(tool.name, tool.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        {tool.name}
                        {tool.isSynthesized && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Auto-Creada
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    onChange={() => toggleTool(tool.id)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTool(tool)}
                    className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Ver Código JS</span>
                  </button>
                  <button
                    onClick={() => handleTestSingleTool(tool)}
                    className="text-slate-400 hover:text-purple-400 flex items-center gap-1 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Probar</span>
                  </button>
                </div>

                {tool.isSynthesized && (
                  <button
                    onClick={() => deleteTool(tool.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Eliminar herramienta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Modal for Selected Tool */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {getToolIcon(selectedTool.name, selectedTool.category)}
                <div>
                  <h3 className="font-bold text-base text-slate-100">{selectedTool.name}</h3>
                  <p className="text-xs text-slate-400">{selectedTool.category} • Función ejecutable de análisis</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTool(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedTool.description}</p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-80 overflow-auto">
              <pre className="text-xs font-mono text-purple-300 leading-relaxed">
                <code>{selectedTool.code}</code>
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleTestSingleTool(selectedTool)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Ejecutar sobre App Actual</span>
              </button>
              <button
                onClick={() => setSelectedTool(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
