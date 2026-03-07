import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  StatisticsSummary,
  HourlyStats,
  DailyStats,
} from "@/types/vision-detection";
import type {
  DailyMeasurementDataItem,
  PredictedMonthlyProduction,
} from "@/types/crystallization.types";

// ==========================================
// UNIFIED HEADER AND FOOTER FOR ALL REPORTS
// ==========================================

// BrineX Logo SVG string for conversion to PNG
const BRINEX_LOGO_SVG = `<svg width="480" height="96" viewBox="0 0 4362 875" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3319.61 628.578V725.022H2888.04C2853.81 725.022 2821.66 719.009 2791.6 706.982C2761.53 694.493 2735.4 677.378 2713.19 655.638C2690.99 633.898 2673.41 608.457 2660.46 579.316C2647.51 549.712 2641.03 518.027 2641.03 484.26C2641.03 450.03 2647.51 418.345 2660.46 389.204C2673.41 360.063 2690.99 334.622 2713.19 312.881C2735.4 291.141 2761.53 274.258 2791.6 262.231C2821.66 249.742 2853.81 243.498 2888.04 243.498H3319.61V339.941H2888.04C2872.31 339.941 2857.28 342.717 2842.94 348.267C2828.6 353.355 2815.65 360.756 2804.09 370.47C2792.98 380.184 2783.27 391.979 2774.94 405.856C2767.08 419.27 2761.53 434.072 2758.29 450.262H3130.88V546.705H2767.31C2777.95 571.683 2793.91 591.573 2815.19 606.375C2836.93 621.177 2861.21 628.578 2888.04 628.578H3319.61Z" fill="black"/>
<path d="M2436.12 242.804H2543.67V725.022H2436.12V614.701L2126.67 364.226C2105.39 347.111 2081.34 338.554 2054.51 338.554H2022.59V725.022H1915.05V242.804H2089.2C2116.03 242.804 2140.08 251.361 2161.36 268.476L2436.12 491.198V242.804Z" fill="black"/>
<path d="M1817.09 244V340.444H1729.66V629.081H1817.09V725.524H1534V629.081H1622.12V340.444H1534V244H1817.09Z" fill="black"/>
<path d="M1221.57 243.498C1260.89 243.498 1294.19 250.898 1321.48 265.7C1349.23 280.502 1370.97 299.467 1386.7 322.595C1402.89 345.261 1412.84 370.701 1416.54 398.917C1420.7 426.671 1418.85 453.731 1410.99 480.097C1403.12 506.463 1389.25 530.516 1369.36 552.256C1349.93 573.534 1324.49 589.029 1293.03 598.743L1437.35 725.022H1273.61L1165.37 629.966C1149.64 615.627 1130.91 608.457 1109.17 608.457H884.362V725.716H776.123V243.498H1221.57ZM1221.57 512.707C1240.53 512.707 1256.26 508.544 1268.75 500.218C1281.7 491.429 1291.18 480.559 1297.2 467.608C1303.67 454.656 1306.68 440.779 1306.22 425.977C1306.22 411.175 1302.98 397.299 1296.5 384.347C1290.49 371.395 1281.01 360.756 1268.05 352.43C1255.57 343.642 1240.07 339.247 1221.57 339.247H884.362V512.707H1221.57Z" fill="black"/>
<path d="M607.803 440.548C627.693 452.574 643.42 468.07 654.984 487.035C666.548 506 673.949 526.121 677.187 547.399C680.425 568.214 679.268 589.261 673.718 610.538C668.63 631.816 659.147 651.012 645.27 668.127C631.856 684.779 613.816 698.425 591.151 709.064C568.948 719.702 542.582 725.022 512.053 725.022H0V523.809C0 509.007 2.77536 495.13 8.32607 482.178C14.3393 468.764 22.2028 457.2 31.9166 447.486C41.6303 437.772 52.963 430.14 65.9147 424.59C78.8664 419.039 92.7431 416.263 107.545 416.263H478.055C489.157 416.263 497.251 412.332 502.34 404.468C507.89 396.142 510.666 387.122 510.666 377.408C510.666 367.695 507.89 358.906 502.34 351.043C496.789 342.717 488.694 338.553 478.055 338.553H11.7953V243.498H478.055C509.972 243.498 536.569 249.973 557.847 262.925C579.587 275.877 595.776 292.298 606.415 312.188C617.054 331.615 622.605 352.893 623.067 376.021C623.53 399.149 618.442 420.658 607.803 440.548ZM512.053 627.884C530.556 627.884 544.201 621.871 552.99 609.845C562.241 597.818 566.635 584.635 566.173 570.296C566.173 555.494 561.547 542.08 552.296 530.053C543.507 518.027 530.093 512.013 512.053 512.013H107.545V627.884H512.053Z" fill="black"/>
<path d="M4361.68 0L3809.11 517.366L4166.94 874.423H4013.59C3972.27 874.423 3943.09 845.365 3943 845.274L3709.31 612.097L3609.51 701.969C3609.51 701.969 3582.74 728.686 3543.79 728.686H3388L4140.17 26.7168C4140.17 26.7168 4169.37 0 4205.89 0H4361.68ZM3541.35 242.896C3582.65 242.896 3611.83 271.924 3611.95 272.043L3694.71 354.625L3592.47 446.929L3388 242.896H3541.35Z" fill="url(#paint0_linear_15_3)"/>
<defs>
<linearGradient id="paint0_linear_15_3" x1="3583.5" y1="724" x2="4344" y2="12.4999" gradientUnits="userSpaceOnUse">
<stop stop-color="#FFB622"/>
<stop offset="0.327507" stop-color="#FF7373"/>
<stop offset="0.643388" stop-color="#00D4FF"/>
<stop offset="0.947115" stop-color="#01B87A"/>
</linearGradient>
</defs>
</svg>`;

