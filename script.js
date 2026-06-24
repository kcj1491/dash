const dashboardData = {
  kpi: {
    totalCatch: 912.4,
    totalExport: 1319524,
    avgSatisfaction: 75.55,
    totalIncidents: 141,
    rows: 300,
    startDate: "2024-01-03",
    endDate: "2025-12-28",
  },
  topPorts: [
    { port: "앵커리지", value: 501792 },
    { port: "홋카이도", value: 390339 },
    { port: "시애틀", value: 382311 },
    { port: "보스턴", value: 380366 },
    { port: "샌디에이고", value: 322047 },
  ],
  monthlyExport: [
    { month: 1, y2024: 50952, y2025: 34910 },
    { month: 2, y2024: 43649, y2025: 47598 },
    { month: 3, y2024: 66201, y2025: 58793 },
    { month: 4, y2024: 49830, y2025: 60736 },
    { month: 5, y2024: 53460, y2025: 68591 },
    { month: 6, y2024: 50691, y2025: 75992 },
    { month: 7, y2024: 65898, y2025: 54657 },
    { month: 8, y2024: 73675, y2025: 57325 },
    { month: 9, y2024: 59014, y2025: 53006 },
    { month: 10, y2024: 50639, y2025: 60214 },
    { month: 11, y2024: 56582, y2025: 43860 },
    { month: 12, y2024: 43474, y2025: 39777 },
  ],
  riskIncidents: [
    { level: "Low", incidents: 38, avg: 0.4, records: 95 },
    { level: "Medium", incidents: 79, avg: 0.46, records: 171 },
    { level: "High", incidents: 24, avg: 0.71, records: 34 },
  ],
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-US");

const riskClassMap = {
  Low: "risk-low",
  Medium: "risk-medium",
  High: "risk-high",
};

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function renderKpis() {
  const { kpi } = dashboardData;

  setText("datasetMeta", `원본 CSV 기준 집계 · 분석 기간 ${kpi.startDate} ~ ${kpi.endDate} · 총 ${number.format(kpi.rows)}건`);
  setText("totalCatch", `${number.format(kpi.totalCatch)}t`);
  setText("totalExport", currency.format(kpi.totalExport));
  setText("avgSatisfaction", kpi.avgSatisfaction.toFixed(2));
  setText("totalIncidents", number.format(kpi.totalIncidents));
}

function renderTopPorts() {
  const container = document.getElementById("topPorts");
  const maxValue = Math.max(...dashboardData.topPorts.map((item) => item.value));

  container.innerHTML = dashboardData.topPorts
    .map((item, index) => {
      const width = (item.value / maxValue) * 100;
      return `
        <div class="rank-row">
          <span class="rank-num">${index + 1}</span>
          <span class="rank-label" title="${item.port}">${item.port}</span>
          <span class="bar-track" aria-hidden="true">
            <span class="bar-fill" style="width: ${width.toFixed(1)}%"></span>
          </span>
          <span class="rank-value">${currency.format(item.value)}</span>
        </div>
      `;
    })
    .join("");
}

function renderRiskChart() {
  const container = document.getElementById("riskChart");
  const maxIncidents = Math.max(...dashboardData.riskIncidents.map((item) => item.incidents));

  container.innerHTML = dashboardData.riskIncidents
    .map((item) => {
      const height = (item.incidents / maxIncidents) * 100;
      const className = riskClassMap[item.level] || "";
      return `
        <div class="risk-group">
          <div class="risk-bar-frame" aria-hidden="true">
            <div class="risk-bar ${className}" style="height: ${height.toFixed(1)}%"></div>
          </div>
          <div class="risk-count">${number.format(item.incidents)}</div>
          <div class="risk-label">${item.level}</div>
          <div class="risk-average">avg ${item.avg.toFixed(2)}</div>
        </div>
      `;
    })
    .join("");
}

function renderMonthlyExportChart() {
  const container = document.getElementById("monthlyExportChart");
  const data = dashboardData.monthlyExport;
  const width = 940;
  const height = 236;
  const margin = { top: 14, right: 24, bottom: 32, left: 64 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const yMin = 30000;
  const yMax = 80000;
  const ticks = [30000, 40000, 50000, 60000, 70000, 80000];

  const x = (month) => margin.left + ((month - 1) / 11) * chartWidth;
  const y = (value) => margin.top + ((yMax - value) / (yMax - yMin)) * chartHeight;

  const pointsFor = (key) => data.map((item) => `${x(item.month).toFixed(1)},${y(item[key]).toFixed(1)}`).join(" ");

  const grid = ticks
    .map((tick) => {
      const yPos = y(tick);
      return `
        <line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="#e2e8f0" stroke-width="1"></line>
        <text x="${margin.left - 10}" y="${yPos + 4}" text-anchor="end" font-size="11" fill="#64748b">${tick / 1000}k</text>
      `;
    })
    .join("");

  const monthLabels = data
    .map((item) => `<text x="${x(item.month)}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#475569">${item.month}</text>`)
    .join("");

  const markers = data
    .map((item) => {
      const xPos = x(item.month);
      return `
        <circle cx="${xPos}" cy="${y(item.y2024)}" r="3.6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"></circle>
        <circle cx="${xPos}" cy="${y(item.y2025)}" r="3.6" fill="#f97316" stroke="#ffffff" stroke-width="1.5"></circle>
      `;
    })
    .join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="2024년과 2025년 월별 수출액 추이">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"></rect>
      ${grid}
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#475569" stroke-width="1"></line>
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#475569" stroke-width="1"></line>
      <polyline points="${pointsFor("y2024")}" fill="none" stroke="#2563eb" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></polyline>
      <polyline points="${pointsFor("y2025")}" fill="none" stroke="#f97316" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${markers}
      ${monthLabels}
    </svg>
  `;
}

function renderDashboard() {
  renderKpis();
  renderTopPorts();
  renderRiskChart();
  renderMonthlyExportChart();
}

document.addEventListener("DOMContentLoaded", renderDashboard);
