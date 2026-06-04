/**
 * Storage Manager — LocalStorage wrapper
 * Menyimpan data responden secara persisten di browser
 */
const Storage = {
  KEY_RESPONDEN: "skm_responden",
  KEY_SURVEY_INFO: "skm_survey_info",
  KEY_MODE: "skm_mode", // "demo" | "live"

  /** Inisialisasi: isi dengan demo data jika kosong */
  init() {
    const mode = localStorage.getItem(this.KEY_MODE);
    if (!mode) {
      this.setDemoMode();
    }
  },

  setDemoMode() {
    localStorage.setItem(this.KEY_MODE, "demo");
    localStorage.setItem(this.KEY_RESPONDEN, JSON.stringify(DEMO_RESPONDEN));
    localStorage.setItem(this.KEY_SURVEY_INFO, JSON.stringify(SURVEY_INFO));
  },

  setLiveMode() {
    localStorage.setItem(this.KEY_MODE, "live");
  },

  getMode() {
    return localStorage.getItem(this.KEY_MODE) || "demo";
  },

  getAllResponden() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_RESPONDEN)) || [];
    } catch {
      return [];
    }
  },

  getSurveyInfo() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_SURVEY_INFO)) || SURVEY_INFO;
    } catch {
      return SURVEY_INFO;
    }
  },

  getHistoriTren() {
    return [
      { periode: "Semester I 2024", ikm: 78.50 },
      { periode: "Semester II 2024", ikm: 80.20 },
      { periode: "Semester I 2025", ikm: null } // The live value will replace this
    ];
  },

  addResponden(responden) {
    const all = this.getAllResponden();
    const newId = all.length > 0 ? Math.max(...all.map((r) => r.id)) + 1 : 1;
    const newEntry = { id: newId, ...responden };
    all.push(newEntry);
    localStorage.setItem(this.KEY_RESPONDEN, JSON.stringify(all));
    return newEntry;
  },

  addBulkResponden(list) {
    const all = this.getAllResponden();
    let nextId = all.length > 0 ? Math.max(...all.map((r) => r.id)) + 1 : 1;
    const added = list.map((r) => ({ id: nextId++, ...r }));
    const merged = [...all, ...added];
    localStorage.setItem(this.KEY_RESPONDEN, JSON.stringify(merged));
    return added.length;
  },

  deleteResponden(id) {
    const all = this.getAllResponden().filter((r) => r.id !== id);
    localStorage.setItem(this.KEY_RESPONDEN, JSON.stringify(all));
  },

  clearAll() {
    localStorage.removeItem(this.KEY_RESPONDEN);
    localStorage.removeItem(this.KEY_SURVEY_INFO);
    localStorage.removeItem(this.KEY_MODE);
  },

  updateSurveyInfo(info) {
    localStorage.setItem(this.KEY_SURVEY_INFO, JSON.stringify(info));
  },
};
