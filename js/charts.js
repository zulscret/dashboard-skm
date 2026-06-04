/**
 * Charts Manager — Semua visualisasi Chart.js
 */

// Default Chart.js global config
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.color = "#9ca3af";

const CHART_COLORS = {
  jawaban: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"],
  unsur:   ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#3b82f6","#f97316","#14b8a6"],
  layanan: ["#3b82f6","#10b981","#f59e0b","#ec4899"],
};

const Charts = {
  instances: {},

  destroy(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  /** Bar chart horizontal — rata-rata per 9 unsur */
  renderBarUnsur(canvasId, nrrPerUnsur) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    const labels = UNSUR_SKM.map((u) => u.kode);
    const mutuColors = nrrPerUnsur.map((v) => Calculator.getMutuUnsur(v).color);

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Nilai Rata-rata",
          data: nrrPerUnsur.map((v) => parseFloat(v.toFixed(2))),
          backgroundColor: mutuColors.map((c) => c + "cc"),
          borderColor: mutuColors,
          borderWidth: 2,
          borderRadius: 8,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const nrr = ctx.parsed.x;
                const mutu = Calculator.getMutuUnsur(nrr);
                return ` ${nrr.toFixed(2)} — ${mutu.label}`;
              },
              title: (items) => UNSUR_SKM[items[0].dataIndex].nama,
            },
          },
        },
        scales: {
          x: {
            min: 1, max: 4,
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { stepSize: 0.5 },
          },
          y: {
            grid: { display: false },
          },
        },
        animation: { duration: 800, easing: "easeOutQuart" },
      },
    });
  },

  /** Donut chart — distribusi jawaban (1,2,3,4) untuk satu unsur */
  renderDonutDistribusi(canvasId, distribusiUnsur, totalResponden) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    const labels = ["Tidak Baik (1)", "Kurang Baik (2)", "Baik (3)", "Sangat Baik (4)"];
    const data = [1, 2, 3, 4].map((v) => distribusiUnsur[v] || 0);
    const pct = data.map((d) => ((d / totalResponden) * 100).toFixed(1));

    this.instances[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: CHART_COLORS.jawaban.map((c) => c + "cc"),
          borderColor: CHART_COLORS.jawaban,
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 16, boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} orang (${pct[ctx.dataIndex]}%)`,
            },
          },
        },
        animation: { duration: 700, easing: "easeOutBack" },
      },
    });
  },

  /** Donut chart — jenis kelamin */
  renderDonutJK(canvasId, jkData) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Laki-laki", "Perempuan"],
        datasets: [{
          data: [jkData.L || 0, jkData.P || 0],
          backgroundColor: ["rgba(59,130,246,0.8)", "rgba(236,72,153,0.8)"],
          borderColor:     ["#3b82f6", "#ec4899"],
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: { position: "bottom", labels: { padding: 12, boxWidth: 12, font: { size: 11 } } },
        },
        animation: { duration: 600 },
      },
    });
  },

  /** Bar chart — distribusi pendidikan */
  renderBarPendidikan(canvasId, pendidikanData) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    const order = ["SD", "SMP", "SMA", "D3", "S1", "S2", "S3"];
    const labels = order.filter((k) => pendidikanData[k]);
    const values = labels.map((k) => pendidikanData[k] || 0);

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Responden",
          data: values,
          backgroundColor: "rgba(99,102,241,0.7)",
          borderColor: "#6366f1",
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" }, ticks: { stepSize: 1 } },
          x: { grid: { display: false } },
        },
        animation: { duration: 600 },
      },
    });
  },

  /** Donut chart — distribusi layanan */
  renderDonutLayanan(canvasId, layananData) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    const labels = Object.keys(layananData);
    const values = Object.values(layananData);

    this.instances[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: CHART_COLORS.layanan.map((c) => c + "cc"),
          borderColor: CHART_COLORS.layanan,
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "55%",
        plugins: {
          legend: { position: "bottom", labels: { padding: 10, boxWidth: 12, font: { size: 11 } } },
        },
        animation: { duration: 600 },
      },
    });
  },

  /** Line chart — Tren IKM Berkelanjutan */
  renderLineTrend(canvasId, historyData) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    const labels = historyData.map(d => d.periode);
    const data = historyData.map(d => d.ikm);

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Nilai IKM",
          data,
          borderColor: "#1e3a5f",
          backgroundColor: "rgba(30,58,95,0.1)",
          borderWidth: 3,
          pointBackgroundColor: "#c0392b",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` IKM: ${ctx.raw ? ctx.raw.toFixed(2) : 'Belum Ada'}`
            }
          }
        },
        scales: {
          y: {
            min: 60, max: 100, // Range IKM
            grid: { color: "rgba(0,0,0,0.05)" }
          },
          x: {
            grid: { display: false }
          }
        },
        animation: { duration: 800 }
      }
    });
  }
};
