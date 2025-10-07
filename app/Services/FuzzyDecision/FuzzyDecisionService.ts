// app/Services/FuzzyDecisionService.ts

// Definisikan struktur untuk parameter input
interface TargetParams {
  minSoilEc: number;
  maxSoilEc: number;
  minSoilHumidity: number;
  maxSoilHumidity: number;
  minPh: number;
  maxPh: number;
}

interface ActualReadings {
  soilConductivity: number;
  soilHumidity: number;
  soilPh: number;
}

interface FuzzifiedHumidity {
  Kering: number;
  Lembap: number;
  Basah: number;
}

interface FuzzifiedEc {
  Terlalu_Rendah: number;
  Rendah: number;
  Sesuai: number;
  Tinggi: number;
}

interface FuzzifiedPh {
  Terlalu_Asam: number;
  Asam: number;
  Ideal: number;
  Basa: number;
  Terlalu_Basa: number;
}

// Definisikan struktur untuk output dari setiap aturan
type RuleOutput = {
  alpha: number; // Kekuatan aktivasi aturan (0-1)
  z: number;     // Nilai output tegas dari aturan
};

// Definisikan struktur untuk hasil akhir fuzzy
export interface FuzzyResult {
  pumpDuration: number;
  phRecommendation: 'Aman' | 'Perlu pH Up' | 'Perlu pH Down';
}

/**

  * Layanan mandiri untuk melakukan kalkulasi logika fuzzy Tsukamoto.
  * Dirancang khusus untuk sistem otomasi nutrisi tanaman stroberi.
    */
export default class FuzzyDecisionService {

  // =================================================================================
  // --- BAGIAN 1: FUZZIFIKASI ---
  // =================================================================================

  private getMembership(x: number, points: [number, number, number, number]): number {
    const [a, b, c, d] = points;
    // Perbaikan logika untuk menangani nilai tepat di tepi
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
  }

  // Fuzzifikasi untuk Error Kelembapan Tanah
  private fuzzifyHumidityError(error: number) {
    return {
      Kering: this.getMembership(error, [-20, -20, -10, -5]),
      Lembap: this.getMembership(error, [-10, -5, 5, 10]),
      Basah: this.getMembership(error, [5, 10, 20, 20]),
    };
  }

  // Fuzzifikasi untuk Error EC (Nutrisi)
  private fuzzifyEcError(error: number) {
    return {
      Terlalu_Rendah: this.getMembership(error, [-1000, -1000, -350, -150]),
      Rendah: this.getMembership(error, [-250, -150, -100, 0]),
      Sesuai: this.getMembership(error, [-100, 0, 100, 200]),
      Tinggi: this.getMembership(error, [150, 250, 500, 500]),
    };
  }

  // Fuzzifikasi untuk Error pH Tanah
  private fuzzifyPhError(error: number) {
    return {
      Terlalu_Asam: this.getMembership(error, [-2.5, -2.5, -1.8, -1.2]),
      Asam: this.getMembership(error, [-1.5, -1.0, -0.6, -0.2]),
      Ideal: this.getMembership(error, [-0.6, -0.2, 0.2, 0.6]),
      Basa: this.getMembership(error, [0.2, 0.5, 1.0, 1.5]),
      Terlalu_Basa: this.getMembership(error, [1.2, 1.8, 2.5, 2.5]),
    };
  }

  // =================================================================================
  // --- BAGIAN 2: INFERENSI (EVALUASI ATURAN) ---
  // =================================================================================