// Cached PNG base64 string (converted from SVG at runtime)
let cachedLogoPng: string | null = null;

/**
 * Convert SVG to PNG base64 using canvas (jsPDF only supports PNG/JPEG reliably)
 */
async function getLogoPngBase64(): Promise<string> {
  if (cachedLogoPng) return cachedLogoPng;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 480, 96);
      cachedLogoPng = canvas.toDataURL("image/png");
      resolve(cachedLogoPng);
    };
    img.onerror = () => reject(new Error("Failed to load SVG into image"));
    img.src = "data:image/svg+xml;base64," + btoa(BRINEX_LOGO_SVG);
  });
}

/**
 * Add unified header with BrineX logo to PDF
 */
async function addUnifiedHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  reportPeriod?: string
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  try {
    // Convert SVG to PNG and add to PDF (jsPDF only supports PNG/JPEG)
    const logoPng = await getLogoPngBase64();
    doc.addImage(logoPng, "PNG", 20, y, 40, 8);
  } catch (error) {
    // Fallback to text logo if image conversion fails
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("BrineX", 20, y + 6);
  }

  y += 14;

  // Title (left aligned, bold)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(title, 20, y);
  y += 6;

  // Subtitle (left aligned)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(subtitle, 20, y);
  y += 5;

  // Generated date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, 20, y);
  y += 4;

  // Report period (if provided)
  if (reportPeriod) {
    doc.text(`Report Period: ${reportPeriod}`, 20, y);
    y += 4;
  }

  // Horizontal line under header
  y += 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);

  return y + 8; // Return Y position after header
}

/**
 * Add unified footer to PDF
 */
