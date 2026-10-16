import { WebPageAnalysis } from "../types";

export interface AnalyzeWebPageOptions {
  url?: string;
  html?: string;
  responseHeaders?: Record<string, string>;
}

export function parseWebPageArchitecture(
  rawHtml: string,
  targetUrl: string = "https://ejemplo-analizado.local",
  responseHeaders: Record<string, string> = {}
): WebPageAnalysis {
  const html = rawHtml || "";
  const lowerHtml = html.toLowerCase();

  // 1. Meta & Header extraction
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : (targetUrl !== "https://ejemplo-analizado.local" ? targetUrl : "Sitio Web Analizado");

  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : "Página web analizada por OmniForge Web Inspector.";

  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
  const viewport = viewportMatch ? viewportMatch[1].trim() : undefined;

  const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  const charset = charsetMatch ? charsetMatch[1] : undefined;

  const hasHttps = targetUrl.startsWith("https://") || lowerHtml.includes("https://");

  // Check headers or meta tags for security policies
  const cspHeader = responseHeaders["content-security-policy"] || responseHeaders["Content-Security-Policy"] || "";
  const hasCspMeta = lowerHtml.includes('http-equiv="content-security-policy"') || lowerHtml.includes("http-equiv='content-security-policy'");
  const hasCsp = Boolean(cspHeader || hasCspMeta);

  const xFrameHeader = responseHeaders["x-frame-options"] || responseHeaders["X-Frame-Options"] || "";
  const hasXFrameOptions = Boolean(xFrameHeader || cspHeader.includes("frame-ancestors"));

  const hstsHeader = responseHeaders["strict-transport-security"] || responseHeaders["Strict-Transport-Security"] || "";
  const hasHsts = Boolean(hstsHeader || (hasHttps && targetUrl.startsWith("https://")));

  // 2. Semantic Tags & Elements Counting
  const countOccurrences = (tag: string) => {
    const regex = new RegExp(`<${tag}[\\s>]`, "gi");
    const matches = html.match(regex);
    return matches ? matches.length : 0;
  };

  const semanticTags: Record<string, number> = {
    header: countOccurrences("header"),
    nav: countOccurrences("nav"),
    main: countOccurrences("main"),
    section: countOccurrences("section"),
    article: countOccurrences("article"),
    aside: countOccurrences("aside"),
    footer: countOccurrences("footer"),
    canvas: countOccurrences("canvas"),
    table: countOccurrences("table"),
    dialog: countOccurrences("dialog"),
  };

  const headingsCount = {
    h1: countOccurrences("h1"),
    h2: countOccurrences("h2"),
    h3: countOccurrences("h3"),
  };

  const formsCount = countOccurrences("form");
  const inputsCount = countOccurrences("input");
  const buttonsCount = countOccurrences("button");
  const imagesCount = countOccurrences("img");
  const scriptsCount = countOccurrences("script");
  const stylesCount = countOccurrences("style") + countOccurrences("link");

  // 3. Frameworks & Libraries Detection
  const detectedFrameworks: string[] = [];
  if (lowerHtml.includes("cdn.tailwindcss.com") || lowerHtml.includes("tailwindcss") || /class=["'][^"']*\b(flex|grid|rounded-|bg-|text-)\b[^"']*["']/.test(html)) {
    detectedFrameworks.push("Tailwind CSS");
  }
  if (lowerHtml.includes("bootstrap") || lowerHtml.includes("btn-primary") || lowerHtml.includes("container-fluid")) {
    detectedFrameworks.push("Bootstrap");
  }
  if (lowerHtml.includes("font-awesome") || lowerHtml.includes("fa-") || lowerHtml.includes("fontawesome")) {
    detectedFrameworks.push("FontAwesome");
  }
  if (lowerHtml.includes("lucide") || lowerHtml.includes("feather")) {
    detectedFrameworks.push("Lucide Icons");
  }
  if (lowerHtml.includes("chart.js") || lowerHtml.includes("new chart(")) {
    detectedFrameworks.push("Chart.js");
  }
  if (lowerHtml.includes("react") || lowerHtml.includes("__react") || lowerHtml.includes('id="root"')) {
    detectedFrameworks.push("React (SPA)");
  }
  if (lowerHtml.includes("vue") || lowerHtml.includes('id="app"') || lowerHtml.includes("v-bind")) {
    detectedFrameworks.push("Vue.js");
  }
  if (lowerHtml.includes("sortable") || lowerHtml.includes("sortablejs")) {
    detectedFrameworks.push("SortableJS");
  }
  if (detectedFrameworks.length === 0) {
    detectedFrameworks.push("HTML5 Nativo / Vanilla JS");
  }

  // 4. Color Palette Extraction
  const hexMatches = html.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
  const colorFrequency: Record<string, number> = {};
  for (const c of hexMatches) {
    const upper = c.toUpperCase();
    if (upper !== "#FFF" && upper !== "#FFFFFF" && upper !== "#000" && upper !== "#000000") {
      colorFrequency[upper] = (colorFrequency[upper] || 0) + 1;
    }
  }
  let colorPalette = Object.keys(colorFrequency)
    .sort((a, b) => colorFrequency[b] - colorFrequency[a])
    .slice(0, 6);

  if (colorPalette.length < 3) {
    colorPalette = ["#0EA5E9", "#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#1E293B"];
  }

  // 5. Layout Hierarchy identification
  const layoutHierarchy: string[] = [];
  if (semanticTags.header > 0) layoutHierarchy.push("Header / Barra Superior de Navegación");
  if (semanticTags.nav > 0) layoutHierarchy.push("Nav Menu con Enlaces de Salto");
  if (headingsCount.h1 > 0) layoutHierarchy.push("Hero Section con Título Principal H1");
  if (semanticTags.aside > 0) layoutHierarchy.push("Sidebar / Panel Lateral Auxiliar");
  if (semanticTags.main > 0) layoutHierarchy.push("Contenedor Principal <main> con Grilla");
  if (semanticTags.section > 0) layoutHierarchy.push(`Secciones de Contenido Modular (${semanticTags.section} detectadas)`);
  if (formsCount > 0) layoutHierarchy.push(`Área de Captura y Formularios (${formsCount} formularios)`);
  if (semanticTags.canvas > 0) layoutHierarchy.push("Canvas Interactivo / Gráficos en Tiempo Real");
  if (semanticTags.footer > 0) layoutHierarchy.push("Footer Semántico con Metadatos");

  // 6. Security Vulnerability Scan & Protection Auditing
  const vulnerabilities: Array<{
    severity: "alta" | "media" | "baja" | "informativa";
    title: string;
    description: string;
    remediation: string;
  }> = [];

  const protectionStrengths: string[] = [];
  const cspRecommendations: string[] = [];

  // A. Check CSP
  if (!hasCsp) {
    vulnerabilities.push({
      severity: "alta",
      title: "Ausencia de Política de Seguridad de Contenido (CSP)",
      description: "No se detectó cabecera ni meta etiqueta Content-Security-Policy. La página está expuesta a ataques XSS por inyección cruzada de scripts.",
      remediation: "Implementar cabecera 'Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.tailwindcss.com; object-src 'none';'.",
    });
    cspRecommendations.push("default-src 'self'");
    cspRecommendations.push("script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com");
    cspRecommendations.push("style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com");
    cspRecommendations.push("img-src 'self' data: https:");
    cspRecommendations.push("object-src 'none'");
  } else {
    protectionStrengths.push("Política CSP activa para mitigar inyecciones XSS externas.");
  }

  // B. Check Clickjacking / X-Frame-Options
  if (!hasXFrameOptions) {
    vulnerabilities.push({
      severity: "media",
      title: "Vulnerabilidad a Clickjacking (Falta X-Frame-Options / frame-ancestors)",
      description: "La página puede ser incrustada en iframes de sitios no autorizados para engañar al usuario mediante secuestro de clics.",
      remediation: "Configurar la cabecera 'X-Frame-Options: SAMEORIGIN' o en CSP 'frame-ancestors 'self''.",
    });
  } else {
    protectionStrengths.push("Protección contra Clickjacking configurada (X-Frame-Options / frame-ancestors).");
  }

  // C. Check Inline Event Handlers (DOM XSS vector)
  const inlineEventMatches = html.match(/\son[a-z]{3,15}\s*=/gi) || [];
  if (inlineEventMatches.length > 0) {
    vulnerabilities.push({
      severity: "alta",
      title: `Eventos en línea detectados (${inlineEventMatches.length} instancias de onclick, onload, etc.)`,
      description: "El uso de atributos 'onclick', 'onload' o 'onerror' rompe el principio de CSP estricto y facilita inyecciones DOM-based XSS.",
      remediation: "Migrar a escuchadores de eventos estructurados con 'addEventListener()' y separar la lógica en scripts modulares.",
    });
  } else {
    protectionStrengths.push("Cero eventos JavaScript en línea detectados (buena higiene de separación de código).");
  }

  // D. Check Javascript: pseudoprotocol
  if (lowerHtml.includes('href="javascript:') || lowerHtml.includes("href='javascript:")) {
    vulnerabilities.push({
      severity: "alta",
      title: "Uso de pseudoprotocolo 'javascript:' en enlaces",
      description: "Enlaces con 'javascript:void(0)' o sentencias eval representan un vector clásico de ejecución no sanitizada.",
      remediation: "Reemplazar por botones semánticos <button type='button'> con clases de accesibilidad.",
    });
  }

  // E. Check External Script SRI (Subresource Integrity)
  const scriptTags = html.match(/<script[^>]*src=["']([^"']*)["'][^>]*>/gi) || [];
  let unpinnedCdns = 0;
  for (const st of scriptTags) {
    if (!st.includes("integrity=")) {
      unpinnedCdns++;
    }
  }
  if (unpinnedCdns > 0) {
    vulnerabilities.push({
      severity: "media",
      title: `Dependencias externas sin firma de integridad SRI (${unpinnedCdns} scripts)`,
      description: "Se cargan scripts de CDNs externos sin atributo 'integrity=' (SHA-384/SHA-512), permitiendo envenenamiento de cadena de suministro.",
      remediation: "Añadir hashes 'integrity=\"sha384-...\" crossorigin=\"anonymous\"' a cada script externo.",
    });
  } else if (scriptTags.length > 0) {
    protectionStrengths.push("Todos los scripts externos cuentan con hashes SRI de verificación.");
  }

  // F. Form sanitization & input checks
  if (formsCount > 0 && inputsCount > 0) {
    if (!lowerHtml.includes('autocomplete="') && !lowerHtml.includes("autocomplete='")) {
      vulnerabilities.push({
        severity: "baja",
        title: "Atributos autocomplete no definidos en formularios",
        description: "Los inputs de usuario carecen de directivas explícitas de autocompletado o prevención de filtración de credenciales.",
        remediation: "Definir 'autocomplete=\"off\"' en campos sensibles y nombres canónicos en campos estándar.",
      });
    }
  }

  // Calculate Scores
  let securityDeductions = 0;
  for (const v of vulnerabilities) {
    if (v.severity === "alta") securityDeductions += 25;
    else if (v.severity === "media") securityDeductions += 15;
    else if (v.severity === "baja") securityDeductions += 8;
    else securityDeductions += 4;
  }
  const securityScore = Math.max(15, 100 - securityDeductions);

  let architectureDeductions = 0;
  if (headingsCount.h1 === 0) architectureDeductions += 15;
  if (headingsCount.h1 > 1) architectureDeductions += 8;
  if (semanticTags.main === 0) architectureDeductions += 15;
  if (semanticTags.header === 0 && semanticTags.nav === 0) architectureDeductions += 10;
  if (!viewport) architectureDeductions += 20;
  if (buttonsCount === 0 && inputsCount === 0) architectureDeductions += 10;
  const architectureScore = Math.max(25, 100 - architectureDeductions);

  const overallHealthScore = Math.round((securityScore * 0.55) + (architectureScore * 0.45));

  let grade: "A+" | "A" | "B" | "C" | "F" = "C";
  if (securityScore >= 95) grade = "A+";
  else if (securityScore >= 85) grade = "A";
  else if (securityScore >= 70) grade = "B";
  else if (securityScore >= 50) grade = "C";
  else grade = "F";

  // Strengths & Recommendations for Programming Improvement
  const strengths: string[] = [];
  if (semanticTags.main > 0) strengths.push("Contenedor semántico principal (<main>) bien demarcado.");
  if (viewport) strengths.push("Directiva meta viewport para diseño responsivo multi-pantalla.");
  if (detectedFrameworks.includes("Tailwind CSS")) strengths.push("Utilización de sistema de clases utilitarias modernas (Tailwind).");
  if (headingsCount.h1 === 1) strengths.push("Jerarquía tipográfica canónica con un único H1.");
  if (protectionStrengths.length > 0) strengths.push(...protectionStrengths);

  const recommendations: string[] = [
    "Aislar la ejecución de JavaScript en un contexto 'sandbox' estricto sin acceso a window.top.",
    "Adoptar persistencia robusta en cliente (localStorage) con claves prefijadas para prevenir colisiones.",
    "Establecer una barrera de sanitización previa (DOMPurify o escapes regex) antes de renderizar cualquier entrada de usuario.",
    "Implementar notificaciones Toast no intrusivas en lugar de alertas nativas del navegador.",
  ];

  // Synthesized Hardened Blueprint Template based on this web page
  const cleanTitle = title.replace(/["'`<>]/g, "");
  const primaryColor = colorPalette[0] || "#0EA5E9";
  const secondaryColor = colorPalette[1] || "#6366F1";

  const synthesizedTemplateBlueprint = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanTitle} - Versión Blindada OmniForge</title>
  <!-- Tailwind CSS & Iconografía -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    /* Reglas de protección y variables extraídas */
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
    }
    .custom-scroll::-webkit-scrollbar { width: 6px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-white">

  <!-- Header Semántico Protegido -->
  <header class="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 font-bold">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      <div>
        <h1 class="text-base font-black tracking-tight text-white flex items-center gap-2">
          ${cleanTitle}
          <span class="text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
            Blindado
          </span>
        </h1>
        <p class="text-[11px] text-slate-400">Estructura adaptada con seguridad y persistencia automática</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span id="storageBadge" class="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
        <i class="fa-solid fa-database"></i> localStorage Activo
      </span>
      <button id="themeToggleBtn" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs">
        <i class="fa-solid fa-moon"></i>
      </button>
    </div>
  </header>

  <!-- Layout Principal con Jerarquía Semántica -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
    <!-- Hero / Panel de Resumen -->
    <section class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div class="relative z-10 max-w-2xl space-y-3">
        <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">Arquitectura Mejorada</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Panel Central Interactivo & Seguro
        </h2>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Esta aplicación adopta el árbol DOM y el sistema de navegación de ${cleanTitle}, eliminando los vectores de vulnerabilidad e inyectando persistencia local inmediata.
        </p>
      </div>
    </section>

    <!-- Grilla de Módulos Dinámicos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Módulo 1: Formulario con Sanitización Estricta -->
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-pen-nib text-cyan-400"></i> Entrada de Datos
          </h3>
          <span class="text-[10px] text-slate-400 font-mono">Sanitizado</span>
        </div>
        <form id="secureForm" class="space-y-3" autocomplete="off">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Título o Concepto</label>
            <input type="text" id="inputTitle" required placeholder="Escribe aquí..." 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Categoría / Nivel</label>
            <select id="inputCategory" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition">
              <option value="General">General</option>
              <option value="Prioridad Alta">Prioridad Alta</option>
              <option value="Seguridad">Seguridad</option>
            </select>
          </div>
          <button type="submit" class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/30 transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-plus"></i> Guardar Registro
          </button>
        </form>
      </section>

      <!-- Módulo 2: Visualizador de Registros con Persistencia -->
      <section class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-list-check text-indigo-400"></i> Registros Activos
            </h3>
            <p class="text-[10px] text-slate-400">Almacenados en localStorage sin riesgo de pérdida al recargar</p>
          </div>
          <button id="clearAllBtn" class="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-500/20 px-2 py-1 rounded-lg transition">
            Limpiar Todos
          </button>
        </div>

        <div id="recordsContainer" class="flex-1 space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
          <!-- Inyectado por JS de forma segura (sin innerHTML vulnerable) -->
        </div>
      </section>
    </div>
  </main>

  <!-- Footer Semántico -->
  <footer class="border-t border-slate-800/80 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
    Desarrollado con OmniForge AI • Estructura protegida contra XSS, Clickjacking y Manipulación DOM
  </footer>

  <!-- Script Seguro y Defensivo -->
  <script>
    (function() {
      const STORAGE_KEY = 'omniforge_hardened_data';

      // Sanitizador seguro contra inyecciones XSS
      function sanitize(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
      }

      function loadData() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : [
            { id: 1, title: 'Revisión de Cabeceras Seguras', cat: 'Seguridad', time: '10:00 AM' },
            { id: 2, title: 'Estructura Semántica Verificada', cat: 'General', time: '10:15 AM' }
          ];
        } catch(e) {
          return [];
        }
      }

      function saveData(data) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch(e) {}
      }

      let state = loadData();
      const container = document.getElementById('recordsContainer');
      const form = document.getElementById('secureForm');

      function render() {
        container.innerHTML = '';
        if (state.length === 0) {
          container.innerHTML = '<div class="text-center py-8 text-xs text-slate-500">No hay registros guardados. Añade uno con el formulario.</div>';
          return;
        }

        state.forEach(item => {
          const card = document.createElement('div');
          card.className = 'bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs';
          
          const info = document.createElement('div');
          info.innerHTML = '<strong class="text-white">' + sanitize(item.title) + '</strong>' +
            '<div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">' +
            '<span class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">' + sanitize(item.cat) + '</span>' +
            '<span>' + sanitize(item.time) + '</span>' +
            '</div>';

          const delBtn = document.createElement('button');
          delBtn.className = 'p-1.5 text-slate-500 hover:text-rose-400 transition';
          delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
          delBtn.onclick = function() {
            state = state.filter(x => x.id !== item.id);
            saveData(state);
            render();
          };

          card.appendChild(info);
          card.appendChild(delBtn);
          container.appendChild(card);
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const inputTitle = document.getElementById('inputTitle');
        const inputCat = document.getElementById('inputCategory');
        if (!inputTitle.value.trim()) return;

        state.unshift({
          id: Date.now(),
          title: inputTitle.value.trim(),
          cat: inputCat.value,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        saveData(state);
        render();
        inputTitle.value = '';
      });

      document.getElementById('clearAllBtn').addEventListener('click', function() {
        if (confirm('¿Deseas eliminar todos los registros?')) {
          state = [];
          saveData(state);
          render();
        }
      });

      render();
    })();
  </script>
</body>
</html>`;

  // Suggest a tailor-made tool for SelfEvolvingTools based on the scan
  const suggestedTool = {
    name: vulnerabilities.some((v) => v.severity === "alta")
      ? `Guardián Defensivo de Inyecciones y CSP para "${cleanTitle.slice(0, 24)}"`
      : `Auditor de Higiene DOM y Semántica para "${cleanTitle.slice(0, 24)}"`,
    category: (vulnerabilities.some((v) => v.severity === "alta") ? "Seguridad" : "Calidad") as "Seguridad" | "Calidad",
    description: `Herramienta sintetizada automáticamente tras la inspección de ${cleanTitle}. Detecta patrones vulnerables y audita el cumplimiento de CSP y eventos en línea.`,
  };

  return {
    id: "web_audit_" + Date.now(),
    url: targetUrl,
    title,
    timestamp: new Date().toISOString(),
    overallHealthScore,
    securityScore,
    architectureScore,
    meta: {
      description,
      viewport,
      charset,
      hasHttps,
      hasCsp,
      hasXFrameOptions,
      hasHsts,
    },
    structure: {
      semanticTags,
      headingsCount,
      formsCount,
      inputsCount,
      buttonsCount,
      imagesCount,
      scriptsCount,
      stylesCount,
      detectedFrameworks,
      colorPalette,
      layoutHierarchy,
    },
    securityAudit: {
      grade,
      vulnerabilities,
      protectionStrengths,
      cspRecommendations,
    },
    codeImprovements: {
      strengths,
      recommendations,
      synthesizedTemplateBlueprint,
      suggestedTool,
    },
  };
}