  private applyRules(
    fuzzifiedHumidity: FuzzifiedHumidity,
    fuzzifiedEc: FuzzifiedEc,
    fuzzifiedPh: FuzzifiedPh
  ): { pumpRules: RuleOutput[], phRules: RuleOutput[] } {
    const pumpRules: RuleOutput[] = [];
    const phRules: RuleOutput[] = [];

    // Nilai output tegas (z) untuk setiap variabel linguistik, sesuai laporan
    const pumpOutput = { Mati: 0, Singkat: 20, Sedang: 50, Lama: 80 };
    const phOutput = { Perlu_pH_Up: 1, Aman: 0, Perlu_pH_Down: -1 };

    let alpha = 0;

    // --- Aturan untuk Durasi Pompa (Sesuai Revisi) ---

    // [R1] IF pH IS Terlalu Asam OR Kelembapan IS Basah OR EC IS Tinggi THEN Durasi IS Mati.
    alpha = Math.max(fuzzifiedPh.Terlalu_Asam, fuzzifiedHumidity.Basah, fuzzifiedEc.Tinggi);
    if (alpha > 0) pumpRules.push({ alpha, z: pumpOutput.Mati });

    // [R2] IF (pH IS Asam OR pH IS Basa) AND (EC IS Rendah OR EC IS Terlalu Rendah) THEN Durasi IS Singkat
    const phAsamAtauBasa = Math.max(fuzzifiedPh.Asam, fuzzifiedPh.Basa);
    const ecRendahAtauSangatRendah = Math.max(fuzzifiedEc.Rendah, fuzzifiedEc.Terlalu_Rendah);
    alpha = Math.min(phAsamAtauBasa, ecRendahAtauSangatRendah);
    if (alpha > 0) pumpRules.push({ alpha, z: pumpOutput.Singkat });

    // [R3] IF pH IS Ideal AND EC IS Sesuai AND Kelembapan IS Lembap THEN Durasi IS Mati.
    alpha = Math.min(fuzzifiedPh.Ideal, fuzzifiedEc.Sesuai, fuzzifiedHumidity.Lembap);
    if (alpha > 0) pumpRules.push({ alpha, z: pumpOutput.Mati });

    // [R4] IF pH IS Ideal AND EC IS Sesuai AND Kelembapan IS Kering THEN Durasi IS Singkat.
    alpha = Math.min(fuzzifiedPh.Ideal, fuzzifiedEc.Sesuai, fuzzifiedHumidity.Kering);
    if (alpha > 0) pumpRules.push({ alpha, z: pumpOutput.Singkat });

    // [R5] IF pH IS Ideal AND EC IS Rendah AND (Kelembapan IS Kering OR Kelembapan IS Lembap) THEN Durasi IS Sedang.
    const kelembapanKeringAtauLembap = Math.max(fuzzifiedHumidity.Kering, fuzzifiedHumidity.Lembap);
    alpha = Math.min(fuzzifiedPh.Ideal, fuzzifiedEc.Rendah, kelembapanKeringAtauLembap);
    if (alpha > 0) pumpRules.push({ alpha, z: pumpOutput.Sedang });

    // [R6] IF pH IS Ideal AND EC IS Terlalu Rendah AND (Kelembapan IS Kering OR Kelembapan IS Lembap) THEN Durasi IS Lama.
    alpha = Math.min(fuzzifiedPh.Ideal, fuzzifiedEc.Terlalu_Rendah, kelembapanKeringAtauLembap);
    if (alpha > 0) pumpRules.push({ alpha, z: pumpOutput.Lama });

    // --- Aturan untuk Rekomendasi pH (Diperbarui dengan 'Terlalu Basa') ---
    // Jika pH terlalu asam atau asam, perlu pH Up
    alpha = Math.max(fuzzifiedPh.Terlalu_Asam, fuzzifiedPh.Asam);
    if (alpha > 0) phRules.push({ alpha, z: phOutput.Perlu_pH_Up });

    // Jika pH basa atau terlalu basa, perlu pH Down
    alpha = Math.max(fuzzifiedPh.Basa, fuzzifiedPh.Terlalu_Basa);
    if (alpha > 0) phRules.push({ alpha, z: phOutput.Perlu_pH_Down });

    // Jika tidak ada aturan pH yang aktif, berarti pH Aman
    if (phRules.length === 0) {
      phRules.push({ alpha: 1, z: phOutput.Aman });
    }

    return { pumpRules, phRules };


  }

  // =================================================================================
  // --- BAGIAN 3: DEFUZZIFIKASI ---
  // =================================================================================

  private defuzzify(ruleOutputs: RuleOutput[]): number {
    if (ruleOutputs.length === 0) return 0;

    let numerator = 0;   // Σ(alpha * z)
    let denominator = 0; // Σ(alpha)

    for (const rule of ruleOutputs) {
      numerator += rule.alpha * rule.z;
      denominator += rule.alpha;
    }

    return denominator === 0 ? 0 : numerator / denominator;


  }

  // =================================================================================
  // --- METODE UTAMA (PUBLIC) ---
  // =================================================================================

  public calculateDecision(target: TargetParams, actual: ActualReadings): FuzzyResult {
    // Validate inputs
    if (target.minSoilHumidity > target.maxSoilHumidity) throw new Error("Invalid humidity range");
    if (target.minSoilEc > target.maxSoilEc) throw new Error("Invalid EC range");
    if (target.minPh > target.maxPh) throw new Error("Invalid pH range");

    // 1. Hitung nilai error untuk setiap parameter
    const targetHumidityCenter = (target.minSoilHumidity + target.maxSoilHumidity) / 2;
    const humidityError = actual.soilHumidity - targetHumidityCenter;

    const targetEcCenter = (target.minSoilEc + target.maxSoilEc) / 2;
    const ecError = actual.soilConductivity - targetEcCenter;

    const targetPhCenter = (target.minPh + target.maxPh) / 2;
    const phError = actual.soilPh - targetPhCenter;

    console.log(`[FUZZY_INPUT] HumidityErr: ${humidityError.toFixed(2)}, EcErr: ${ecError.toFixed(2)}, PhErr: ${phError.toFixed(2)}`);

    // 2. Fuzzifikasi semua input
    const fuzzifiedHumidity = this.fuzzifyHumidityError(humidityError);
    const fuzzifiedEc = this.fuzzifyEcError(ecError);
    const fuzzifiedPh = this.fuzzifyPhError(phError);

    // 3. Terapkan aturan inferensi
    const { pumpRules, phRules } = this.applyRules(fuzzifiedHumidity, fuzzifiedEc, fuzzifiedPh);

    // 4. Defuzzifikasi untuk mendapatkan hasil akhir
    const finalPumpDuration = this.defuzzify(pumpRules);
    const finalPhAction = this.defuzzify(phRules);

    // 5. Terjemahkan hasil numerik pH menjadi rekomendasi teks
    let phRecommendation: FuzzyResult['phRecommendation'] = 'Aman';
    if (finalPhAction > 0.5) {
      phRecommendation = 'Perlu pH Up';
    } else if (finalPhAction < -0.5) {
      phRecommendation = 'Perlu pH Down';
    }

    return {
      pumpDuration: Math.round(finalPumpDuration),
      phRecommendation: phRecommendation,
    };
  }
}
