import React, { useState } from "react";
import {
  FolderCode,
  Search,
  Download,
  Copy,
  ExternalLink,
  Trash2,
  Play,
  Check,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppProject } from "../types";

interface AppGalleryViewProps {
  savedApps: AppProject[];
  onSelectApp: (app: AppProject) => void;
  onDeleteApp: (id: string) => void;
  onNewApp: () => void;
}

export const AppGalleryView: React.FC<AppGalleryViewProps> = ({
  savedApps,
  onSelectApp,
  onDeleteApp,
  onNewApp,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredApps = savedApps.filter(
    (app) =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.usedProvider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (app: AppProject) => {
    navigator.clipboard.writeText(app.code);
    setCopiedId(app.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (app: AppProject) => {
    const blob = new Blob([app.code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "app"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <FolderCode className="w-3.5 h-3.5" />
            Colección de Software
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            Galería de Aplicaciones Generadas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Historial de aplicaciones creadas por texto. Puedes reabrirlas en el estudio, modificarlas o descargarlas para ejecutarlas en cualquier navegador.
          </p>
        </div>

        <button
          onClick={onNewApp}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-cyan-950/50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Crear Nueva Aplicación</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar aplicaciones por título, descripción o motor de IA..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center space-y-3">
          <FolderCode className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No se encontraron aplicaciones</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm ? "Intenta con otro término de búsqueda." : "Aún no has generado aplicaciones. Ve al Estudio para crear la primera."}
          </p>
          <button
            onClick={onNewApp}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700"
          >
            Ir al Estudio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs font-black">
                      HTML
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition line-clamp-1">
                        {app.title}
                      </h4>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      app.offlineMode
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    }`}
                  >
                    {app.offlineMode ? "Offline" : "Online Multi-IA"}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Prompt original:
                  </span>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    "{app.prompt}"
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Motor: <strong className="text-slate-300">{app.usedProvider}</strong></span>
                  {app.lastAnalysis && (
                    <span className="text-emerald-400 font-bold">
                      Calidad: {app.lastAnalysis.overallScore}/100
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectApp(app)}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Abrir en Estudio</span>
                </button>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleCopy(app)}
                    title="Copiar código"
                    className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition"
                  >
                    {copiedId === app.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownload(app)}
                    title="Descargar archivo"
                    className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteApp(app.id)}
                    title="Eliminar de galería"
                    className="p-2 hover:bg-slate-800 hover:text-rose-400 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
