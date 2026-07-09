/**
 * Konfigurasi Terpusat untuk Logika Fuzzy Irigasi.
 * Dengan memisahkan konfigurasi dari logika, kita dapat dengan mudah
 * menyesuaikan (tuning) parameter dan aturan tanpa mengubah kode service.
 */

type MembershipPoints = [number, number, number, number];
type FuzzySetDefinition = MembershipPoints | string;

const inputs: Record<string, Record<string, FuzzySetDefinition>> = {
  suhuTanah: {
    Dingin: [0, 0, 15, 21] as MembershipPoints,
    Ideal: [15, 21, 21, 27] as MembershipPoints,
    Panas: [21, 27, 50, 50] as MembershipPoints,
  },
  kelembapanTanah: {
    Kering: [0, 0, 40, 50] as MembershipPoints,
    Ideal: [40, 50, 50, 60] as MembershipPoints,
    Lembap: [50, 60, 100, 100] as MembershipPoints,
  },
  cuaca: {
    Cerah: 'Cerah',
    Hujan: 'Hujan',
  },
};

const outputs = {
  durasiPenyiraman: {
    // Nilai tegas (Zi) dalam DETIK sesuai laporan
    Sedikit: 90,
    Sedang: 210,
    Banyak: 300,
  },
};

const rules = [
  // 18 aturan fuzzy: 3 kelembapan tanah × 3 suhu tanah × 2 cuaca
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Dingin', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Sedang' }, comment: 'R1 - Kering, Dingin, Cerah => Siram Sedang' },
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Ideal', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Banyak' }, comment: 'R2 - Kering, Ideal, Cerah => Siram Banyak' },
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Panas', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Banyak' }, comment: 'R3 - Kering, Panas, Cerah => Siram Banyak' },
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Dingin', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R4 - Kering, Dingin, Hujan => Siram Sedikit' },
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Ideal', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R5 - Kering, Ideal, Hujan => Siram Sedikit' },
  { if: { kelembapanTanah: 'Kering', suhuTanah: 'Panas', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedang' }, comment: 'R6 - Kering, Panas, Hujan => Siram Sedang' },

  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Dingin', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R7 - Ideal, Dingin, Cerah => Siram Sedikit' },
  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Ideal', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Sedang' }, comment: 'R8 - Ideal, Ideal, Cerah => Siram Sedang' },
  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Panas', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Banyak' }, comment: 'R9 - Ideal, Panas, Cerah => Siram Banyak' },
  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Dingin', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R10 - Ideal, Dingin, Hujan => Siram Sedikit' },
  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Ideal', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R11 - Ideal, Ideal, Hujan => Siram Sedikit' },
  { if: { kelembapanTanah: 'Ideal', suhuTanah: 'Panas', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R12 - Ideal, Panas, Hujan => Siram Sedikit' },

  { if: { kelembapanTanah: 'Lembap', suhuTanah: 'Dingin', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R13 - Lembap, Dingin, Cerah => Siram Sedikit' },
  { if: { kelembapanTanah: 'Lembap', suhuTanah: 'Ideal', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R14 - Lembap, Ideal, Cerah => Siram Sedikit' },
  { if: { kelembapanTanah: 'Lembap', suhuTanah: 'Panas', cuaca: 'Cerah' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R15 - Lembap, Panas, Cerah => Siram Sedikit' },
  { if: { kelembapanTanah: 'Lembap', suhuTanah: 'Dingin', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R16 - Lembap, Dingin, Hujan => Siram Sedikit' },
  { if: { kelembapanTanah: 'Lembap', suhuTanah: 'Ideal', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R17 - Lembap, Ideal, Hujan => Siram Sedikit' },
  { if: { kelembapanTanah: 'Lembap', suhuTanah: 'Panas', cuaca: 'Hujan' }, then: { durasiPenyiraman: 'Sedikit' }, comment: 'R18 - Lembap, Panas, Hujan => Siram Sedikit' },
];

export const irrigationFuzzyConfig = {
  inputs,
  outputs,
  rules,
  executionGate: {
    minimumEffectiveDuration: 10, // Hanya siram jika durasi > 10 detik
  }
};
