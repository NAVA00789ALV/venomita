import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Wifi,
  WifiOff,
  Server,
  Activity,
  ArrowDown,
  RotateCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Terminal,
  Cpu,
  Play,
} from "lucide-react";
import { FailoverNode, FailoverLog, CustomProviderConfig } from "../types";
import { pingModel } from "../services/aiApi";

interface ResilienceHubViewProps {
  models: FailoverNode[];
  failoverLogs: FailoverLog[];
  simulateDisconnect: boolean;
  setSimulateDisconnect: (val: boolean) => void;
  customConfig: CustomProviderConfig;
  setCustomConfig: React.Dispatch<React.SetStateAction<CustomProviderConfig>>;
  onTestPrompt: (prompt: string) => void;
}

export const ResilienceHubView: React.FC<ResilienceHubViewProps> = ({
  models,
  failoverLogs,
  simulateDisconnect,
  setSimulateDisconnect,
  customConfig,
  setCustomConfig,
  onTestPrompt,
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<Record<string, number>>({});
  const [testPromptText, setTestPromptText] = useState("Genera un cronómetro con animación de cuenta regresiva");
  const [isTesting, setIsTesting] = useState(false);

  const handlePingAll = async () => {
    setIsPinging(true);
    const results: Record<string, number> = {};
    for (const model of models) {
      if (model.id !== "custom-provider") {
        const res = await pingModel(model.id);
        results[model.id] = res.latencyMs;
      }
    }
    setPingResults(results);
    setIsPinging(false);
  };

  const handleRunChaosTest = async () => {
    setIsTesting(true);
    await onTestPrompt(testPromptText);
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Arquitectura de Alta Disponibilidad
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
              Centro de Resiliencia Multi-IA Tolerante a Desconexión
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Diseñado para que la plataforma <strong>nunca quede inútil</strong>. Si el servicio primario sufre caídas de red, cuotas agotadas o desconexión, la cascada conmuta automáticamente a los modelos secundarios y al motor autónomo offline NeuroCore.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePingAll}
              disabled={isPinging}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2 shadow"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isPinging ? "Midiendo..." : "Probar Latencia en Vivo"}</span>
            </button>

            <button
              onClick={() => setSimulateDisconnect(!simulateDisconnect)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                simulateDisconnect
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              {simulateDisconnect ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              <span>{simulateDisconnect ? "Desactivar Desconexión" : "Simular Desconexión"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Cascade Architecture Pipeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Diagrama del Flujo de Cascada Redundante
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Node 1: Primary Gemini */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              simulateDisconnect
                ? "bg-slate-950/80 border-rose-500/40 opacity-70"
                : "bg-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-950/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                NIVEL 1 • PRINCIPAL
              </span>
              {simulateDisconnect ? (
                <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Desconectado
                </span>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                </span>
              )}
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Gemini 3.8 Flash</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Motor principal de razonamiento rápido y generación de código interactivo.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Latencia:</span>
              <span className="text-emerald-400 font-bold">
                {pingResults["gemini-3.8-flash"] ? `${pingResults["gemini-3.8-flash"]} ms` : "240 ms"}
              </span>
            </div>
          </div>

          {/* Node 2: Fast Backup */}
          <div className="p-4 rounded-2xl border bg-slate-950 border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                NIVEL 2 • RESPALDO
              </span>
              <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Standby Activo
              </span>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Gemini 3.1 Flash Lite</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Modelo ultra-ligero y de alta velocidad en caso de timeout en el primario.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Latencia:</span>
              <span className="text-cyan-400 font-bold">
                {pingResults["gemini-3.1-flash-lite"] ? `${pingResults["gemini-3.1-flash-lite"]} ms` : "160 ms"}
              </span>
            </div>
          </div>

          {/* Node 3: Custom / Ollama Local */}
          <div className="p-4 rounded-2xl border bg-slate-950 border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                NIVEL 3 • LOCAL / EXTERNO
              </span>
              <span className="text-xs text-purple-400 font-semibold">
                {customConfig.enabled ? "Configurado" : "Opcional"}
              </span>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Ollama / Custom API</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Soporte para endpoints OpenAI compatibles o LLM local sin salir de la máquina.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Modo:</span>
              <span className="text-purple-300">
                {customConfig.enabled ? customConfig.model || "Local" : "No asignado"}
              </span>
            </div>
          </div>

          {/* Node 4: NeuroCore Offline Safeguard */}
          <div className="p-4 rounded-2xl border bg-slate-950 border-amber-500/40 shadow-lg shadow-amber-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                NIVEL 4 • CONTINGENCIA
              </span>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Inmune
              </span>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">NeuroCore Offline Engine</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Sintetizador heurístico local. Genera y repara aplicaciones aún con cero conexión a internet.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Disponibilidad:</span>
              <span className="text-amber-400 font-bold">100.0% SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Chaos Test Bench & Custom Provider Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Bench */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Banco de Pruebas de Desconexión
            </h3>
            {simulateDisconnect && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold animate-pulse">
                Desconexión Simulada ON
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Envía una petición de prueba para observar en vivo cómo el sistema detecta la falla y conmuta al siguiente nodo sin detenerse.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              value={testPromptText}
              onChange={(e) => setTestPromptText(e.target.value)}
              placeholder="Prompt para la prueba de conmutación..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleRunChaosTest}
              disabled={isTesting}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              {isTesting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Conmutando nodos y generando...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Lanzar Prueba de Resiliencia</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Provider (Ollama / Local LLM) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> Proveedor Local Opcional (Ollama / 3P)
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-400">Habilitar</span>
              <input
                type="checkbox"
                checked={customConfig.enabled}
                onChange={(e) => setCustomConfig({ ...customConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-purple-500 rounded"
              />
            </label>
          </div>
          <p className="text-xs text-slate-400">
            Conecta un endpoint local (como Ollama en <code className="text-purple-300">http://localhost:11434/v1</code>) para tener un modelo LLM propio como segundo respaldo.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">URL Endpoint (OpenAI-compatible)</label>
              <input
                type="text"
                value={customConfig.endpoint}
                onChange={(e) => setCustomConfig({ ...customConfig, endpoint: e.target.value })}
                placeholder="http://localhost:11434/v1/chat/completions"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Nombre del Modelo</label>
                <input
                  type="text"
                  value={customConfig.model}
                  onChange={(e) => setCustomConfig({ ...customConfig, model: e.target.value })}
                  placeholder="llama3 / mistral / deepseek"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">API Key (Opcional si es local)</label>
                <input
                  type="password"
                  value={customConfig.apiKey}
                  onChange={(e) => setCustomConfig({ ...customConfig, apiKey: e.target.value })}
                  placeholder="Bearer token o 'ollama'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Failover Event Audit Trail */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Registro de Eventos de Enrutamiento y Conmutación ({failoverLogs.length})
        </h3>

        {failoverLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            Aún no hay registros de conmutación. Genera una app o corre el Banco de Pruebas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Prompt</th>
                  <th className="p-3">Proveedor Final</th>
                  <th className="p-3">Pasos de Cascada</th>
                  <th className="p-3">Latencia Total</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {failoverLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 max-w-xs truncate text-slate-200" title={log.prompt}>
                      {log.prompt}
                    </td>
                    <td className="p-3 font-semibold text-cyan-300">{log.finalProvider}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {log.chain.map((c, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              c.status === "success"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {c.model} ({c.status})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-slate-400">{log.totalLatencyMs} ms</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.offlineMode
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {log.offlineMode ? "Respaldo Offline" : "Online Directo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
