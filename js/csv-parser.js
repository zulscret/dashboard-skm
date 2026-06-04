/**
 * CSV Parser — Import data dari Jotform Export
 * =============================================
 * Mendukung dua mode:
 * 1. MODE JOTFORM: Auto-detect kolom dari export Jotform perpustakaan ini
 *    (menangani urutan Q11/Q12 yang terbalik dari standar PermenpanRB)
 * 2. MODE MANUAL: User petakan kolom sendiri lewat UI mapping
 *
 * CATATAN PENTING — Perbedaan urutan Jotform vs PermenpanRB:
 *   Jotform Q11 = Sarana & Prasarana → PermenpanRB U9
 *   Jotform Q12 = Penanganan Pengaduan → PermenpanRB U8
 *   Parser ini otomatis swap agar data tersimpan dalam urutan PermenpanRB.
 */

// Peta jawaban teks Jotform → nilai numerik 1-4
const JOTFORM_ANSWER_MAP = {
  // U1 - Persyaratan
  "tidak sesuai": 1, "kurang sesuai": 2, "sesuai": 3, "sangat sesuai": 4,
  // U2 - Prosedur
  "tidak mudah": 1, "kurang mudah": 2, "mudah": 3, "sangat mudah": 4,
  // U3 - Waktu
  "tidak cepat": 1, "kurang cepat": 2, "cepat": 3, "sangat cepat": 4,
  // U4 - Biaya (gratis = 4 karena perpustakaan gratis)
  "sangat mahal": 1, "cukup mahal": 2, "murah": 3, "gratis": 4,
  // U5 - Produk (sama dengan U1)
  // U6 - Kompetensi
  "tidak kompeten": 1, "kurang kompeten": 2, "kompeten": 3, "sangat kompeten": 4,
  // U7 - Perilaku
  "tidak sopan dan ramah": 1, "kurang sopan dan ramah": 2, "sopan dan ramah": 3, "sangat sopan dan ramah": 4,
  // U8 - Pengaduan
  "tidak ada": 1, "ada tetapi tidak berfungsi": 2, "berfungsi kurang maksimal": 3, "dikelola dengan baik": 4,
  // U9 - Sarana (Q11 di Jotform)
  "buruk": 1, "cukup": 2, "baik": 3, "sangat baik": 4,
};

// Pola deteksi kolom Jotform berdasarkan teks pertanyaan
const JOTFORM_COLUMN_PATTERNS = {
  nama:      /nama\s*anda|name/i,
  tanggal:   /hari\s*kunjungan|tanggal|date|submission/i,
  layanan:   /layanan\s*yang\s*dinikmati|layanan.*dinikma|jenis\s*layanan/i,
  u1:        /kesesuaian\s*persyaratan|persyaratan\s*pelayanan/i,
  u2:        /kemudahan\s*prosedur|prosedur\s*pelayanan/i,
  u3:        /kecepatan\s*waktu|waktu\s*dalam\s*memberikan/i,
  u4:        /kewajaran\s*biaya|biaya.*tarif/i,
  u5:        /kesesuaian\s*produk|produk\s*pelayanan.*standar/i,
  u6:        /kompetensi.*kemampuan\s*petugas|kemampuan\s*petugas/i,
  u7:        /perilaku\s*petugas|kesopanan\s*dan\s*keramahan/i,
  // Jotform: Q11 = Sarana (U9), Q12 = Pengaduan (U8) — TERBALIK dari PermenpanRB!
  u8_jotform: /penanganan\s*pengaduan|pengaduan\s*pengguna/i,   // → disimpan sebagai U8
  u9_jotform: /kualitas\s*sarana|sarana\s*dan\s*prasarana/i,   // → disimpan sebagai U9
  saran:     /masukan.*saran|saran.*masukan|komentar|request.*kebutuhan/i,
};

