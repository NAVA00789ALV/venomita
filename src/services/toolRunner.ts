import { DynamicTool, AnalysisReport } from "../types";

export const DEFAULT_TOOLS: DynamicTool[] = [
  {
    id: "tool-security-audit",
    name: "Auditor de Seguridad y Sanitización",
    category: "Seguridad",
    description: "Detecta vulnerabilidades potenciales, uso de eval(), llamadas no seguras e inyección en innerHTML.",
    icon: "ShieldAlert",
    isDefault: true,
    isSynthesized: false,
    enabled: true,
    code: `async function analyze(html) {
      const issues = [];
      const recommendations = [];
      let score = 100;

      // Check eval usage
      if (/\\beval\\s*\\(/i.test(html)) {
        issues.push("Uso de eval() detectado. Esto representa un vector de ejecución arbitraria de código.");
        score -= 30;
      }

      // Check unescaped innerHTML assignments with user input
      if (/innerHTML\\s*=\\s*.*(input|value|prompt|location)/i.test(html)) {
        issues.push("Asignación de innerHTML con datos de entrada sin sanitizar (riesgo de XSS).");
        score -= 25;
      }

      // Check for inline event handler overflows
      const inlineEvents = (html.match(/\\bon[a-z]+\\s*=/gi) || []).length;
      if (inlineEvents > 12) {
        recommendations.push("Considera migrar los event handlers en línea ('onclick', etc.) a addEventListener.");
        score -= 5;
      }

      // Check CSP or HTTPS assets
      if (/http:\\/\\//i.test(html)) {
        issues.push("Recursos cargados a través de HTTP no seguro en lugar de HTTPS.");
        score -= 15;
      }

      if (issues.length === 0) {
        recommendations.push("No se detectaron vectores críticos de inyección ni funciones inseguras.");
      }

      return {
        score: Math.max(10, score),
        issues,
        recommendations,
        passed: score >= 70
      };
    }`,
  },
  {
    id: "tool-accessibility-wcag",
    name: "Analizador de Accesibilidad WCAG",
    category: "Accesibilidad",
    description: "Verifica etiquetas semánticas, contraste, atributos alt en imágenes y soporte para lectores de pantalla.",
    icon: "Eye",
    isDefault: true,
    isSynthesized: false,
    enabled: true,
    code: `async function analyze(html) {
      const issues = [];
      const recommendations = [];
      let score = 100;

      // Check lang attribute
      if (!/<html[^>]*lang=["'][a-zA-Z-]+["']/i.test(html)) {
        issues.push("Falta el atributo 'lang' en la etiqueta <html> para internacionalización y lectores de pantalla.");
        score -= 15;
      }

      // Check viewport
      if (!/<meta[^>]*name=["']viewport["']/i.test(html)) {
        issues.push("Falta la etiqueta meta 'viewport', afectando el zoom y accesibilidad en dispositivos móviles.");
        score -= 20;
      }

      // Check image alt tags
      const imagesWithoutAlt = (html.match(/<img(?![^>]*\\balt=)[^>]*>/gi) || []).length;
      if (imagesWithoutAlt > 0) {
        issues.push(\`Se detectaron \${imagesWithoutAlt} imagen(es) sin atributo alt descriptivo.\`);
        score -= (imagesWithoutAlt * 10);
      }

      // Check button text or aria-label
      if (/<button[^>]*>\\s*<i[^>]*><\\/i>\\s*<\\/button>/i.test(html)) {
        recommendations.push("Algunos botones solo contienen íconos sin texto legible ni 'aria-label'.");
        score -= 10;
      }

      // Check headings hierarchy
      if (!/<h1[^>]*>/i.test(html)) {
        recommendations.push("No se detectó un encabezado <h1> principal en el documento.");
        score -= 10;
      }

      if (issues.length === 0) {
        recommendations.push("Estructura semántica sólida compatible con estándares de accesibilidad.");
      }

      return {
        score: Math.max(15, score),
        issues,
        recommendations,
        passed: score >= 70
      };
    }`,
  },
  {
    id: "tool-performance-profiler",
    name: "Perfilador de Rendimiento y Tamaño DOM",
    category: "Rendimiento",
    description: "Evalúa complejidad estructural del DOM, bibliotecas pesadas y eficiencia del bucle de ejecución.",
    icon: "Gauge",
    isDefault: true,
    isSynthesized: false,
    enabled: true,
    code: `async function analyze(html) {
      const issues = [];
      const recommendations = [];
      let score = 100;

      const sizeKb = Math.round(new Blob([html]).size / 1024);
      if (sizeKb > 350) {
        issues.push(\`Tamaño del código (\${sizeKb} KB) elevado. Puede retrasar la carga inicial.\`);
        score -= 20;
      } else {
        recommendations.push(\`Tamaño de código excelente y ligero (\${sizeKb} KB).\`);
      }

      // External scripts count
      const scriptTags = (html.match(/<script\\b[^>]*src=/gi) || []).length;
      if (scriptTags > 5) {
        issues.push(\`Carga de múltiples scripts externos (\${scriptTags}), lo que podría bloquear el renderizado.\`);
        score -= 15;
      }

      // Infinite loop risks or heavy intervals
      if (/setInterval\\s*\\([^,]+,\\s*(?:0|[1-9]|1[0-5])\\)/.test(html)) {
        issues.push("Intervalo con frecuencia excesivamente rápida (<16ms). Provoca consumo elevado de CPU.");
        score -= 25;
      }

      if (!html.includes('requestAnimationFrame') && html.includes('<canvas')) {
        recommendations.push("Para juegos en Canvas, es recomendable usar 'requestAnimationFrame' en lugar de setInterval.");
        score -= 10;
      }

      return {
        score: Math.max(20, score),
        issues,
        recommendations,
        passed: score >= 75
      };
    }`,
  },
  {
    id: "tool-responsive-inspector",
    name: "Comprobador de Responsividad Multi-Pantalla",
    category: "UX",
    description: "Inspecciona adaptabilidad a pantallas táctiles, overflow horizontal y contenedores responsivos.",
    icon: "Smartphone",
    isDefault: true,
    isSynthesized: false,
    enabled: true,
    code: `async function analyze(html) {
      const issues = [];
      const recommendations = [];
      let score = 100;

      // Check Tailwind responsive utility usage
      const hasResponsiveBreakpoints = /(sm:|md:|lg:|xl:)/.test(html);
      if (!hasResponsiveBreakpoints && !html.includes('@media')) {
        issues.push("No se observan breakpoints responsivos explícitos (sm:, md:, lg: o @media queries).");
        score -= 25;
      }

      // Check fixed pixel widths that could break mobile
      if (/width:\\s*(?:[5-9]\\d{2}|\\d{4,})px/i.test(html) || /w-\\[(?:[5-9]\\d{2}|\\d{4,})px\\]/i.test(html)) {
        issues.push("Ancho fijo en píxeles detectado mayor a 500px. Puede causar scroll horizontal en teléfonos.");
        score -= 20;
      }

      // Check touch friendly button sizes
      if (/class=["'][^"']*p-0[^"']*["']\\s*>|<button[^>]*class=["'][^"']*text-\\[8px\\]/i.test(html)) {
        recommendations.push("Asegúrate de que los botones interactivos tengan un área táctil mínima de 44x44px.");
        score -= 10;
      }

      if (html.includes('flex-wrap') || html.includes('grid-cols-1')) {
        recommendations.push("Excelente uso de contenedores flexibles con envoltura automática.");
      }

      return {
        score: Math.max(20, score),
        issues,
        recommendations,
        passed: score >= 70
      };
    }`,
  },
  {
    id: "tool-syntax-doctor",
    name: "Doctor de Sintaxis e Integridad de Código",
    category: "Código",
    description: "Valida cierre de etiquetas HTML, balance de llaves JS y consistencia de atributos.",
    icon: "Stethoscope",
    isDefault: true,
    isSynthesized: false,
    enabled: true,
    code: `async function analyze(html) {
      const issues = [];
      const recommendations = [];
      let score = 100;

      // Tag closure checks for key elements
      const openScripts = (html.match(/<script\\b/gi) || []).length;
      const closeScripts = (html.match(/<\\/script>/gi) || []).length;
      if (openScripts !== closeScripts) {
        issues.push(\`Desbalance en etiquetas <script>: \${openScripts} abiertas vs \${closeScripts} cerradas.\`);
        score -= 40;
      }

      const openDivs = (html.match(/<div\\b/gi) || []).length;
      const closeDivs = (html.match(/<\\/div>/gi) || []).length;
      if (Math.abs(openDivs - closeDivs) > 2) {
        issues.push(\`Posible etiqueta <div> sin cerrar (\${openDivs} abiertas vs \${closeDivs} cerradas).\`);
        score -= 15;
      }

      // Check for unclosed DOCTYPE
      if (!/<!DOCTYPE\\s+html>/i.test(html)) {
        recommendations.push("Se recomienda especificar <!DOCTYPE html> al inicio para evitar quirks mode.");
        score -= 10;
      }

      if (issues.length === 0) {
        recommendations.push("Estructura sintáctica consistente y bien balanceada.");
      }

      return {
        score: Math.max(10, score),
        issues,
        recommendations,
        passed: score >= 70
      };
    }`,
  },
];

