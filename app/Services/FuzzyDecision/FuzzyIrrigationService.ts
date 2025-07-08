// app/Services/FuzzyDecision/FuzzyIrrigationService.ts
import Logger from '@ioc:Adonis/Core/Logger'
// Impor konfigurasi dari config
import { irrigationFuzzyConfig } from 'Config/fuzzyIrrigation'

interface IrrigationFuzzyInputs {
    suhuUdara: number
    kelembapanTanah: number
}

type RuleOutput = {
    alpha: number;
    z: number;
}

// Tipe untuk menyimpan hasil fuzzifikasi semua input
type FuzzifiedInputs = {
    [inputName: string]: { [setName: string]: number }
}

export default class FuzzyIrrigationService {
    // Ambil konfigurasi dari config
    private config = irrigationFuzzyConfig;

    // BAGIAN 1: FUZZIFIKASI 
    private getMembership(x: number, points: [number, number, number, number]): number {
        const [a, b, c, d] = points;
        if (x <= a || x >= d) return 0;
        if (x >= b && x <= c) return 1;
        if (x > a && x < b) return (x - a) / (b - a);
        if (x > c && x < d) return (d - x) / (d - c);
        return 0;
    }
    //  Melakukan fuzzifikasi untuk semua input berdasarkan konfigurasi.
    private fuzzifyInputs(inputs: IrrigationFuzzyInputs): FuzzifiedInputs {
        const fuzzified: FuzzifiedInputs = {};

        // Loop melalui setiap variabel input yang didefinisikan di config (e.g., 'suhuUdara')
        for (const inputName in this.config.inputs) {
            fuzzified[inputName] = {};
            const inputValue = inputs[inputName]; // Dapatkan nilai sensor (e.g., 23)

            // Loop melalui setiap himpunan fuzzy untuk variabel itu (e.g., 'Sejuk', 'Ideal')
            for (const setName in this.config.inputs[inputName]) {
                const points = this.config.inputs[inputName][setName];
                // Hitung dan simpan derajat keanggotaan
                fuzzified[inputName][setName] = this.getMembership(inputValue, points);
            }
        }
        return fuzzified;
    }
    // --- BAGIAN 2: INFERENSI 
    private applyRules(fuzzifiedInputs: FuzzifiedInputs): RuleOutput[] {
        const ruleOutputs: RuleOutput[] = [];
        const outputConfig = this.config.outputs.durasiPenyiraman;

        // Loop melalui setiap objek aturan di dalam array config.rules
        for (const rule of this.config.rules) {
            const conditionMemberships: number[] = [];

            // Dapatkan derajat keanggotaan untuk setiap kondisi dalam klausa 'if'
            for (const inputName in rule.if) {
                const setName = rule.if[inputName]; // e.g., 'Kering'
                const membership = fuzzifiedInputs[inputName][setName];
                conditionMemberships.push(membership);
            }

            // Terapkan operator AND dengan mencari nilai minimum.
            // Ini secara otomatis menangani aturan dengan 1 atau banyak kondisi.
            const alpha = Math.min(...conditionMemberships);

            if (alpha > 0) {
                // Dapatkan nama output dari klausa 'then'
                const outputSetName = rule.then.durasiPenyiraman;
                // Dapatkan nilai tegas (singleton) dari konfigurasi output
                const z = outputConfig[outputSetName];
                ruleOutputs.push({ alpha, z });
            }
        }
        return ruleOutputs;
    }

    // BAGIAN 3: DEFUZZIFIKASI 
    private defuzzify(ruleOutputs: RuleOutput[]): number {
        if (ruleOutputs.length === 0) return 0;

        const numerator = ruleOutputs.reduce((sum, rule) => sum + rule.alpha * rule.z, 0);
        const denominator = ruleOutputs.reduce((sum, rule) => sum + rule.alpha, 0);

        return denominator === 0 ? 0 : numerator / denominator;
    }

    // METODE UTAMA 
    public calculateIrrigationDuration(inputs: IrrigationFuzzyInputs): number {
        Logger.info(`[FUZZY_IRRIGATION] Inputs: Suhu=${inputs.suhuUdara}, Kelembapan=${inputs.kelembapanTanah}`);

        // Langkah 1: Fuzzifikasi (memanggil metode dinamis yang baru)
        const fuzzifiedInputs = this.fuzzifyInputs(inputs);
        Logger.debug('[FUZZY_IRRIGATION] Fuzzified Values: %o', fuzzifiedInputs);

        // Langkah 2: Terapkan Aturan (memanggil rule engine dinamis yang baru)
        const activeRules = this.applyRules(fuzzifiedInputs);
        Logger.debug('[FUZZY_IRRIGATION] Active Rules: %o', activeRules);

        // Langkah 3: Defuzzifikasi (tidak ada perubahan)
        const finalDuration = this.defuzzify(activeRules);

        // Langkah 4: Terapkan Eksekusi dari Konfigurasi
        if (finalDuration < this.config.executionGate.minimumEffectiveDuration) {
            Logger.info(`[FUZZY_IRRIGATION] Final duration (${finalDuration.toFixed(2)}s) is below threshold. Setting to 0.`);
            return 0;
        }

        Logger.info(`[FUZZY_IRRIGATION] Calculated effective duration: ${Math.round(finalDuration)}s`);
        return Math.round(finalDuration);
    }
}
