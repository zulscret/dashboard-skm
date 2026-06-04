// Demo Data SKM - Perpustakaan Amir Machmud
// Data dummy realistis untuk demo ke mentor
// u = [u1, u2, u3, u4, u5, u6, u7, u8, u9]  ← urutan PermenpanRB (bukan urutan Jotform)
// PENTING: Di Jotform, Q11=Sarana(U9) dan Q12=Pengaduan(U8) — posisinya terbalik!
// CSV parser akan otomatis swap saat import dari Jotform.

const SURVEY_INFO = {
  unitName: "Perpustakaan Amir Machmud",
  instansi: "Kementerian Dalam Negeri Republik Indonesia",
  npp: "3171014A0000008",
  periode: "Semester I Tahun 2025",
  tanggalMulai: "2025-01-06",
  tanggalSelesai: "2025-06-30",
  dasarHukum: "PermenpanRB No. 14 Tahun 2017",
};

const UNSUR_SKM = [
  { kode: "U1", nama: "Persyaratan", deskripsi: "Kesesuaian persyaratan pelayanan dengan jenis pelayanannya" },
  { kode: "U2", nama: "Sistem, Mekanisme, dan Prosedur", deskripsi: "Kemudahan prosedur pelayanan di unit ini" },
  { kode: "U3", nama: "Waktu Penyelesaian", deskripsi: "Kecepatan waktu dalam memberikan pelayanan" },
  { kode: "U4", nama: "Biaya/Tarif", deskripsi: "Kewajaran biaya/tarif dalam pelayanan" },
  { kode: "U5", nama: "Produk Spesifikasi Jenis Pelayanan", deskripsi: "Kesesuaian produk pelayanan dengan standar yang ditetapkan" },
  { kode: "U6", nama: "Kompetensi Pelaksana", deskripsi: "Kompetensi/kemampuan petugas dalam pelayanan" },
  { kode: "U7", nama: "Perilaku Pelaksana", deskripsi: "Perilaku petugas terkait kesopanan dan keramahan" },
  { kode: "U8", nama: "Penanganan Pengaduan, Saran, dan Masukan", deskripsi: "Penanganan pengaduan pengguna layanan" },
  { kode: "U9", nama: "Sarana dan Prasarana", deskripsi: "Kualitas sarana dan prasarana pelayanan" },
];

// Sesuai pilihan di Jotform Q3 (checkbox multi-select)
const LAYANAN_LIST = [
  "Layanan sirkulasi (Peminjaman/Pengembalian)",
  "Layanan baca buku ditempat",
  "Layanan audio visual",
  "Layanan konsultasi",
  "Layanan baca koran",
  "Layanan majalah tempo",
];

// Label pendek untuk display di dashboard
const LAYANAN_SHORT = {
  "Layanan sirkulasi (Peminjaman/Pengembalian)": "Sirkulasi",
  "Layanan baca buku ditempat": "Baca di Tempat",
  "Layanan audio visual": "Audiovisual",
  "Layanan konsultasi": "Konsultasi",
  "Layanan baca koran": "Baca Koran",
  "Layanan majalah tempo": "Majalah Tempo",
};

// Untuk demo data, pakai label pendek
const LAYANAN_DEMO = ["Sirkulasi", "Baca di Tempat", "Audiovisual", "Konsultasi", "Baca Koran", "Majalah Tempo"];

