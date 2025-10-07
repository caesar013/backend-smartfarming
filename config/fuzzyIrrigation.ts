/**
 * Konfigurasi Terpusat untuk Logika Fuzzy Irigasi.
 * Dengan memisahkan konfigurasi dari logika, kita dapat dengan mudah
 * menyesuaikan (tuning) parameter dan aturan tanpa mengubah kode service.
 */

type MembershipPoints = [number, number, number, number];

const inputs = {
  // Variabel 'suhuTanah' (sebelumnya suhuUdara)
  suhuTanah: { // <-- GANTI NAMA VARIABEL
    // Rentang ideal 15-27°C, dengan puncak di 21°C
    Sejuk: [0, 0, 15, 21] as MembershipPoints,
    Ideal: [15, 21, 21, 27] as MembershipPoints,
    Panas: [21, 27, 50, 50] as MembershipPoints, // Asumsi batas atas 50°C
  },
  kelembapanTanah: {
    Kering: [0, 0, 40, 50] as MembershipPoints,
    Ideal: [40, 50, 50, 60] as MembershipPoints,
    Basah: [50, 60, 100, 100] as MembershipPoints,
  },
};

const outputs = {
  durasiPenyiraman: {
    Tidak_Siram: 0,
    // Nilai dalam DETIK
    Sedikit: 30,  // 0.5 menit * 60 detik
    Sedang: 60, // 1 menit * 60 detik
    Lama: 90,    // 1.5 menit * 60 detik
  },
};

const rules = [
  // Aturan sekarang menggunakan 'suhuTanah'
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Sejuk' }, then: { durasiPenyiraman: 'Sedikit' }, comment: "Tanah kering tapi sejuk, siram sedikit saja." },
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Ideal' }, then: { durasiPenyiraman: 'Sedang' }, comment: "Kondisi ideal untuk penguapan, siram sedang." },
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Panas' }, then: { durasiPenyiraman: 'Lama' }, comment: "Kondisi paling butuh air, siram banyak." },

  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Sejuk' }, then: { durasiPenyiraman: 'Tidak_Siram' }, comment: "Kondisi ideal, tidak perlu siram." },
  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Ideal' }, then: { durasiPenyiraman: 'Tidak_Siram' }, comment: "Kondisi sempurna, tidak perlu siram." },
  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Panas' }, then: { durasiPenyiraman: 'Sedikit' }, comment: "Tanah ideal tapi panas, antisipasi penguapan dengan siram sedikit." }, // Diubah ke 'Sedikit' agar lebih logis

  { if: { kelembapanTanah: 'Basah' }, then: { durasiPenyiraman: 'Tidak_Siram' }, comment: "Jika tanah sudah basah, jangan pernah siram." },
];

export const irrigationFuzzyConfig = {
  inputs,
  outputs,
  rules,
  executionGate: {
    minimumEffectiveDuration: 10, // Hanya siram jika durasi > 10 detik
  }
};