/**
 * Safely executes a dynamic tool against an HTML application string
 */
export async function executeTool(tool: DynamicTool, htmlCode: string): Promise<{
  score: number;
  issues: string[];
  recommendations: string[];
  passed: boolean;
}> {
  try {
    // Dynamic sandbox evaluation
    const wrappedCode = `
      ${tool.code}
      if (typeof analyze === 'function') {
        return analyze(code);
      } else {
        throw new Error('La herramienta no define la función analyze(code)');
      }
    `;

    // Create function runner
    const runFn = new Function("code", wrappedCode);
    const result = await Promise.resolve(runFn(htmlCode));

    return {
      score: typeof result?.score === "number" ? Math.min(100, Math.max(0, result.score)) : 80,
      issues: Array.isArray(result?.issues) ? result.issues : [],
      recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
      passed: Boolean(result?.passed ?? true),
    };
  } catch (err: any) {
    console.error(`Error executing tool ${tool.name}:`, err);
    return {
      score: 50,
      issues: [`Error en la ejecución del analizador: ${err.message}`],
      recommendations: ["Revisar la sintaxis de la función de análisis."],
      passed: false,
    };
  }
}

/**
 * Runs all enabled tools against an application and produces a unified report
 */
export async function runFullAudit(tools: DynamicTool[], htmlCode: string): Promise<AnalysisReport> {
  const activeTools = tools.filter((t) => t.enabled);
  if (activeTools.length === 0) {
    return {
      overallScore: 100,
      timestamp: new Date().toISOString(),
      toolResults: [],
      summary: "No hay herramientas activas seleccionadas.",
    };
  }

  const results = await Promise.all(
    activeTools.map(async (tool) => {
      const res = await executeTool(tool, htmlCode);
      return {
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        score: res.score,
        issues: res.issues,
        recommendations: res.recommendations,
        passed: res.passed,
      };
    })
  );

  const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
  const overallScore = Math.round(totalScore / results.length);

  const totalIssues = results.reduce((acc, curr) => acc + curr.issues.length, 0);

  let summary = "";
  if (overallScore >= 90) {
    summary = `Excelente calidad de aplicación (${overallScore}/100). Cumple los estándares de seguridad, rendimiento y UX.`;
  } else if (overallScore >= 70) {
    summary = `Buen estado general (${overallScore}/100). Se detectaron ${totalIssues} observaciones menores para optimizar.`;
  } else {
    summary = `Requiere atención (${overallScore}/100). Se detectaron ${totalIssues} observaciones importantes que deben corregirse.`;
  }

  return {
    overallScore,
    timestamp: new Date().toISOString(),
    toolResults: results,
    summary,
  };
}