// 35 Responden dummy
// Format: { id, tanggal, jam(1=pagi/2=siang), jk, usia, pendidikan, pekerjaan, layanan, u:[1-4 x9], saran }
const DEMO_RESPONDEN = [
  { id:1,  tanggal:"2025-01-13", jam:1, jk:"L", usia:25, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[3,3,3,4,3,3,4,3,3], saran:"" },
  { id:2,  tanggal:"2025-01-20", jam:2, jk:"P", usia:31, pendidikan:"S2",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[4,3,3,4,4,4,4,3,3], saran:"Pelayanan sudah cukup baik" },
  { id:3,  tanggal:"2025-01-27", jam:1, jk:"L", usia:22, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Baca di Tempat",     u:[3,3,2,4,3,3,3,2,3], saran:"Ruang baca perlu diperluas" },
  { id:4,  tanggal:"2025-02-03", jam:1, jk:"P", usia:28, pendidikan:"S1",  pekerjaan:"Swasta",    layanan:"Layanan Audiovisual",u:[3,3,3,4,3,4,4,3,3], saran:"" },
  { id:5,  tanggal:"2025-02-10", jam:2, jk:"L", usia:45, pendidikan:"S2",  pekerjaan:"PNS",       layanan:"Konsultasi",         u:[4,4,3,4,4,4,4,4,4], saran:"Sangat puas dengan pelayanan konsultasi" },
  { id:6,  tanggal:"2025-02-17", jam:1, jk:"P", usia:35, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[3,3,3,4,3,3,4,3,3], saran:"" },
  { id:7,  tanggal:"2025-02-24", jam:1, jk:"L", usia:19, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Baca di Tempat",     u:[3,2,3,4,3,3,3,2,3], saran:"Koleksi buku perlu ditambah, terutama buku politik" },
  { id:8,  tanggal:"2025-03-03", jam:2, jk:"P", usia:42, pendidikan:"S1",  pekerjaan:"Swasta",    layanan:"Layanan Audiovisual",u:[4,3,3,4,4,3,4,3,3], saran:"" },
  { id:9,  tanggal:"2025-03-10", jam:1, jk:"L", usia:27, pendidikan:"D3",  pekerjaan:"Swasta",    layanan:"Sirkulasi",          u:[3,3,3,4,3,3,3,2,3], saran:"" },
  { id:10, tanggal:"2025-03-17", jam:2, jk:"P", usia:33, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Baca di Tempat",     u:[4,4,4,4,4,4,4,3,4], saran:"Semua sangat memuaskan" },
  { id:11, tanggal:"2025-03-24", jam:1, jk:"L", usia:24, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Sirkulasi",          u:[3,3,2,4,3,3,3,2,2], saran:"Prosedur peminjaman bisa dibuat lebih mudah" },
  { id:12, tanggal:"2025-03-31", jam:2, jk:"P", usia:38, pendidikan:"S2",  pekerjaan:"PNS",       layanan:"Konsultasi",         u:[4,3,3,4,4,4,4,4,4], saran:"" },
  { id:13, tanggal:"2025-04-07", jam:1, jk:"L", usia:29, pendidikan:"S1",  pekerjaan:"Wirausaha", layanan:"Baca di Tempat",     u:[3,3,3,4,3,3,4,3,3], saran:"" },
  { id:14, tanggal:"2025-04-14", jam:1, jk:"P", usia:21, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Layanan Audiovisual",u:[3,3,3,4,3,3,3,2,3], saran:"AC di ruang audiovisual kurang dingin" },
  { id:15, tanggal:"2025-04-21", jam:2, jk:"L", usia:47, pendidikan:"S2",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[4,4,3,4,3,4,4,3,3], saran:"" },
  { id:16, tanggal:"2025-04-28", jam:1, jk:"P", usia:26, pendidikan:"D3",  pekerjaan:"Swasta",    layanan:"Baca di Tempat",     u:[3,3,3,4,3,3,3,3,3], saran:"" },
  { id:17, tanggal:"2025-05-05", jam:1, jk:"L", usia:32, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Layanan Audiovisual",u:[3,3,3,4,3,3,4,3,3], saran:"" },
  { id:18, tanggal:"2025-05-12", jam:2, jk:"P", usia:41, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[4,3,4,4,4,4,4,3,4], saran:"Terus pertahankan kualitas pelayanan" },
  { id:19, tanggal:"2025-05-19", jam:1, jk:"L", usia:23, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Konsultasi",         u:[3,3,3,4,3,3,3,3,3], saran:"" },
  { id:20, tanggal:"2025-05-26", jam:2, jk:"P", usia:36, pendidikan:"S2",  pekerjaan:"Swasta",    layanan:"Baca di Tempat",     u:[4,4,3,4,4,4,4,3,3], saran:"" },
  { id:21, tanggal:"2025-06-02", jam:1, jk:"L", usia:28, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[3,3,3,4,3,4,4,3,3], saran:"" },
  { id:22, tanggal:"2025-06-09", jam:1, jk:"P", usia:30, pendidikan:"D3",  pekerjaan:"Swasta",    layanan:"Layanan Audiovisual",u:[3,3,2,4,3,3,3,2,3], saran:"Peralatan audiovisual perlu diperbarui" },
  { id:23, tanggal:"2025-06-16", jam:2, jk:"L", usia:55, pendidikan:"S2",  pekerjaan:"PNS",       layanan:"Konsultasi",         u:[4,4,4,4,4,4,4,4,4], saran:"Layanan terbaik yang pernah saya gunakan" },
  { id:24, tanggal:"2025-06-16", jam:1, jk:"P", usia:25, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Baca di Tempat",     u:[3,3,3,4,3,3,3,2,3], saran:"" },
  { id:25, tanggal:"2025-06-16", jam:2, jk:"L", usia:39, pendidikan:"S2",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[4,3,3,4,4,3,4,3,3], saran:"" },
  { id:26, tanggal:"2025-06-17", jam:1, jk:"P", usia:27, pendidikan:"S1",  pekerjaan:"Swasta",    layanan:"Layanan Audiovisual",u:[3,3,3,4,3,3,4,3,3], saran:"" },
  { id:27, tanggal:"2025-06-17", jam:1, jk:"L", usia:34, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Baca di Tempat",     u:[3,3,3,4,3,3,4,3,3], saran:"" },
  { id:28, tanggal:"2025-06-23", jam:1, jk:"P", usia:22, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Sirkulasi",          u:[3,2,2,4,3,3,3,1,2], saran:"Kotak saran tidak berfungsi, perlu diperbaiki" },
  { id:29, tanggal:"2025-06-23", jam:2, jk:"L", usia:43, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Baca di Tempat",     u:[4,4,3,4,4,4,4,3,4], saran:"" },
  { id:30, tanggal:"2025-06-23", jam:1, jk:"P", usia:31, pendidikan:"D3",  pekerjaan:"Wirausaha", layanan:"Layanan Audiovisual",u:[3,3,3,4,3,3,4,3,3], saran:"" },
  { id:31, tanggal:"2025-06-24", jam:1, jk:"L", usia:26, pendidikan:"D3",  pekerjaan:"Swasta",    layanan:"Sirkulasi",          u:[3,3,3,4,3,3,3,3,3], saran:"" },
  { id:32, tanggal:"2025-06-24", jam:2, jk:"P", usia:48, pendidikan:"S1",  pekerjaan:"PNS",       layanan:"Konsultasi",         u:[4,3,3,4,4,4,4,4,3], saran:"" },
  { id:33, tanggal:"2025-06-24", jam:1, jk:"L", usia:20, pendidikan:"SMA", pekerjaan:"Mahasiswa", layanan:"Baca di Tempat",     u:[3,3,3,4,3,3,3,1,3], saran:"Perlu ada mekanisme pengaduan yang jelas" },
  { id:34, tanggal:"2025-06-30", jam:2, jk:"P", usia:37, pendidikan:"S2",  pekerjaan:"PNS",       layanan:"Sirkulasi",          u:[4,4,4,4,4,4,4,3,4], saran:"" },
  { id:35, tanggal:"2025-06-30", jam:1, jk:"L", usia:29, pendidikan:"S1",  pekerjaan:"Wirausaha", layanan:"Layanan Audiovisual",u:[3,3,3,4,3,3,4,3,3], saran:"" },
];
