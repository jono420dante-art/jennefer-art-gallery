import PDFDocument from "pdfkit";

type AnalyticsSummary = {
  uniqueSessions: number;
  pageViews: number;
  conversionClicks: number;
  activeVisitors: number;
  trafficSources: Array<{ source: string; sessions: number }>;
  referrers: Array<{ referrerDomain: string | null; sessions: number }>;
  topPages: Array<{ pagePath: string; views: number }>;
  topClicks: Array<{ eventType: string; target: string | null; clicks: number }>;
  generatedAt: string;
};

function safeText(value: string | null | undefined) {
  return value?.replace(/[\r\n]+/g, " ") || "—";
}

export function createAnalyticsPdf(summary: AnalyticsSummary, days: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];

    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.fillColor("#21170f").fontSize(22).text("Jennefer Ann Art Gallery", { align: "left" });
    document.fillColor("#8e5e23").fontSize(14).text("Growth & Traffic Report");
    document.moveDown(0.4);
    document.fillColor("#555555").fontSize(9).text(
      `Reporting period: last ${days} days  |  Generated: ${new Date(summary.generatedAt).toLocaleString("en-ZA")}`
    );
    document.moveDown(1.2);

    const metrics = [
      ["Unique sessions", summary.uniqueSessions],
      ["Page views", summary.pageViews],
      ["Conversion clicks", summary.conversionClicks],
      ["Active visitors (30 min)", summary.activeVisitors],
    ];

    document.fillColor("#21170f").fontSize(14).text("Overview");
    document.moveDown(0.4);
    metrics.forEach(([label, value]) => {
      document.fillColor("#333333").fontSize(10).text(`${label}: `, { continued: true });
      document.fillColor("#8e5e23").font("Helvetica-Bold").text(String(value));
      document.font("Helvetica");
    });

    const writeSection = (
      title: string,
      rows: Array<string>,
      emptyText: string,
    ) => {
      document.moveDown(1.1);
      document.fillColor("#21170f").fontSize(14).text(title);
      document.moveDown(0.35);
      if (rows.length === 0) {
        document.fillColor("#666666").fontSize(10).text(emptyText);
        return;
      }
      rows.forEach((row) => {
        document.fillColor("#333333").fontSize(10).text(`• ${row}`);
      });
    };

    writeSection(
      "Traffic Sources",
      summary.trafficSources.map((item) => `${safeText(item.source)} — ${item.sessions} sessions`),
      "No first-party source data has been recorded for this period yet.",
    );
    writeSection(
      "Top Referrers",
      summary.referrers.map((item) => `${safeText(item.referrerDomain)} — ${item.sessions} sessions`),
      "No external referrers have been recorded for this period yet.",
    );
    writeSection(
      "Top Pages",
      summary.topPages.map((item) => `${safeText(item.pagePath)} — ${item.views} views`),
      "No page-view data has been recorded for this period yet.",
    );
    writeSection(
      "Conversion Clicks",
      summary.topClicks.map((item) => `${safeText(item.eventType).replace("click_", "")} · ${safeText(item.target)} — ${item.clicks}`),
      "No tracked conversion clicks have been recorded for this period yet.",
    );

    document.moveDown(1.2);
    document.fillColor("#666666").fontSize(8).text(
      "This report contains first-party gallery analytics. It records anonymous sessions, traffic sources, page views, and explicit conversion interactions without storing raw IP addresses or visitor email addresses."
    );
    document.end();
  });
}
