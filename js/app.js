/**
 * Main App Controller — Admin Dashboard SKM
 * Perpustakaan Amir Machmud, Kemendagri
 */

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = "#4a5c6e";

let currentFilter = "semua";
let currentUnsurIdx = 0;

function init() {
  Storage.init();
  renderDashboard();
  setupFilters();
}

function renderDashboard() {
  const responden = Storage.getAllResponden();
  const info      = Storage.getSurveyInfo();
  const filter    = currentFilter === "semua" ? null : currentFilter;
  const hasil     = Calculator.hitung(responden, filter);

  if (!hasil) return;

  renderTopbar(info);
  renderHeroIKM(hasil, info);
  renderGridUnsur(hasil);
  renderCharts(hasil);
  renderProfilResponden(responden);
  renderTindakLanjut(hasil);
  renderSaran(responden);
  animateCounter("ikm-score-val", hasil.nik, 1200);
}

function renderTopbar(info) {
  const sub = document.getElementById("topbar-instansi");
  if (sub) sub.textContent = info.instansi;
  const badge = document.getElementById("mode-badge");
  if (badge && Storage.getMode() === "demo") badge.style.display = "inline-flex";
}

function renderHeroIKM(hasil, info) {
  const $  = id => document.getElementById(id);
  const m  = hasil.mutu;

  // IKM score (counter animates separately)
  const mutuBadge = $("ikm-mutu-badge");
  if (mutuBadge) {
    mutuBadge.textContent = `${m.grade} — ${m.label}`;
    mutuBadge.className   = `mutu-badge mutu-${m.grade}`;
    mutuBadge.style.background = "";
  }
  if ($("ikm-periode"))   $("ikm-periode").textContent   = info.periode;
  if ($("bc-periode"))    $("bc-periode").textContent    = info.periode;

  // Mutu card
  if ($("mutu-grade")) { $("mutu-grade").textContent = m.grade; $("mutu-grade").style.color = m.color; }
  if ($("mutu-label")) $("mutu-label").textContent = m.label;

  // Stats
  if ($("total-resp")) $("total-resp").textContent = hasil.totalResponden;

  // Unsur terlemah
  const terlemah = hasil.rankingUnsur[0];
  if ($("unsur-terendah-kode")) $("unsur-terendah-kode").textContent = terlemah.unsur.kode + ` (${terlemah.nrr.toFixed(2)})`;
  if ($("unsur-terendah-nama")) $("unsur-terendah-nama").textContent = terlemah.unsur.nama;
}

function renderGridUnsur(hasil) {
  const grid = document.getElementById("grid-unsur");
  if (!grid) return;
  grid.innerHTML = hasil.nrrPerUnsur.map((nrr, i) => {
    const m   = Calculator.getMutuUnsur(nrr);
    const pct = ((nrr - 1) / 3 * 100).toFixed(1);
    return `
      <div class="unsur-card ${currentUnsurIdx === i ? "active" : ""}" onclick="selectUnsur(${i})">
        <div class="unsur-top">
          <span class="unsur-kode">${UNSUR_SKM[i].kode}</span>
          <span class="mutu-badge mutu-${m.grade}" style="font-size:10px">${m.grade}</span>
        </div>
        <div class="unsur-nama">${UNSUR_SKM[i].nama}</div>
        <div class="unsur-score" style="color:${m.color}">${nrr.toFixed(2)}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;background:${m.color}"></div>
        </div>
        <div class="unsur-scale">1 ————— 4</div>
      </div>`;
  }).join("");
}

function selectUnsur(idx) {
  currentUnsurIdx = idx;
  document.querySelectorAll(".unsur-card").forEach((c, i) => c.classList.toggle("active", i === idx));
  const label = document.getElementById("distribusi-label");
  if (label) { label.textContent = UNSUR_SKM[idx].kode; }
  const hasil = Calculator.hitung(Storage.getAllResponden(), currentFilter === "semua" ? null : currentFilter);
  if (hasil) Charts.renderDonutDistribusi("chart-donut", hasil.distribusi[idx], hasil.totalResponden);
}

function renderCharts(hasil) {
  Charts.renderBarUnsur("chart-bar", hasil.nrrPerUnsur);
  Charts.renderDonutDistribusi("chart-donut", hasil.distribusi[currentUnsurIdx], hasil.totalResponden);
  
  // Render Trend Line (dengan fallback jika cache browser belum update)
  if (typeof Storage.getHistoriTren === "function" && typeof Charts.renderLineTrend === "function") {
    const historyData = Storage.getHistoriTren();
    // Override the last null item with the current IKM
    historyData[historyData.length - 1].ikm = parseFloat(hasil.nik.toFixed(2));
    Charts.renderLineTrend("chart-trend", historyData);
  }
}

function renderProfilResponden(responden) {
  const p = Calculator.profilResponden(responden);
  const $ = id => document.getElementById(id);
  if ($("stat-laki"))      $("stat-laki").textContent      = p.jk.L || 0;
  if ($("stat-perempuan")) $("stat-perempuan").textContent = p.jk.P || 0;
  Charts.renderDonutJK("chart-jk", p.jk);
  Charts.renderBarPendidikan("chart-pendidikan", p.pendidikan);
  Charts.renderDonutLayanan("chart-layanan", p.layanan);
}

function renderTindakLanjut(hasil) {
  const tbody = document.getElementById("tbl-tindak-lanjut");
  if (!tbody) return;
  tbody.innerHTML = hasil.rankingUnsur.map((item, rank) => {
    const m = Calculator.getMutuUnsur(item.nrr);
    const prioritas = rank === 0 ? "🔴 Jangka Pendek" : rank <= 2 ? "🟡 Jangka Menengah" : "🟢 Pertahankan";
    return `<tr>
      <td><span class="rank-badge">${rank + 1}</span></td>
      <td><strong>${item.unsur.kode}</strong> — ${item.unsur.nama}</td>
      <td><span style="font-weight:700;color:${m.color};font-size:16px">${item.nrr.toFixed(2)}</span></td>
      <td><span class="mutu-badge mutu-${m.grade}">${m.grade} — ${m.label}</span></td>
      <td style="font-weight:600">${prioritas}</td>
    </tr>`;
  }).join("");
}

function renderSaran(responden) {
  const saranList = Calculator.getSaran(responden);
  const container = document.getElementById("saran-list");
  if (!container) return;
  if (!saranList.length) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:13px">Belum ada saran dari responden.</p>`;
    return;
  }
  container.innerHTML = saranList.map(r => `
    <div class="saran-item">
      <div class="saran-meta">
        <span class="saran-layanan">${r.layanan}</span>
        <span class="saran-date">${r.tanggal}</span>
      </div>
      <p class="saran-text">"${r.saran}"</p>
    </div>`).join("");
}

function setupFilters() {
  const select = document.getElementById("filter-layanan");
  if (!select) return;
  const list = ["semua", ...(typeof LAYANAN_DEMO !== "undefined" ? LAYANAN_DEMO : [])];
  select.innerHTML = list.map(l =>
    `<option value="${l}">${l === "semua" ? "Semua Layanan" : l}</option>`
  ).join("");
  select.addEventListener("change", e => { currentFilter = e.target.value; renderDashboard(); });
}

function animateCounter(id, target, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * e).toFixed(2);
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

function printDashboard() { window.print(); }

document.addEventListener("DOMContentLoaded", init);
