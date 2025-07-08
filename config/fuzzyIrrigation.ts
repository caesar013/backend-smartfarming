/**
 * Konfigurasi Terpusat untuk Logika Fuzzy Irigasi.
 * Dengan memisahkan konfigurasi dari logika, kita dapat dengan mudah
 * menyesuaikan (tuning) parameter dan aturan tanpa mengubah kode service.
 */

// Definisikan tipe untuk meningkatkan type-safety dan autocompletion.
type MembershipPoints = [number, number, number, number];

// Konfigurasi untuk variabel input (Sensor)
const inputs = {
  // Variabel 'suhuUdara'
  suhuUdara: {
    Sejuk: [0, 0, 20, 22.5] as MembershipPoints,
    Ideal: [20, 22.5, 22.5, 25] as MembershipPoints,
    Panas: [22.5, 25, 50, 50] as MembershipPoints,
  },
  // Variabel 'kelembapanTanah'
  kelembapanTanah: {
    Kering: [0, 0, 40, 50] as MembershipPoints,
    Ideal: [40, 50, 50, 60] as MembershipPoints,
    Basah: [50, 60, 100, 100] as MembershipPoints,
  },
};

// Konfigurasi untuk variabel output (Durasi Pompa)
const outputs = {
  // Variabel 'durasiPenyiraman'
  durasiPenyiraman: {
    Tidak_Siram: 0,   // detik
    Sedikit: 60, // 1.5 menit
    // Sedikit: 150, // 1.5 menit
    Sedang: 65, // 3.5 menit
    // Sedang: 210, // 3.5 menit
    // Banyak: 300, // 5 menit
    Banyak: 67, // 5 menit
  },
};

// Definisi Aturan (Rule Base)
// Ini adalah jantung dari "rule engine" dinamis.
// Setiap objek merepresentasikan satu aturan "IF ... THEN ...".
const rules = [
  // Format: { if: { kondisi_1, kondisi_2, ... }, then: { kesimpulan } }
  { if: { kelembapanTanah: 'Kering', suhuUdara: 'Sejuk' }, then: { durasiPenyiraman: 'Sedikit' }, comment: "Tanah kering tapi udara sejuk, siram sedikit saja." },
  { if: { kelembapanTanah: 'Kering', suhuUdara: 'Ideal' }, then: { durasiPenyiraman: 'Sedang' }, comment: "Kondisi ideal untuk penguapan, siram sedang." },
  { if: { kelembapanTanah: 'Kering', suhuUdara: 'Panas' }, then: { durasiPenyiraman: 'Banyak' }, comment: "Kondisi paling butuh air, siram banyak." },

  { if: { kelembapanTanah: 'Ideal', suhuUdara: 'Sejuk' }, then: { durasiPenyiraman: 'Tidak_Siram' }, comment: "Kondisi ideal, tidak perlu siram." },
  { if: { kelembapanTanah: 'Ideal', suhuUdara: 'Ideal' }, then: { durasiPenyiraman: 'Tidak_Siram' }, comment: "Kondisi sempurna, tidak perlu siram." },
  { if: { kelembapanTanah: 'Ideal', suhuUdara: 'Panas' }, then: { durasiPenyiraman: 'Sedang' }, comment: "Tanah ideal tapi udara panas, antisipasi penguapan dengan siram sedang." },

  // Aturan ini hanya punya satu kondisi, engine akan menanganinya secara otomatis.
  { if: { kelembapanTanah: 'Basah' }, then: { durasiPenyiraman: 'Tidak_Siram' }, comment: "Jika tanah sudah basah, jangan pernah siram." },
];


// Gabungkan semua konfigurasi menjadi satu objek untuk diekspor.
export const irrigationFuzzyConfig = {
  inputs,
  outputs,
  rules,
  // Gerbang eksekusi juga bisa dikonfigurasi di sini
  executionGate: {
    minimumEffectiveDuration: 60, // Hanya siram jika durasi > 1 menit
  }
};
