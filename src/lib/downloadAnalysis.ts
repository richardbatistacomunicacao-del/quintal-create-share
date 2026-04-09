import type { ProfileAnalysis } from "@/types/content";

export function downloadAnalysisAsText(analysis: ProfileAnalysis, url: string) {
  const lines: string[] = [];
  lines.push(`ANÁLISE DE MARCA — ${analysis.name}`);
  lines.push(`URL: ${url}`);
  lines.push(`Data: ${new Date().toLocaleDateString("pt-BR")}`);
  lines.push("═".repeat(50));

  lines.push(`\n📋 DESCRIÇÃO\n${analysis.description}`);
  lines.push(`\n🏢 SETOR: ${analysis.sector}`);
  lines.push(`🎯 TOM DE VOZ: ${analysis.tone}`);

  if (analysis.colors?.length) {
    lines.push(`\n🎨 CORES: ${analysis.colors.join(", ")}`);
  }
  if (analysis.fonts?.length) {
    lines.push(`🔤 FONTES: ${analysis.fonts.join(", ")}`);
  }
  if (analysis.themes?.length) {
    lines.push(`\n📌 TEMAS\n${analysis.themes.map((t) => `  • ${t}`).join("\n")}`);
  }
  if (analysis.topics?.length) {
    lines.push(`\n💡 ASSUNTOS\n${analysis.topics.map((t) => `  • ${t}`).join("\n")}`);
  }

  if (analysis.swot) {
    lines.push("\n" + "═".repeat(50));
    lines.push("📊 ANÁLISE SWOT");
    lines.push(`\n💪 FORÇAS\n${analysis.swot.strengths.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n⚠️ FRAQUEZAS\n${analysis.swot.weaknesses.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n🚀 OPORTUNIDADES\n${analysis.swot.opportunities.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n🔥 AMEAÇAS\n${analysis.swot.threats.map((s) => `  • ${s}`).join("\n")}`);
  }

  if (analysis.empathyMap) {
    lines.push("\n" + "═".repeat(50));
    lines.push("🧠 MAPA DE EMPATIA");
    lines.push(`\n💭 PENSA\n${analysis.empathyMap.thinks.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n❤️ SENTE\n${analysis.empathyMap.feels.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n💬 DIZ\n${analysis.empathyMap.says.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n🏃 FAZ\n${analysis.empathyMap.does.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n😣 DORES\n${analysis.empathyMap.pains.map((s) => `  • ${s}`).join("\n")}`);
    lines.push(`\n🎯 GANHOS\n${analysis.empathyMap.gains.map((s) => `  • ${s}`).join("\n")}`);
  }

  if (analysis.storytelling) {
    lines.push("\n" + "═".repeat(50));
    lines.push("📖 FRAMEWORK DE STORYTELLING");
    lines.push(`\n🦸 HERÓI (CLIENTE): ${analysis.storytelling.hero}`);
    lines.push(`😰 PROBLEMA: ${analysis.storytelling.problem}`);
    lines.push(`🧭 GUIA (MARCA): ${analysis.storytelling.guide}`);
    lines.push(`📋 PLANO: ${analysis.storytelling.plan}`);
    lines.push(`📢 CTA: ${analysis.storytelling.callToAction}`);
    lines.push(`🏆 SUCESSO: ${analysis.storytelling.success}`);
    lines.push(`💀 FRACASSO EVITADO: ${analysis.storytelling.failure}`);
  }

  if (analysis.postSuggestions?.length) {
    lines.push("\n" + "═".repeat(50));
    lines.push("📝 SUGESTÕES DE POSTS");
    analysis.postSuggestions.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
  }

  if (analysis.contentStrategy) {
    lines.push(`\n📈 ESTRATÉGIA\n${analysis.contentStrategy}`);
  }
  if (analysis.audienceInsights) {
    lines.push(`\n👥 PÚBLICO-ALVO\n${analysis.audienceInsights}`);
  }

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url2 = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url2;
  a.download = `analise-${analysis.name?.replace(/\s+/g, "-").toLowerCase() || "marca"}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url2);
}