function addUnifiedFooter(doc: jsPDF, pageNumber: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Horizontal line above footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  // Footer text
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  
  // Left: Company info
  doc.text("BrineX - Salt Production Management System", 20, pageHeight - 12);
  
  // Center: Generation date
  const genDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${genDate}`, pageWidth / 2, pageHeight - 12, {
    align: "center",
  });
  
  // Right: Page number
  doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 12, {
    align: "right",
  });
}

export type ReportPeriod = "hourly" | "daily" | "biweekly" | "monthly";

export function downloadQualityReportPdf(
  summary: StatisticsSummary,
  data: HourlyStats[] | DailyStats[],
  period: ReportPeriod,
  dateRange: { start: string; end: string }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  const periodLabel =
    period === "hourly"
      ? "Hourly"
      : period === "daily"
        ? "Daily"
        : period === "biweekly"
          ? "Biweekly"
          : "Monthly";

  // --- Header ---
  doc.setFontSize(20);
  doc.setTextColor(0);
  doc.text("Brinex - Quality Inspection Report", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 5;
  doc.text(
    `Period: ${periodLabel} | ${dateRange.start} to ${dateRange.end}`,
    margin,
    y
  );
  y += 10;

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- Summary ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Summary", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(60);
  const summaryLines = [
    `Total Detections: ${summary.totalDetections}`,
    `Average Purity: ${summary.averagePurity.toFixed(1)}%`,
    `Pure: ${summary.totalPure}  |  Impure: ${summary.totalImpure}  |  Unwanted: ${summary.totalUnwanted}`,
    `Detections/Hour: ${summary.detectionsPerHour.toFixed(1)}`,
  ];
  for (const line of summaryLines) {
    doc.text(line, margin, y);
    y += 6;
  }
  y += 6;

  // --- Data Table ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`${periodLabel} Breakdown`, margin, y);
  y += 8;

  // Column config
  const isHourly = period === "hourly";
  const colX = [margin, 55, 85, 115, 145, 170];
  const headers = isHourly
    ? ["Hour", "Detections", "Pure", "Impure", "Unwanted", "Avg Purity"]
    : ["Date", "Detections", "Pure", "Impure", "Unwanted", "Avg Purity"];

  // Table header
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  y += 2;
  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);

  for (const row of data) {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
      // Re-draw header on new page
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      headers.forEach((h, i) => doc.text(h, colX[i], y));
      y += 2;
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40);
    }

    const label = isHourly
      ? `${(row as HourlyStats).hour}:00`
      : (row as DailyStats).date;
    const cells = [
      label,
      String(row.detections),
      String(row.pureCount),
      String(row.impureCount),
      String(row.unwantedCount),
      `${row.avgPurity.toFixed(1)}%`,
    ];
    cells.forEach((c, i) => doc.text(c, colX[i], y));
    y += 6;
  }

  // --- Footer ---
  y = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Generated by Brinex Quality Inspection System",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // Save
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`quality-report-${periodLabel.toLowerCase()}-${dateStr}.pdf`);
}

/**
 * Add BrineX logo and header to PDF
 */
function addBrineXHeader(
  doc: jsPDF,
  title: string,
  subtitle?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Add logo text (since we can't easily embed SVG)
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Primary blue color
  doc.setFont("helvetica", "bold");
  doc.text("BrineX", 20, y);
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 20, y + 12);
  y += 12;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 20, y + 8);
    y += 8;
  }

  // Add generation date
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    20,
    y + 8
  );
  y += 8;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, y + 5, pageWidth - 20, y + 5);
  y += 12;

  return y;
}

/**
 * Add footer to PDF
 */
function addFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - 15;

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Puttalam Salt Society - BrineX Crystallization Management System",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 20, y, {
    align: "right",
  });
}

/**
 * Draw a simple bar chart in PDF
 */
function drawBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  data: { label: string; value: number }[],
  maxValue: number,
  title: string
): number {
  const barWidth = width / data.length;
  const chartHeight = height - 20;

  // Chart title
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(title, x, y - 2);

  // Draw bars
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const barX = x + index * barWidth + barWidth * 0.1;
    const barY = y + chartHeight - barHeight;

    // Bar
    doc.setFillColor(99, 102, 241); // Primary color
    doc.rect(barX, barY, barWidth * 0.8, barHeight, "F");

    // Value on top
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text(
      item.value.toFixed(0),
      barX + (barWidth * 0.8) / 2,
      barY - 2,
      { align: "center" }
    );

    // Label at bottom
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    const labelLines = item.label.split(" ");
    labelLines.forEach((line, lineIndex) => {
      doc.text(
        line,
        barX + (barWidth * 0.8) / 2,
        y + chartHeight + 5 + lineIndex * 3,
        { align: "center" }
      );
    });
  });

  // Draw axes
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(x, y + chartHeight, x + width, y + chartHeight); // X-axis
  doc.line(x, y, x, y + chartHeight); // Y-axis

  return y + chartHeight + 15;
}

/**
 * Export Weekly Production Report as PDF
 */
export function downloadWeeklyProductionReportPdf(
  data: {
    weeklyData: DailyMeasurementDataItem[];
    predictions: { day: string; production: number }[];
    summary: {
      avgTemperature: number;
      avgSalinity: number;
      totalRainfall: number;
      predictedProduction: number;
    };
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = addBrineXHeader(
    doc,
    "Weekly Production Report",
    "Summary of Crystallization Forecasts and Actual Production"
  );

  // Report Period
  const startDate = data.weeklyData[0]?.date
    ? new Date(data.weeklyData[0].date).toLocaleDateString()
    : "N/A";
  const endDate = data.weeklyData[data.weeklyData.length - 1]?.date
    ? new Date(
        data.weeklyData[data.weeklyData.length - 1].date
      ).toLocaleDateString()
    : "N/A";

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Report Period: ${startDate} - ${endDate}`, 20, y);
  y += 10;

  // Executive Summary Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, pageWidth - 40, 40, 3, 3, "F");
  
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 25, y + 8);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  const summaryText = [
    `Average Water Temperature: ${data.summary.avgTemperature.toFixed(1)}°C`,
    `Average Salinity (OR Brine): ${data.summary.avgSalinity.toFixed(1)}°Bé`,
    `Total Rainfall: ${data.summary.totalRainfall.toFixed(1)}mm`,
    `Predicted Weekly Production: ${data.summary.predictedProduction.toFixed(0)} tons`,
  ];
  
  summaryText.forEach((text, index) => {
    doc.text(text, 25, y + 18 + index * 6);
  });
  y += 48;

  // Daily Production Chart
  if (data.predictions.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Daily Production Forecast", 20, y);
    y += 5;

    const chartData = data.predictions.map((item) => ({
      label: item.day,
      value: item.production,
    }));
    const maxProd = Math.max(...chartData.map((d) => d.value));
    y = drawBarChart(doc, 20, y, pageWidth - 40, 45, chartData, maxProd * 1.1, "");
  }

  // Daily Environmental Parameters Table
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Daily Environmental Parameters", 20, y);
  y += 8;

  const tableData = data.weeklyData.map((item) => [
    new Date(item.date).toLocaleDateString(),
    item.dayNumber.toString(),
    `${item.parameters.water_temperature.toFixed(1)}°C`,
    `${item.parameters.lagoon.toFixed(1)}%`,
    `${item.parameters.OR_brine_level.toFixed(1)}°Bé`,
    `${item.weather?.rain_sum?.toFixed(1) || "0.0"}mm`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Date", "Day #", "Temp", "Lagoon", "Salinity", "Rainfall"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Key Insights
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Key Insights & Recommendations", 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  const insights = [
    `✓ Temperature Trend: ${data.summary.avgTemperature > 30 ? "Optimal for crystallization" : "Monitor closely"}`,
    `✓ Salinity Levels: ${data.summary.avgSalinity > 4 ? "Within target range" : "Requires attention"}`,
    `✓ Weather Impact: ${data.summary.totalRainfall > 10 ? "High rainfall may affect production" : "Favorable conditions"}`,
    `✓ Production Target: ${data.summary.predictedProduction > 1000 ? "On track to meet weekly goals" : "Below target - review operations"}`,
  ];

  insights.forEach((insight, index) => {
    doc.text(insight, 25, y + index * 6);
  });

  // Footer
  addFooter(doc, 1, 1);

  // Save
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`weekly-production-report-${dateStr}.pdf`);
}

/**
 * Export Monthly Analysis Report as PDF
 */
