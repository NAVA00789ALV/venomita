import React from "react";
import {
  Sparkles,
  Wrench,
  ShieldCheck,
  FolderCode,
  Wifi,
  WifiOff,
  Activity,
  Zap,
  Globe,
} from "lucide-react";
import { FailoverNode } from "../types";

interface HeaderProps {
  activeTab: "studio" | "tools" | "web_inspector" | "resilience" | "gallery";
  setActiveTab: (tab: "studio" | "tools" | "web_inspector" | "resilience" | "gallery") => void;
  simulateDisconnect: boolean;
  setSimulateDisconnect: (val: boolean) => void;
  models: FailoverNode[];
  activeToolsCount: number;
  totalAppsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  simulateDisconnect,
  setSimulateDisconnect,
  models,
  activeToolsCount,
  totalAppsCount,
}) => {
  const primaryModel = models.find((m) => m.role === "primary");
  const isOnline = !simulateDisconnect && primaryModel?.status === "online";

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  OmniForge <span className="text-cyan-400 font-mono text-sm">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v3.8 Multi-Route
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Estudio de Apps por Texto & Herramientas Auto-Creadas
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("studio")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "studio"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estudio</span>
            </button>

            <button
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === "tools"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Auto-Herramientas</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-900/80 border border-purple-500/40 text-purple-200 font-mono">
                {activeToolsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("web_inspector")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === "web_inspector"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Analizador Web</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-sky-900/80 border border-sky-400/30 text-sky-200 font-mono">
                Nuevo
              </span>
            </button>

            <button
              onClick={() => setActiveTab("resilience")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "resilience"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Redundancia Multi-IA</span>
              <span className="md:hidden">Redundancia</span>
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "gallery"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <FolderCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Galería</span>
              <span className="text-[10px] text-slate-500 font-mono">({totalAppsCount})</span>
            </button>
          </nav>

          {/* Connection Status & Chaos Simulation Switch */}
          <div className="flex items-center gap-3">
            {/* Failover Status Badge */}
            <div
              className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs border transition-all ${
                simulateDisconnect
                  ? "bg-rose-950/60 border-rose-500/40 text-rose-300"
                  : isOnline
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/60 border-amber-500/40 text-amber-300"
              }`}
            >
              {simulateDisconnect ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span className="font-mono text-[11px] font-semibold">Simulación Desconexión</span>
                </>
              ) : isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-mono text-[11px] font-semibold">Cascada Multi-IA Lista</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-[11px] font-semibold">Respaldo Autónomo</span>
                </>
              )}
            </div>

            {/* Disconnect Simulation Toggle Button */}
            <button
              onClick={() => setSimulateDisconnect(!simulateDisconnect)}
              title={
                simulateDisconnect
                  ? "Desactivar simulación de desconexión (volver a la normalidad)"
                  : "Simular desconexión de red / API para probar el salto automático a los motores de respaldo"
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                simulateDisconnect
                  ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/30"
                  : "bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white"
              }`}
            >
              {simulateDisconnect ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono">Restaurar Red</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Simular Desconexión</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Disconnect Warning Banner when active (Mejora 2) */}
      {simulateDisconnect && (
        <div className="bg-gradient-to-r from-rose-950 via-amber-950 to-orange-950 border-b-2 border-amber-500/60 px-4 py-2 text-center text-xs text-amber-100 flex flex-wrap items-center justify-center gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <WifiOff className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-bold tracking-wide uppercase text-amber-200">
              Desconexión Simulada Activa:
            </span>
          </div>
          <span className="text-slate-200">
            El motor de contingencia <strong>NeuroCore Offline</strong> ha tomado el control. Puedes continuar creando y editando apps con almacenamiento local <strong>(localStorage)</strong> automático.
          </span>
          <button
            onClick={() => setSimulateDisconnect(false)}
            className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] transition ml-2 shadow"
          >
            Reconectar Red
          </button>
        </div>
      )}
    </header>
  );
};
