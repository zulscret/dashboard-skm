/**
 * Kalkulator IKM (Indeks Kepuasan Masyarakat)
 * Mengacu pada PermenpanRB No. 14 Tahun 2017
 * Bab V: Langkah-langkah Pengolahan Data
 */

const Calculator = {
  BOBOT: 1 / 9, // 0.1111 — bobot rata-rata tertimbang per unsur (9 unsur)
  NILAI_DASAR: 25,

  /**
   * Hitung rata-rata nilai per unsur dari array responden
   * @param {Array} responden - array responden dengan properti .u (array 9 nilai)
   * @param {string|null} filterLayanan - filter berdasarkan jenis layanan
   * @returns {Object} hasil kalkulasi lengkap
   */
  hitung(responden, filterLayanan = null) {
    let data = responden;
    if (filterLayanan && filterLayanan !== "semua") {
      data = responden.filter((r) => r.layanan === filterLayanan);
    }

    if (data.length === 0) return null;

    const n = data.length;
    const nUnsur = 9;

    // Hitung nilai rata-rata per unsur
    const nrrPerUnsur = Array(nUnsur).fill(0);
    for (const r of data) {
      for (let i = 0; i < nUnsur; i++) {
        nrrPerUnsur[i] += r.u[i];
      }
    }
    for (let i = 0; i < nUnsur; i++) {
      nrrPerUnsur[i] = nrrPerUnsur[i] / n;
    }

    // Hitung distribusi jawaban per unsur (berapa yang jawab 1,2,3,4)
    const distribusi = Array.from({ length: nUnsur }, () => ({ 1: 0, 2: 0, 3: 0, 4: 0 }));
    for (const r of data) {
      for (let i = 0; i < nUnsur; i++) {
        distribusi[i][r.u[i]]++;
      }
    }

    // IKM = Σ (NRR_i × Bobot) untuk semua unsur
    const nilaiIKM = nrrPerUnsur.reduce((sum, nrr) => sum + nrr * this.BOBOT, 0);

    // Nilai Interval Konversi = IKM × 25
    const nik = nilaiIKM * this.NILAI_DASAR;

    // Mutu pelayanan berdasarkan NIK (Tabel II PermenpanRB No. 14/2017)
    const mutu = this.getMutu(nik);

    // Ranking unsur (terendah ke tertinggi — untuk prioritas tindak lanjut)
    const rankingUnsur = nrrPerUnsur
      .map((val, idx) => ({ idx, unsur: UNSUR_SKM[idx], nrr: val }))
      .sort((a, b) => a.nrr - b.nrr);

    return {
      totalResponden: n,
      nrrPerUnsur,
      distribusi,
      nilaiIKM,
      nik: parseFloat(nik.toFixed(2)),
      mutu,
      rankingUnsur,
    };
  },

  /**
   * Mutu pelayanan berdasarkan Nilai Interval Konversi (NIK)
   * Tabel II PermenpanRB No. 14 Tahun 2017
   */
  getMutu(nik) {
    if (nik >= 88.31) return { grade: "A", label: "Sangat Baik", color: "#10b981", bg: "rgba(16,185,129,0.15)" };
    if (nik >= 76.61) return { grade: "B", label: "Baik",        color: "#3b82f6", bg: "rgba(59,130,246,0.15)" };
    if (nik >= 65.00) return { grade: "C", label: "Kurang Baik", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
    return              { grade: "D", label: "Tidak Baik",      color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
  },

  /**
   * Mutu per unsur berdasarkan NRR (skala 1–4)
   */
  getMutuUnsur(nrr) {
    if (nrr >= 3.5324) return { grade: "A", label: "Sangat Baik", color: "#10b981" };
    if (nrr >= 3.0644) return { grade: "B", label: "Baik",        color: "#3b82f6" };
    if (nrr >= 2.60)   return { grade: "C", label: "Kurang Baik", color: "#f59e0b" };
    return              { grade: "D", label: "Tidak Baik",      color: "#ef4444" };
  },

  /** Profil responden: distribusi jenis kelamin, pendidikan, pekerjaan, layanan */
  profilResponden(responden) {
    const jk = { L: 0, P: 0 };
    const pendidikan = {};
    const pekerjaan = {};
    const layanan = {};

    for (const r of responden) {
      jk[r.jk]++;
      pendidikan[r.pendidikan] = (pendidikan[r.pendidikan] || 0) + 1;
      pekerjaan[r.pekerjaan]   = (pekerjaan[r.pekerjaan]   || 0) + 1;
      layanan[r.layanan]       = (layanan[r.layanan]       || 0) + 1;
    }

    return { jk, pendidikan, pekerjaan, layanan };
  },

  /** Saran/masukan dari responden (filter non-empty) */
  getSaran(responden) {
    return responden.filter((r) => r.saran && r.saran.trim() !== "");
  },
};