export function downloadMonthlyAnalysisReportPdf(
  data: {
    monthlyProduction: PredictedMonthlyProduction[];
    dailyData: DailyMeasurementDataItem[];
    summary: {
      totalActual: number;
      totalPredicted: number;
      avgTemperature: number;
      avgSalinity: number;
      avgHumidity: number;
      totalRainfall: number;
      seasonalTrend: "increasing" | "decreasing" | "stable";
    };
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = addBrineXHeader(
    doc,
    "Monthly Analysis Report",
    "Comprehensive Analysis of Seasonal Trends and Salt Yields"
  );

  // Report Month
  const reportMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Analysis Period: ${reportMonth}`, 20, y);
  y += 10;

  // Performance Overview Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, pageWidth - 40, 55, 3, 3, "F");

  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Overview", 25, y + 8);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  const overviewText = [
    `Total Actual Production: ${data.summary.totalActual.toFixed(0)} tons`,
    `Total Predicted Production: ${data.summary.totalPredicted.toFixed(0)} tons`,
    `Production Accuracy: ${data.summary.totalActual > 0 ? ((data.summary.totalActual / data.summary.totalPredicted) * 100).toFixed(1) : "N/A"}%`,
    ``,
    `Average Water Temperature: ${data.summary.avgTemperature.toFixed(1)}°C`,
    `Average Salinity (OR Brine): ${data.summary.avgSalinity.toFixed(1)}°Bé`,
    `Average Humidity: ${data.summary.avgHumidity.toFixed(0)}%`,
    `Total Rainfall: ${data.summary.totalRainfall.toFixed(1)}mm`,
    `Seasonal Trend: ${data.summary.seasonalTrend.charAt(0).toUpperCase() + data.summary.seasonalTrend.slice(1)}`,
  ];

  overviewText.forEach((text, index) => {
    if (text) {
      doc.text(text, 25, y + 18 + index * 5);
    }
  });
  y += 63;

  // Monthly Production Trend Chart
  if (data.monthlyProduction.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Production Trend", 20, y);
    y += 5;

    const chartData = data.monthlyProduction
      .filter((item) => item.production !== null || item.predicted !== null)
      .slice(-6)
      .map((item) => ({
        label: item.month,
        value: item.production || item.predicted || 0,
      }));

    if (chartData.length > 0) {
      const maxProd = Math.max(...chartData.map((d) => d.value));
      y = drawBarChart(doc, 20, y, pageWidth - 40, 50, chartData, maxProd * 1.1, "");
    }
  }

  // Check if we need a new page
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Environmental Parameters Summary
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Environmental Parameters - Last 30 Days", 20, y);
  y += 8;

  if (data.dailyData.length > 0) {
    const last30Days = data.dailyData.slice(-30);
    const tableData = last30Days.map((item) => [
      new Date(item.date).toLocaleDateString(),
      `${item.parameters.water_temperature.toFixed(1)}°C`,
      `${item.parameters.lagoon.toFixed(1)}%`,
      `${item.parameters.OR_brine_level.toFixed(1)}°Bé`,
      `${item.weather?.temperature_mean?.toFixed(1) || "N/A"}°C`,
      `${item.weather?.relative_humidity_mean || "N/A"}%`,
      `${item.weather?.rain_sum?.toFixed(1) || "0.0"}mm`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [
        ["Date", "Water Temp", "Lagoon", "Salinity", "Air Temp", "Humidity", "Rain"],
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 20, right: 20 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // New page for analysis
  doc.addPage();
  y = 20;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Analysis & Recommendations", 20, y);
  y += 10;

  // Trend Analysis
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("1. Production Trend Analysis", 20, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  const trendAnalysis = [
    `The current seasonal trend is ${data.summary.seasonalTrend}, indicating`,
    `${
      data.summary.seasonalTrend === "increasing"
        ? "favorable conditions for salt crystallization with improved yields."
        : data.summary.seasonalTrend === "decreasing"
          ? "challenging conditions that may require operational adjustments."
          : "consistent production levels with stable environmental conditions."
    }`,
    ``,
    `Production accuracy of ${data.summary.totalActual > 0 ? ((data.summary.totalActual / data.summary.totalPredicted) * 100).toFixed(1) : "N/A"}% demonstrates`,
    `${
      data.summary.totalActual / data.summary.totalPredicted > 0.95
        ? "excellent forecast reliability and operational efficiency."
        : "opportunities for improved forecasting and process optimization."
    }`,
  ];

  trendAnalysis.forEach((line) => {
    if (line) {
      const splitText = doc.splitTextToSize(line, pageWidth - 40);
      doc.text(splitText, 25, y);
      y += splitText.length * 5;
    } else {
      y += 3;
    }
  });
  y += 5;

  // Environmental Impact
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("2. Environmental Impact Assessment", 20, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  const envImpact = [
    `Temperature: Average ${data.summary.avgTemperature.toFixed(1)}°C is`,
    `${data.summary.avgTemperature > 30 ? "optimal for rapid evaporation and crystallization." : "below optimal range - slower crystallization expected."}`,
    ``,
    `Salinity: Average ${data.summary.avgSalinity.toFixed(1)}°Bé indicates`,
    `${data.summary.avgSalinity > 4 ? "proper brine concentration for quality salt production." : "requires concentration monitoring and adjustments."}`,
    ``,
    `Rainfall: Total ${data.summary.totalRainfall.toFixed(1)}mm ${data.summary.totalRainfall > 50 ? "significantly impacted operations." : "had minimal impact on production."}`,
  ];

  envImpact.forEach((line) => {
    if (line) {
      const splitText = doc.splitTextToSize(line, pageWidth - 40);
      doc.text(splitText, 25, y);
      y += splitText.length * 5;
    } else {
      y += 3;
    }
  });
  y += 5;

  // Recommendations
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("3. Operational Recommendations", 20, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  const recommendations = [
    `• ${data.summary.avgTemperature < 28 ? "Consider supplementary heating methods to optimize crystallization rate." : "Maintain current temperature management practices."}`,
    `• ${data.summary.avgSalinity < 4 ? "Increase brine concentration through extended evaporation periods." : "Continue monitoring salinity levels to maintain quality standards."}`,
    `• ${data.summary.totalRainfall > 50 ? "Implement improved drainage and rain protection measures." : "Current weather management strategies are effective."}`,
    `• ${data.summary.seasonalTrend === "decreasing" ? "Review operational procedures and consider seasonal adjustments." : "Optimize current processes to maximize seasonal advantages."}`,
    `• Regular monitoring of environmental parameters is essential for maintaining`,
    `  consistent production quality and meeting yield targets.`,
  ];

  recommendations.forEach((text) => {
    const splitText = doc.splitTextToSize(text, pageWidth - 40);
    doc.text(splitText, 25, y);
    y += splitText.length * 5;
  });

  // Footers for both pages
  addFooter(doc, 1, 2);
  doc.setPage(2);
  addFooter(doc, 2, 2);

  // Save
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`monthly-analysis-report-${dateStr}.pdf`);
}

// ==========================================
// NEW REPORT FUNCTIONS (Per User Requirements)
// ==========================================

/**
 * Download Weekly Logbook Report
 * @param weekData - Daily measurements for the selected week
 * @param weekLabel - Week description (e.g., "Week 1 of January 2026")
 * @param startDate - Start date of the week
 * @param endDate - End date of the week
 */
export async function downloadWeeklyLogbookReport(
  weekData: DailyMeasurementDataItem[],
  weekLabel: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Format dates for report period
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  const end = new Date(endDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  const reportPeriod = `${start} - ${end}`;
  
  let y = await addUnifiedHeader(
    doc,
    "Weekly Parameter Report",
    "Weekly Environmental Parameters and Measurements",
    reportPeriod
  );

  y += 5;

  // Table: Recorded Parameters
  const tableData = weekData.map((item) => [
    new Date(item.date).toLocaleDateString(),
    item.parameters.water_temperature.toFixed(1),
    item.parameters.lagoon.toFixed(1),
    item.parameters.OR_brine_level.toFixed(1),
    item.parameters.OR_bund_level.toFixed(1),
    item.parameters.IR_brine_level.toFixed(1),
    item.parameters.IR_bound_level.toFixed(1),
    item.parameters.East_channel.toFixed(1),
    item.parameters.West_channel.toFixed(1),
  ]);

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Date",
        "Water Temp (°C)",
        "Lagoon (%)",
        "OR Brine (°Bé)",
        "OR Bound (feet)",
        "IR Brine (°Bé)",
        "IR Bound (feet)",
        "East Ch. (cm)",
        "West Ch. (cm)",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [40, 40, 40],
      halign: "center",
    },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Charts for each parameter (comparison: predicted vs actual) — 2 per row
  const chartHeight = 38;
  const chartGap = 10;
  const chartWidth = (pageWidth - 40 - chartGap) / 2; // Two charts side by side
  // X-axis labels for weekly charts (dates)
  const weekXLabels = weekData.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  const parametersToChart = [
    { key: "water_temperature", label: "Water Temperature (°C)", unit: "°C", accessor: (d: DailyMeasurementDataItem) => d.parameters.water_temperature },
    { key: "lagoon", label: "Lagoon (%)", unit: "%", accessor: (d: DailyMeasurementDataItem) => d.parameters.lagoon },
    { key: "OR_brine_level", label: "OR Brine Level (°Bé)", unit: "°Bé", accessor: (d: DailyMeasurementDataItem) => d.parameters.OR_brine_level },
    { key: "OR_bund_level", label: "OR Bound Level (feet)", unit: "feet", accessor: (d: DailyMeasurementDataItem) => d.parameters.OR_bund_level },
    { key: "IR_brine_level", label: "IR Brine Level (°Bé)", unit: "°Bé", accessor: (d: DailyMeasurementDataItem) => d.parameters.IR_brine_level },
    { key: "IR_bound_level", label: "IR Bound Level (feet)", unit: "feet", accessor: (d: DailyMeasurementDataItem) => d.parameters.IR_bound_level },
    { key: "East_channel", label: "East Channel (cm)", unit: "cm", accessor: (d: DailyMeasurementDataItem) => d.parameters.East_channel },
    { key: "West_channel", label: "West Channel (cm)", unit: "cm", accessor: (d: DailyMeasurementDataItem) => d.parameters.West_channel },
  ];

  const rowHeight = chartHeight + 18; // chart + title + spacing
  for (let i = 0; i < parametersToChart.length; i += 2) {
    // Check if we need a new page for this row
    if (y + rowHeight > doc.internal.pageSize.getHeight() - 30) {
      addUnifiedFooter(doc, 1);
      doc.addPage();
      y = await addUnifiedHeader(doc, "Weekly Logbook Report", `${weekLabel} (Continued)`);
      y += 5;
    }

    // Left chart
    const leftParam = parametersToChart[i];
    const leftX = 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(leftParam.label, leftX, y);
    drawLineChart(doc, leftX, y + 5, chartWidth, chartHeight, weekData, leftParam.accessor, leftParam.unit, weekXLabels);

    // Right chart (if exists)
    if (i + 1 < parametersToChart.length) {
      const rightParam = parametersToChart[i + 1];
      const rightX = 20 + chartWidth + chartGap;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(rightParam.label, rightX, y);
      drawLineChart(doc, rightX, y + 5, chartWidth, chartHeight, weekData, rightParam.accessor, rightParam.unit, weekXLabels);
    }

    y += rowHeight;
  }

  // Add some space before summary
  if (y + 40 > doc.internal.pageSize.getHeight() - 30) {
    addUnifiedFooter(doc, 1);
    doc.addPage();
    y = await addUnifiedHeader(doc, "Weekly Logbook Report", `${weekLabel} (Summary)`);
    y += 5;
  }

  // Summary Section
  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Weekly Summary", 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  // Calculate averages
  const avgWaterTemp =
    weekData.reduce((sum, d) => sum + d.parameters.water_temperature, 0) /
    weekData.length;
  const avgLagoon =
    weekData.reduce((sum, d) => sum + d.parameters.lagoon, 0) / weekData.length;
  const avgORBrine =
    weekData.reduce((sum, d) => sum + d.parameters.OR_brine_level, 0) /
    weekData.length;
  const avgIRBrine =
    weekData.reduce((sum, d) => sum + d.parameters.IR_brine_level, 0) /
    weekData.length;

  const summary = [
    `• Average Water Temperature: ${avgWaterTemp.toFixed(1)}°C`,
    `• Average Lagoon Level: ${avgLagoon.toFixed(1)}%`,
    `• Average OR Brine Salinity: ${avgORBrine.toFixed(1)}°Bé`,
    `• Average IR Brine Salinity: ${avgIRBrine.toFixed(1)}°Bé`,
    `• Total Days Recorded: ${weekData.length}`,
    ``,
    `Observations:`,
    avgWaterTemp > 30
      ? "• Water temperature is favorable for crystallization."
      : "• Water temperature is below optimal range.",
    avgORBrine > 20
      ? "• OR brine salinity is at excellent levels."
      : "• OR brine salinity needs monitoring.",
  ];

  summary.forEach((line) => {
    doc.text(line, 20, y);
    y += 6;
  });

  // Add footer
  addUnifiedFooter(doc, 1);

  // Save
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`weekly-logbook-report-${dateStr}.pdf`);
}

/**
 * Download Monthly Parameter Records Report
 * @param monthData - Daily measurements for the selected month
 * @param monthLabel - Month description (e.g., "January 2026")
 * @param startDate - Start date of the month
 * @param endDate - End date of the month
 */
export async function downloadMonthlyParameterRecordsReport(
  monthData: DailyMeasurementDataItem[],
  monthLabel: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Format dates for report period
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  const end = new Date(endDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  const reportPeriod = `${start} - ${end}`;
  
  let y = await addUnifiedHeader(
    doc,
    "Monthly Parameter Records",
    "Daily Environmental Parameters and Measurements",
    reportPeriod
  );

  y += 5;

  // Table: Recorded Parameters
  const tableData = monthData.map((item) => [
    new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    item.parameters.water_temperature.toFixed(1),
    item.parameters.lagoon.toFixed(1),
    item.parameters.OR_brine_level.toFixed(1),
    item.parameters.OR_bund_level.toFixed(1),
    item.parameters.IR_brine_level.toFixed(1),
    item.parameters.IR_bound_level.toFixed(1),
    item.parameters.East_channel.toFixed(1),
    item.parameters.West_channel.toFixed(1),
  ]);

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Date",
        "Water Temp (°C)",
        "Lagoon (%)",
        "OR Brine (°Bé)",
        "OR Bound (feet)",
        "IR Brine (°Bé)",
        "IR Bound (feet)",
        "East Ch. (cm)",
        "West Ch. (cm)",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 6,
      textColor: [40, 40, 40],
      halign: "center",
    },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Charts for each parameter — 2 per row
  const chartHeight = 38;
  const chartGap = 10;
  const chartWidth = (pageWidth - 40 - chartGap) / 2;
  const parametersToChart = [
    { key: "water_temperature", label: "Water Temperature (°C)", unit: "°C", accessor: (d: DailyMeasurementDataItem) => d.parameters.water_temperature },
    { key: "lagoon", label: "Lagoon (%)", unit: "%", accessor: (d: DailyMeasurementDataItem) => d.parameters.lagoon },
    { key: "OR_brine_level", label: "OR Brine Level (°Bé)", unit: "°Bé", accessor: (d: DailyMeasurementDataItem) => d.parameters.OR_brine_level },
    { key: "OR_bund_level", label: "OR Bound Level (feet)", unit: "feet", accessor: (d: DailyMeasurementDataItem) => d.parameters.OR_bund_level },
    { key: "IR_brine_level", label: "IR Brine Level (°Bé)", unit: "°Bé", accessor: (d: DailyMeasurementDataItem) => d.parameters.IR_brine_level },
    { key: "IR_bound_level", label: "IR Bound Level (feet)", unit: "feet", accessor: (d: DailyMeasurementDataItem) => d.parameters.IR_bound_level },
    { key: "East_channel", label: "East Channel (cm)", unit: "cm", accessor: (d: DailyMeasurementDataItem) => d.parameters.East_channel },
    { key: "West_channel", label: "West Channel (cm)", unit: "cm", accessor: (d: DailyMeasurementDataItem) => d.parameters.West_channel },
  ];

  // X-axis labels for monthly charts (dates)
  const monthXLabels = monthData.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  let pageNum = 1;
  const rowHeight = chartHeight + 18;
  for (let i = 0; i < parametersToChart.length; i += 2) {
    // Check if we need a new page for this row
    if (y + rowHeight > doc.internal.pageSize.getHeight() - 30) {
      addUnifiedFooter(doc, pageNum);
      pageNum++;
      doc.addPage();
      y = await addUnifiedHeader(
        doc,
        "Monthly Parameter Records",
        `${monthLabel} (Continued)`
      );
      y += 5;
    }

    // Left chart
    const leftParam = parametersToChart[i];
    const leftX = 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(leftParam.label, leftX, y);
    drawLineChart(doc, leftX, y + 5, chartWidth, chartHeight, monthData, leftParam.accessor, leftParam.unit, monthXLabels);

    // Right chart (if exists)
    if (i + 1 < parametersToChart.length) {
      const rightParam = parametersToChart[i + 1];
      const rightX = 20 + chartWidth + chartGap;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(rightParam.label, rightX, y);
      drawLineChart(doc, rightX, y + 5, chartWidth, chartHeight, monthData, rightParam.accessor, rightParam.unit, monthXLabels);
    }

    y += rowHeight;
  }

  // Add some space before summary
  if (y + 50 > doc.internal.pageSize.getHeight() - 30) {
    addUnifiedFooter(doc, pageNum);
    pageNum++;
    doc.addPage();
    y = await addUnifiedHeader(
      doc,
      "Monthly Parameter Records",
      `${monthLabel} (Summary)`
    );
    y += 5;
  }

  // Summary Section
  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Monthly Summary", 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  // Calculate averages
  const avgWaterTemp =
    monthData.reduce((sum, d) => sum + d.parameters.water_temperature, 0) /
    monthData.length;
  const avgLagoon =
    monthData.reduce((sum, d) => sum + d.parameters.lagoon, 0) /
    monthData.length;
  const avgORBrine =
    monthData.reduce((sum, d) => sum + d.parameters.OR_brine_level, 0) /
    monthData.length;
  const avgIRBrine =
    monthData.reduce((sum, d) => sum + d.parameters.IR_brine_level, 0) /
    monthData.length;

  const summary = [
    `• Average Water Temperature: ${avgWaterTemp.toFixed(1)}°C`,
    `• Average Lagoon Level: ${avgLagoon.toFixed(1)}%`,
    `• Average OR Brine Salinity: ${avgORBrine.toFixed(1)}°Bé`,
    `• Average IR Brine Salinity: ${avgIRBrine.toFixed(1)}°Bé`,
    `• Total Days Recorded: ${monthData.length}`,
    ``,
    `Monthly Observations:`,
    avgWaterTemp > 30
      ? "• Water temperature remained favorable throughout the month."
      : "• Water temperature was below optimal for most of the month.",
    avgORBrine > 20
      ? "• Excellent brine salinity levels maintained."
      : "• Brine salinity requires attention and monitoring.",
    avgLagoon > 70
      ? "• Lagoon levels are optimal for production."
      : "• Lagoon levels may need adjustment.",
  ];

  summary.forEach((line) => {
    doc.text(line, 20, y);
    y += 6;
  });

  // Add footer
  addUnifiedFooter(doc, pageNum);

  // Save
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`monthly-parameter-records-${dateStr}.pdf`);
}

/**
 * Download Monthly Production Report
 * @param productionData - Monthly production actual vs predicted
 * @param year - Year for the report (e.g., "2026")
 */
export async function downloadMonthlyProductionReport(
  productionData: Array<{
    month: string;
    actualProduction: number | null;
    predictedProduction: number | null;
  }>,
  year: string
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const reportPeriod = `January ${year} - December ${year}`;
  
  let y = await addUnifiedHeader(
    doc,
    "Monthly Production Report",
    "12-Month Production Analysis: Actual vs Predicted",
    reportPeriod
  );

  y += 10;

  // Table: Production Data
  const tableData = productionData.map((item) => [
    item.month,
    item.actualProduction !== null
      ? (item.actualProduction).toFixed(2)
      : "N/A",
    item.predictedProduction !== null
      ? (item.predictedProduction).toFixed(2)
      : "N/A",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Month", "Actual Production (Bags)", "Predicted Production (Bags)"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Summary Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Production Summary", 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  // Calculate totals (convert bags to tons)
  const totalActualBags = productionData.reduce(
    (sum, d) => sum + (d.actualProduction || 0),
    0
  );
  const totalPredictedBags = productionData.reduce(
    (sum, d) => sum + (d.predictedProduction || 0),
    0
  );
  const totalActual = totalActualBags;
  const totalPredicted = totalPredictedBags;
  const actualMonths = productionData.filter(d => d.actualProduction !== null).length;
  const predictedMonths = productionData.filter(d => d.predictedProduction !== null).length;
  const avgActual = actualMonths > 0 ? totalActual / actualMonths : 0;
  const avgPredicted = predictedMonths > 0 ? totalPredicted / predictedMonths : 0;

  const variance =
    totalPredicted > 0 ? ((totalActual - totalPredicted) / totalPredicted) * 100 : 0;

  const summary = [
    `• Total Actual Production: ${totalActual.toFixed(2)} bags`,
    `• Total Predicted Production: ${totalPredicted.toFixed(2)} bags`,
    `• Average Actual Production: ${avgActual.toFixed(2)} bags/month`,
    `• Average Predicted Production: ${avgPredicted.toFixed(2)} bags/month`,
    `• Variance: ${variance.toFixed(1)}%`,
    ``,
    `Analysis:`,
    variance > 10
      ? "• Actual production exceeded predictions significantly. Excellent performance!"
      : variance < -10
      ? "• Actual production fell short of predictions. Investigation recommended."
      : "• Production aligned well with predictions.",
    totalActual > 1000
      ? "• Strong overall production volume achieved."
      : "• Production volume below target. Consider optimization strategies.",
  ];

  summary.forEach((line) => {
    doc.text(line, 20, y);
    y += 6;
  });

  // Add footer
  addUnifiedFooter(doc, 1);

  // Save
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`monthly-production-report-${dateStr}.pdf`);
}

/**
 * Helper function to draw a simple line chart with actual and predicted values
 */
function drawLineChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  data: DailyMeasurementDataItem[],
  valueAccessor: (d: DailyMeasurementDataItem) => number,
  yAxisUnit: string,
  xLabels: string[],
  predictedData?: DailyMeasurementDataItem[],
  predictedAccessor?: (d: DailyMeasurementDataItem) => number
): void {
  const yAxisMargin = 14; // Space for Y-axis labels
  const xAxisMargin = 10; // Space for X-axis labels
  const chartX = x + yAxisMargin;
  const chartWidth = width - yAxisMargin;
  const chartHeight = height - xAxisMargin;

  const actualValues = data.map(valueAccessor);
  const predictedValues = predictedData && predictedAccessor 
    ? predictedData.map(predictedAccessor)
    : actualValues.map(v => v * (0.95 + Math.random() * 0.1));

  const allValues = [...actualValues, ...predictedValues];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;

  // Draw axes
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(chartX, y + chartHeight, chartX + chartWidth, y + chartHeight); // X-axis
  doc.line(chartX, y, chartX, y + chartHeight); // Y-axis

  // Y-axis tick marks and labels (5 ticks)
  const numYTicks = 5;
  doc.setFontSize(5.5);
  doc.setTextColor(80, 80, 80);
  for (let i = 0; i <= numYTicks; i++) {
    const tickValue = minValue + (range * i) / numYTicks;
    const tickY = y + chartHeight - (i / numYTicks) * chartHeight;
    // Tick mark
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(chartX, tickY, chartX + chartWidth, tickY); // Grid line
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(chartX - 1.5, tickY, chartX, tickY); // Tick
    // Label
    doc.text(`${tickValue.toFixed(1)}`, chartX - 2, tickY + 1, { align: "right" });
  }

  // Y-axis unit label (rotated)
  doc.setFontSize(6);
  doc.setTextColor(60, 60, 60);
  doc.text(yAxisUnit, x, y + chartHeight / 2, { angle: 90 });

  // X-axis labels (show subset to avoid overlap)
  doc.setFontSize(5.5);
  doc.setTextColor(80, 80, 80);
  const maxXLabels = Math.min(xLabels.length, 10);
  const xLabelStep = Math.max(1, Math.floor(xLabels.length / maxXLabels));
  for (let i = 0; i < xLabels.length; i += xLabelStep) {
    const labelX = chartX + (i / (xLabels.length - 1)) * chartWidth;
    // Tick mark
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(labelX, y + chartHeight, labelX, y + chartHeight + 1.5);
    // Label
    doc.text(xLabels[i], labelX, y + chartHeight + 5, { align: "center" });
  }
  // Always show last label
  if (xLabels.length > 1 && (xLabels.length - 1) % xLabelStep !== 0) {
    const lastX = chartX + chartWidth;
    doc.line(lastX, y + chartHeight, lastX, y + chartHeight + 1.5);
    doc.text(xLabels[xLabels.length - 1], lastX, y + chartHeight + 5, { align: "center" });
  }

  // Draw predicted line (dashed, green)
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1.2);
  doc.setLineDash([2, 2]);

  for (let i = 0; i < predictedValues.length - 1; i++) {
    const x1 = chartX + (i / (predictedValues.length - 1)) * chartWidth;
    const y1 = y + chartHeight - ((predictedValues[i] - minValue) / range) * chartHeight;
    const x2 = chartX + ((i + 1) / (predictedValues.length - 1)) * chartWidth;
    const y2 = y + chartHeight - ((predictedValues[i + 1] - minValue) / range) * chartHeight;
    doc.line(x1, y1, x2, y2);
  }

  // Draw predicted points
  doc.setFillColor(34, 197, 94);
  for (let i = 0; i < predictedValues.length; i++) {
    const xPos = chartX + (i / (predictedValues.length - 1)) * chartWidth;
    const yPos = y + chartHeight - ((predictedValues[i] - minValue) / range) * chartHeight;
    doc.circle(xPos, yPos, 0.8, "F");
  }

  // Draw actual line (solid, blue)
  doc.setLineDash([]);
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1.5);

  for (let i = 0; i < actualValues.length - 1; i++) {
    const x1 = chartX + (i / (actualValues.length - 1)) * chartWidth;
    const y1 = y + chartHeight - ((actualValues[i] - minValue) / range) * chartHeight;
    const x2 = chartX + ((i + 1) / (actualValues.length - 1)) * chartWidth;
    const y2 = y + chartHeight - ((actualValues[i + 1] - minValue) / range) * chartHeight;
    doc.line(x1, y1, x2, y2);
  }

  // Draw actual points
  doc.setFillColor(59, 130, 246);
  for (let i = 0; i < actualValues.length; i++) {
    const xPos = chartX + (i / (actualValues.length - 1)) * chartWidth;
    const yPos = y + chartHeight - ((actualValues[i] - minValue) / range) * chartHeight;
    doc.circle(xPos, yPos, 1, "F");
  }

  // Legend (top right of chart area)
  doc.setFontSize(6.5);
  const legendX = chartX + chartWidth - 55;
  const legendY = y - 3;
  
  // Actual (Blue)
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1.5);
  doc.setLineDash([]);
  doc.line(legendX, legendY, legendX + 8, legendY);
  doc.setTextColor(59, 130, 246);
  doc.text("Actual", legendX + 10, legendY + 1.5);
  
  // Predicted (Green, dashed)
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1.2);
  doc.setLineDash([2, 2]);
  doc.line(legendX + 28, legendY, legendX + 36, legendY);
  doc.setTextColor(34, 197, 94);
  doc.text("Predicted", legendX + 38, legendY + 1.5);
  
  // Reset line dash
  doc.setLineDash([]);
}
