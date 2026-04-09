// Simple PDF-like download as formatted text file
// Uses browser print for actual PDF when needed

export function downloadAsTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBlogAsPdf(title: string, content: string, meta?: string, tags?: string[]) {
  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push(title.toUpperCase());
  lines.push("═".repeat(60));
  if (meta) lines.push(`\nMeta SEO: ${meta}`);
  lines.push(`\nData: ${new Date().toLocaleDateString("pt-BR")}`);
  lines.push("\n" + "─".repeat(60) + "\n");
  lines.push(content);
  if (tags?.length) lines.push("\n\nTags: " + tags.map(t => `#${t}`).join(" "));
  downloadAsTextFile(`blog-${Date.now()}.txt`, lines.join("\n"));
}

export function downloadTextAsPdf(title: string, type: string, content: string, variations?: string[], tips?: string[]) {
  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push(`${title} — ${type}`);
  lines.push("═".repeat(60));
  lines.push(`Data: ${new Date().toLocaleDateString("pt-BR")}\n`);
  lines.push(content);
  if (variations?.length) {
    lines.push("\n\n─── Variações de Headline ───");
    variations.forEach(v => lines.push(`• ${v}`));
  }
  if (tips?.length) {
    lines.push("\n─── Dicas de Uso ───");
    tips.forEach(t => lines.push(`💡 ${t}`));
  }
  downloadAsTextFile(`texto-${Date.now()}.txt`, lines.join("\n"));
}

export function downloadDossieAsPdf(data: any) {
  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push(`DOSSIÊ ESTRATÉGICO — ${data.companyName}`);
  lines.push("═".repeat(60));
  if (data.sector) lines.push(`Setor: ${data.sector}`);
  lines.push(`Data: ${new Date().toLocaleDateString("pt-BR")}\n`);
  lines.push(data.executiveSummary);

  if (data.marketData) {
    lines.push("\n\n─── DADOS DE MERCADO ───");
    lines.push(`Tamanho: ${data.marketData.marketSize}`);
    lines.push(`Crescimento: ${data.marketData.growth}`);
    if (data.marketData.trends?.length) lines.push(`Tendências: ${data.marketData.trends.join(", ")}`);
    if (data.marketData.competitors?.length) {
      lines.push("\nConcorrentes:");
      data.marketData.competitors.forEach((c: any) => lines.push(`  • ${c.name} — ✅ ${c.strength} | ⚠️ ${c.weakness}`));
    }
  }

  if (data.swot) {
    lines.push("\n\n─── ANÁLISE SWOT ───");
    lines.push(`\nForças:\n${data.swot.strengths.map((s: string) => `  • ${s}`).join("\n")}`);
    lines.push(`\nFraquezas:\n${data.swot.weaknesses.map((s: string) => `  • ${s}`).join("\n")}`);
    lines.push(`\nOportunidades:\n${data.swot.opportunities.map((s: string) => `  • ${s}`).join("\n")}`);
    lines.push(`\nAmeaças:\n${data.swot.threats.map((s: string) => `  • ${s}`).join("\n")}`);
  }

  if (data.actionPlan?.length) {
    lines.push("\n\n─── PLANO DE AÇÃO ───");
    data.actionPlan.forEach((p: any) => {
      lines.push(`\n${p.phase} (${p.duration})`);
      p.actions.forEach((a: string) => lines.push(`  → ${a}`));
    });
  }

  if (data.investment) {
    lines.push("\n\n─── INVESTIMENTO ───");
    lines.push(`Recomendado: ${data.investment.recommended}`);
    lines.push(`ROI: ${data.investment.roi}`);
    lines.push(data.investment.justification);
  }

  if (data.conclusion) lines.push(`\n\n─── CONCLUSÃO ───\n${data.conclusion}`);

  downloadAsTextFile(`dossie-${data.companyName?.replace(/\s+/g, "-").toLowerCase() || "empresa"}-${Date.now()}.txt`, lines.join("\n"));
}

export function downloadPresentationAsText(data: any) {
  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push(`APRESENTAÇÃO — ${data.title}`);
  lines.push("═".repeat(60));
  lines.push(`${data.slides?.length || 0} slides | ${data.estimatedDuration || ""}\n`);

  data.slides?.forEach((slide: any, i: number) => {
    lines.push(`\n─── SLIDE ${i + 1}: ${slide.title} ───`);
    if (slide.subtitle) lines.push(slide.subtitle);
    slide.content?.forEach((point: string) => lines.push(`  • ${point}`));
    if (slide.notes) lines.push(`  🎤 Notas: ${slide.notes}`);
  });

  downloadAsTextFile(`apresentacao-${Date.now()}.txt`, lines.join("\n"));
}

export function downloadPostsAsText(posts: any[]) {
  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push("POSTS GERADOS — QuintalPosts");
  lines.push("═".repeat(60));
  lines.push(`Data: ${new Date().toLocaleDateString("pt-BR")}\n`);

  posts.forEach((p, i) => {
    lines.push(`\n─── POST ${i + 1} ───`);
    lines.push(`Título: ${p.title}`);
    lines.push(`Hook: ${p.hook}`);
    lines.push(`CTA: ${p.cta}`);
    lines.push(`\nLegenda:\n${p.caption}`);
    lines.push(`\nHashtags: ${p.hashtags}`);
  });

  downloadAsTextFile(`posts-${Date.now()}.txt`, lines.join("\n"));
}
