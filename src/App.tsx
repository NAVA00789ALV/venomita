/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { AppStudio } from "./components/AppStudio";
import { SelfEvolvingToolsView } from "./components/SelfEvolvingToolsView";
import { WebInspectorView } from "./components/WebInspectorView";
import { ResilienceHubView } from "./components/ResilienceHubView";
import { AppGalleryView } from "./components/AppGalleryView";
import {
  AppProject,
  DynamicTool,
  FailoverLog,
  FailoverNode,
  CustomProviderConfig,
} from "./types";
import { DEFAULT_TOOLS } from "./services/toolRunner";
import { fetchAIStatus, generateContentWithFailover } from "./services/aiApi";

export default function App() {
  const [activeTab, setActiveTab] = useState<"studio" | "tools" | "web_inspector" | "resilience" | "gallery">("studio");
  const [simulateDisconnect, setSimulateDisconnect] = useState<boolean>(false);
  const [currentApp, setCurrentApp] = useState<AppProject | null>(null);

  // Dynamic tools state (persisted)
  const [tools, setTools] = useState<DynamicTool[]>(() => {
    try {
      const stored = localStorage.getItem("omniforge_tools");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_TOOLS;
  });

  // Saved applications gallery (persisted)
  const [savedApps, setSavedApps] = useState<AppProject[]>(() => {
    try {
      const stored = localStorage.getItem("omniforge_apps");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  // Failover event logs (persisted)
  const [failoverLogs, setFailoverLogs] = useState<FailoverLog[]>(() => {
    try {
      const stored = localStorage.getItem("omniforge_failover_logs");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  // Custom provider config (persisted)
  const [customConfig, setCustomConfig] = useState<CustomProviderConfig>(() => {
    try {
      const stored = localStorage.getItem("omniforge_custom_provider");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      enabled: false,
      name: "Ollama Local",
      endpoint: "http://localhost:11434/v1/chat/completions",
      apiKey: "ollama",
      model: "llama3",
    };
  });

  // Models status from server
  const [models, setModels] = useState<FailoverNode[]>([
    {
      id: "gemini-3.8-flash",
      name: "Gemini 3.8 Flash (Principal)",
      provider: "Google Gemini",
      role: "primary",
      status: "online",
      latencyMs: 240,
    },
    {
      id: "gemini-3.1-flash-lite",
      name: "Gemini 3.1 Flash Lite (Respaldo Rápido)",
      provider: "Google Gemini",
      role: "fallback-1",
      status: "online",
      latencyMs: 160,
    },
    {
      id: "custom-provider",
      name: "Proveedor Externo / Local (Ollama/OpenAI)",
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
  ]);

  // Save tools to storage
  useEffect(() => {
    try {
      localStorage.setItem("omniforge_tools", JSON.stringify(tools));
    } catch (e) {}
  }, [tools]);

  // Save apps to storage
  useEffect(() => {
    try {
      localStorage.setItem("omniforge_apps", JSON.stringify(savedApps));
    } catch (e) {}
  }, [savedApps]);

  // Save failover logs to storage
  useEffect(() => {
    try {
      localStorage.setItem("omniforge_failover_logs", JSON.stringify(failoverLogs));
    } catch (e) {}
  }, [failoverLogs]);

  // Save custom config to storage
  useEffect(() => {
    try {
      localStorage.setItem("omniforge_custom_provider", JSON.stringify(customConfig));
    } catch (e) {}
  }, [customConfig]);

  // Check models status on load
  useEffect(() => {
    fetchAIStatus().then((status) => {
      if (status.models && status.models.length > 0) {
        setModels(status.models);
      }
    });
  }, []);

  const handleSaveToGallery = (app: AppProject) => {
    setSavedApps((prev) => {
      const filtered = prev.filter((a) => a.id !== app.id);
      return [app, ...filtered];
    });
  };

  const handleDeleteApp = (id: string) => {
    setSavedApps((prev) => prev.filter((a) => a.id !== id));
    if (currentApp?.id === id) {
      setCurrentApp(null);
    }
  };

  const handleLogFailover = (log: FailoverLog) => {
    setFailoverLogs((prev) => [log, ...prev.slice(0, 49)]);
  };

  const handleTestChaosPrompt = async (promptText: string) => {
    const res = await generateContentWithFailover({
      prompt: promptText,
      mode: "create_app",
      simulateDisconnect,
      customProvider: customConfig.enabled ? customConfig : undefined,
    });

    const newApp: AppProject = {
      id: "app_test_" + Date.now(),
      title: `[Prueba] ${promptText.slice(0, 30)}`,
      prompt: promptText,
      code: res.result,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedProvider: res.usedProvider,
      offlineMode: res.offlineMode,
      history: [
        {
          prompt: promptText,
          code: res.result,
          timestamp: new Date().toISOString(),
          provider: res.usedProvider,
        },
      ],
    };

    setCurrentApp(newApp);
    handleSaveToGallery(newApp);

    handleLogFailover({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      prompt: promptText,
      finalProvider: res.usedProvider,
      chain: res.failoverHistory,
      totalLatencyMs: res.totalLatencyMs,
      offlineMode: res.offlineMode,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simulateDisconnect={simulateDisconnect}
        setSimulateDisconnect={setSimulateDisconnect}
        models={models}
        activeToolsCount={tools.filter((t) => t.enabled).length}
        totalAppsCount={savedApps.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "studio" && (
          <AppStudio
            currentApp={currentApp}
            setCurrentApp={setCurrentApp}
            onSaveToGallery={handleSaveToGallery}
            tools={tools}
            simulateDisconnect={simulateDisconnect}
            onLogFailover={handleLogFailover}
            onNavigateToTools={() => setActiveTab("tools")}
            onNavigateToWebInspector={() => setActiveTab("web_inspector")}
          />
        )}

        {activeTab === "tools" && (
          <SelfEvolvingToolsView
            tools={tools}
            setTools={setTools}
            currentApp={currentApp}
            setCurrentApp={setCurrentApp}
            simulateDisconnect={simulateDisconnect}
            onNavigateToStudio={() => setActiveTab("studio")}
          />
        )}

        {activeTab === "web_inspector" && (
          <WebInspectorView
            currentApp={currentApp}
            onAdoptApp={(app) => {
              setCurrentApp(app);
              setSavedApps((prev) => [app, ...prev]);
            }}
            onAddSynthesizedTool={(tool) => setTools((prev) => [tool, ...prev])}
            simulateDisconnect={simulateDisconnect}
            onNavigateToStudio={() => setActiveTab("studio")}
          />
        )}

        {activeTab === "resilience" && (
          <ResilienceHubView
            models={models}
            failoverLogs={failoverLogs}
            simulateDisconnect={simulateDisconnect}
            setSimulateDisconnect={setSimulateDisconnect}
            customConfig={customConfig}
            setCustomConfig={setCustomConfig}
            onTestPrompt={handleTestChaosPrompt}
          />
        )}

        {activeTab === "gallery" && (
          <AppGalleryView
            savedApps={savedApps}
            onSelectApp={(app) => {
              setCurrentApp(app);
              setActiveTab("studio");
            }}
            onDeleteApp={handleDeleteApp}
            onNewApp={() => {
              setActiveTab("studio");
            }}
          />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 sm:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>OmniForge AI • Multi-Model Resilience & Autonomous Tool Synthesizer</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Gemini 3.8 Flash</span>
          <span>•</span>
          <span>Gemini 3.1 Flash Lite</span>
          <span>•</span>
          <span>NeuroCore Engine</span>
          <span>•</span>
          <span className="text-emerald-400">Zero-Downtime Guarantee</span>
        </div>
      </footer>
    </div>
  );
}
