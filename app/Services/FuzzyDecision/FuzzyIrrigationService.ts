// app/Services/FuzzyDecision/FuzzyIrrigationService.ts
import Logger from '@ioc:Adonis/Core/Logger'
// Impor konfigurasi dari config
import { irrigationFuzzyConfig } from 'Config/fuzzyIrrigation'

export type KondisiCuaca = 'Cerah' | 'Hujan'

export interface IrrigationFuzzyInputs {
    suhuTanah: number
    kelembapanTanah: number
    cuaca: KondisiCuaca
    [key: string]: number | KondisiCuaca
}

type RuleOutput = {
    alpha: number;
    z: number;
    ruleIndex: number;
    ruleName: string;
    conditions: Record<string, string>;
    outputSetName: string;
    comment?: string;
}

// Tipe untuk menyimpan hasil fuzzifikasi semua input
type FuzzifiedInputs = {
    [inputName: string]: { [setName: string]: number }
}

export type FuzzyIrrigationCalculationDetail = {
    input: IrrigationFuzzyInputs;
    memberships: FuzzifiedInputs;
    activeRules: Array<{
        rule: string;
        alpha: number;
        output: string;
        z: number;
        conditions: Record<string, string>;
        comment?: string;
    }>;
    numerator: number;
    denominator: number;
    rawDuration: number;
    duration: number;
    state: 'Menyiram' | 'Tidak Menyiram';
    minimumEffectiveDuration: number;
}

export default class FuzzyIrrigationService {
    // Ambil konfigurasi dari config
    private config = irrigationFuzzyConfig;

    // BAGIAN 1: FUZZIFIKASI 
    private getMembership(x: number, points: [number, number, number, number]): number {
        const [a, b, c, d] = points;
        if (x < a || x > d) return 0;
        if (x >= b && x <= c) return 1;
        if (x > a && x < b) return (x - a) / (b - a);
        if (x > c && x < d) return (d - x) / (d - c);
        return 0;
    }
    //  Melakukan fuzzifikasi untuk semua input berdasarkan konfigurasi.
    private fuzzifyInputs(inputs: IrrigationFuzzyInputs): FuzzifiedInputs {
        const fuzzified: FuzzifiedInputs = {};

        // Loop melalui setiap variabel input yang didefinisikan di config (e.g., 'suhuTanah')
        for (const inputName in this.config.inputs) {
            fuzzified[inputName] = {};
            const inputValue = inputs[inputName]; // Dapatkan nilai sensor atau kategori cuaca

            // Loop melalui setiap himpunan fuzzy untuk variabel itu (e.g., 'Dingin', 'Ideal')
            for (const setName in this.config.inputs[inputName]) {
                const definition = this.config.inputs[inputName][setName];

                if (Array.isArray(definition)) {
                    // Input numerik seperti suhu tanah dan kelembapan tanah
                    fuzzified[inputName][setName] = this.getMembership(inputValue as number, definition);
                } else {
                    // Input kategorikal seperti cuaca: Cerah atau Hujan
                    fuzzified[inputName][setName] = inputValue === definition ? 1 : 0;
                }
            }
        }
        return fuzzified;
    }
    // --- BAGIAN 2: INFERENSI
    private applyRules(fuzzifiedInputs: FuzzifiedInputs): RuleOutput[] {
        const ruleOutputs: RuleOutput[] = [];
        const outputConfig = this.config.outputs.durasiPenyiraman;

        // Loop melalui setiap objek aturan di dalam array config.rules
        this.config.rules.forEach((rule, index) => {
            const conditionMemberships: number[] = [];
            const conditions: Record<string, string> = {};

            // Dapatkan derajat keanggotaan untuk setiap kondisi dalam klausa 'if'
            for (const inputName in rule.if) {
                const setName = rule.if[inputName]; // e.g., 'Kering'
                const membership = fuzzifiedInputs[inputName][setName];
                conditions[inputName] = setName;
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
                ruleOutputs.push({
                    alpha,
                    z,
                    ruleIndex: index + 1,
                    ruleName: `R${index + 1}`,
                    conditions,
                    outputSetName,
                    comment: rule.comment,
                });
            }
        });
        return ruleOutputs;
    }

    // BAGIAN 3: DEFUZZIFIKASI 
    private defuzzify(ruleOutputs: RuleOutput[]): number {
        if (ruleOutputs.length === 0) return 0;

        const numerator = ruleOutputs.reduce((sum, rule) => sum + rule.alpha * rule.z, 0);
        const denominator = ruleOutputs.reduce((sum, rule) => sum + rule.alpha, 0);

        return denominator === 0 ? 0 : numerator / denominator;
    }

    public calculateIrrigationDetail(inputs: IrrigationFuzzyInputs): FuzzyIrrigationCalculationDetail {
        Logger.info(`[FUZZY_IRRIGATION] Inputs: Suhu Tanah=${inputs.suhuTanah}, Kelembapan=${inputs.kelembapanTanah}, Cuaca=${inputs.cuaca}`);

        // Langkah 1: Fuzzifikasi (memanggil metode dinamis yang baru)
        const fuzzifiedInputs = this.fuzzifyInputs(inputs);
        Logger.debug('[FUZZY_IRRIGATION] Fuzzified Values: %o', fuzzifiedInputs);

        // Langkah 2: Terapkan Aturan (memanggil rule engine dinamis yang baru)
        const activeRules = this.applyRules(fuzzifiedInputs);
        Logger.debug('[FUZZY_IRRIGATION] Active Rules: %o', activeRules);

        // Langkah 3: Defuzzifikasi (tidak ada perubahan)
        const finalDuration = this.defuzzify(activeRules);
        const minimumEffectiveDuration = this.config.executionGate.minimumEffectiveDuration;
        const duration = finalDuration < minimumEffectiveDuration ? 0 : Math.round(finalDuration);
        const numerator = activeRules.reduce((sum, rule) => sum + rule.alpha * rule.z, 0);
        const denominator = activeRules.reduce((sum, rule) => sum + rule.alpha, 0);

        return {
            input: inputs,
            memberships: fuzzifiedInputs,
            activeRules: activeRules.map((rule) => ({
                rule: rule.ruleName,
                alpha: rule.alpha,
                output: rule.outputSetName,
                z: rule.z,
                conditions: rule.conditions,
                comment: rule.comment,
            })),
            numerator,
            denominator,
            rawDuration: finalDuration,
            duration,
            state: duration > 0 ? 'Menyiram' : 'Tidak Menyiram',
            minimumEffectiveDuration,
        };
    }

    // METODE UTAMA
    public calculateIrrigationDuration(inputs: IrrigationFuzzyInputs): number {
        const result = this.calculateIrrigationDetail(inputs);

        Logger.info(`[FUZZY_IRRIGATION] Calculated effective duration: ${result.duration}s`);
        return result.duration;
    }
}