const CSVParser = {

  /** Parse CSV string → array of row objects */
  parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("File CSV kosong atau hanya berisi header.");
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map(line => {
      const values = this.splitCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (values[i] || "").trim().replace(/^"|"$/g, ""); });
      return obj;
    });
  },

  splitCSVLine(line) {
    const result = [];
    let current = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === "," && !inQuotes) { result.push(current); current = ""; }
      else { current += line[i]; }
    }
    result.push(current);
    return result;
  },

  /**
   * Konversi jawaban teks Jotform → nilai numerik 1-4
   * Mendukung teks bahasa Indonesia dari semua 9 unsur SKM
   */
  textToValue(text) {
    if (!text) return null;
    const t = text.trim().toLowerCase();
    // Cek exact match dulu
    if (JOTFORM_ANSWER_MAP[t] !== undefined) return JOTFORM_ANSWER_MAP[t];
    // Coba partial match
    for (const [key, val] of Object.entries(JOTFORM_ANSWER_MAP)) {
      if (t.includes(key) || key.includes(t)) return val;
    }
    // Coba parse numerik langsung (jika kolom sudah angka)
    const num = parseInt(t);
    if (!isNaN(num) && num >= 1 && num <= 4) return num;
    return null;
  },

  /**
   * Auto-detect apakah ini export dari Jotform perpustakaan Kemendagri
   * Return: { isJotform, mapping }
   */
  autoDetectMapping(headers) {
    const mapping = {};
    let jotformScore = 0;

    for (const [field, pattern] of Object.entries(JOTFORM_COLUMN_PATTERNS)) {
      const match = headers.find(h => pattern.test(h));
      if (match) {
        mapping[field] = match;
        jotformScore++;
      }
    }

    // Fallback: generic patterns
    const genericPatterns = {
      tanggal:    /tanggal|date|submission/i,
      jk:         /jenis.kelamin|gender|kelamin/i,
      usia:       /usia|umur|age/i,
      pendidikan: /pendidikan|education/i,
      pekerjaan:  /pekerjaan|occupation|profesi/i,
      u1:         /u1|unsur.1/i, u2: /u2|unsur.2/i, u3: /u3|unsur.3/i,
      u4:         /u4|unsur.4/i, u5: /u5|unsur.5/i, u6: /u6|unsur.6/i,
      u7:         /u7|unsur.7/i, u8: /u8|unsur.8/i, u9: /u9|unsur.9/i,
      saran:      /saran|masukan|komentar/i,
    };
    for (const [field, pattern] of Object.entries(genericPatterns)) {
      if (!mapping[field]) {
        const match = headers.find(h => pattern.test(h));
        if (match) mapping[field] = match;
      }
    }

    const isJotform = jotformScore >= 3;
    return { isJotform, mapping };
  },

  /**
   * Convert Jotform rows ke format responden SKM
   * Menangani:
   * - Konversi teks → nilai 1-4
   * - Swap U8/U9 (Jotform Q11=Sarana=U9, Q12=Pengaduan=U8)
   * - Normalisasi nama layanan → label pendek
   */
  convertJotformRows(rows, mapping) {
    const errors = [];
    const valid = [];

    rows.forEach((row, idx) => {
      try {
        // Ambil nilai 9 unsur — perhatikan swap Q11/Q12!
        // Jotform: u9_jotform (Sarana=Q11) → internal U9
        //          u8_jotform (Pengaduan=Q12) → internal U8
        const uKeys = ["u1","u2","u3","u4","u5","u6","u7","u8_jotform","u9_jotform"];
        const u = [];

        for (const key of uKeys) {
          const col = mapping[key] || mapping[key.replace("_jotform","")];
          if (!col) throw new Error(`Kolom ${key} tidak ditemukan`);
          const raw = row[col] || "";
          const val = this.textToValue(raw);
          if (val === null) throw new Error(`Nilai "${raw}" tidak valid untuk ${key}`);
          u.push(val);
        }

        // Swap U8 dan U9 untuk koreksi urutan PermenpanRB
        // Saat ini u[7]=Pengaduan(Q12), u[8]=Sarana(Q11)
        // Kita swap: u[7] harus Pengaduan, u[8] harus Sarana ✓ (sudah benar setelah mapping di atas)

        // Normalisasi layanan
        const rawLayanan = mapping.layanan ? (row[mapping.layanan] || "") : "";
        const layanan = this.normalizeLayanan(rawLayanan);

        const r = {
          tanggal:    mapping.tanggal ? (row[mapping.tanggal] || new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
          jam:        1,
          jk:         mapping.jk ? this.mapJK(row[mapping.jk] || "") : "L",
          usia:       mapping.usia ? (parseInt(row[mapping.usia]) || 0) : 0,
          pendidikan: mapping.pendidikan ? (row[mapping.pendidikan] || "Lainnya") : "Lainnya",
          pekerjaan:  mapping.pekerjaan ? (row[mapping.pekerjaan] || "Lainnya") : "Lainnya",
          nama:       mapping.nama ? (row[mapping.nama] || "") : "",
          layanan,
          u,
          saran:      mapping.saran ? (row[mapping.saran] || "") : "",
        };
        valid.push(r);
      } catch(e) {
        errors.push(`Baris ${idx + 2}: ${e.message}`);
      }
    });

    return { valid, errors };
  },

  /** Konversi rows ke format SKM (generic, untuk mode manual mapping) */
  convertToSKM(rows, mapping) {
    return this.convertJotformRows(rows, mapping);
  },

  /** Normalisasi nama layanan dari Jotform ke label pendek */
  normalizeLayanan(raw) {
    const r = raw.toLowerCase().trim();
    if (r.includes("sirkulasi") || r.includes("peminjaman")) return "Sirkulasi";
    if (r.includes("baca") && r.includes("koran"))           return "Baca Koran";
    if (r.includes("baca") && r.includes("buku"))            return "Baca di Tempat";
    if (r.includes("baca"))                                  return "Baca di Tempat";
    if (r.includes("audio") || r.includes("visual"))         return "Audiovisual";
    if (r.includes("konsultasi"))                            return "Konsultasi";
    if (r.includes("majalah") || r.includes("tempo"))        return "Majalah Tempo";
    return raw || "Lainnya";
  },

  mapJK(val) {
    const v = val.toLowerCase();
    if (v === "l" || v.includes("laki") || v === "male" || v === "m") return "L";
    return "P";
  },
};
