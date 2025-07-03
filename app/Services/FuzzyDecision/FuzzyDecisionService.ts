// No external fuzzy logic imports needed!

// Define the structure for the input objects.
interface TargetParams {
  minSoilEc: number
  maxSoilEc: number
  minSoilHumidity: number
  maxSoilHumidity: number
}

interface ActualReadings {
  soilConductivity: number // Ensure this name is consistent with what AutomationService provides.
  soilHumidity: number
}

// A simple type for the output of our rule evaluation.
type RuleOutput = {
  alpha: number; // The rule's firing strength (0-1)
  z: number;     // The rule's output value
}

/**
 * A self-contained service to perform fuzzy logic calculations using the Tsukamoto method.
 * This class has no external dependencies for its logic, making it stable and transparent.
 */
export default class FuzzyDecisionService {
  // =================================================================================
  // --- PART 1: FUZZIFICATION ---
  // Goal: Convert a crisp sensor value (like ec_error = -150) into
  // a set of membership degrees (e.g., { Terlalu_Rendah: 0.75, Rendah: 0.25, Sesuai: 0 }).
  // =================================================================================

  /**
   * Calculates the membership degree for a given value in a trapezoidal or triangular shape.
   * @param x The crisp input value.
   * @param points An array defining the shape [a, b, c, d]. For a triangle, b and c are the same.
   */
  private getMembership(x: number, points: [number, number, number, number]): number {
    const [a, b, c, d] = points;
    if (x <= a || x >= d) {
      return 0; // Outside the shape
    }
    if (x >= b && x <= c) {
      return 1; // On the flat top of the trapezoid
    }
    if (x > a && x < b) {
      return (x - a) / (b - a); // On the rising slope
    }
    if (x > c && x < d) {
      return (d - x) / (d - c); // On the falling slope
    }
    return 0;
  }

  /**
   * Fuzzifies the EC Error value.
   * @param ecError The crisp EC error value.
   */
  private fuzzifyEcError(ecError: number) {
    return {
      Terlalu_Rendah: this.getMembership(ecError, [-1000, -1000, -300, -100]),
      Rendah:         this.getMembership(ecError, [-200, -100, -50, 0]),
      Sesuai:         this.getMembership(ecError, [-50, 0, 50, 100]),
      Tinggi:         this.getMembership(ecError, [50, 150, 300, 500]),
    };
  }

  /**
   * Fuzzifies the Humidity Error value.
   * @param humidityError The crisp humidity error value.
   */
  private fuzzifyHumidityError(humidityError: number) {
    return {
      Kering: this.getMembership(humidityError, [-20, -20, -10, -5]),
      Lembap: this.getMembership(humidityError, [-10, -5, 5, 10]),
      Basah:  this.getMembership(humidityError, [5, 10, 20, 20]),
    };
  }

  // =================================================================================
  // --- PART 2: INFERENCE (RULE EVALUATION) ---
  // Goal: Evaluate all fuzzy rules to produce a list of active rule outputs (alpha and z).
  // =================================================================================

  private applyRules(fuzzifiedEc: any, fuzzifiedHumidity: any): RuleOutput[] {
    const ruleOutputs: RuleOutput[] = [];

    // Define the crisp output values (z) for each output linguistic variable.
    // This is the "effective watering time" in seconds.
    const outputValues = {
      Mati: 0,
      Singkat: 20,
      Sedang: 50,
      Lama: 80,
    };

    let alpha = 0; // Represents the firing strength of a rule.

    // Rule 1: IF ec_error is Terlalu_Rendah AND humidity_error is Kering THEN durasi is Lama
    alpha = Math.min(fuzzifiedEc.Terlalu_Rendah, fuzzifiedHumidity.Kering);
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Lama });

    // Rule 2: IF ec_error is Terlalu_Rendah AND humidity_error is Lembap THEN durasi is Lama
    alpha = Math.min(fuzzifiedEc.Terlalu_Rendah, fuzzifiedHumidity.Lembap);
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Lama });

    // Rule 3: IF ec_error is Rendah AND humidity_error is Kering THEN durasi is Sedang
    alpha = Math.min(fuzzifiedEc.Rendah, fuzzifiedHumidity.Kering);
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Sedang });

    // Rule 4: IF ec_error is Rendah AND humidity_error is Lembap THEN durasi is Sedang
    alpha = Math.min(fuzzifiedEc.Rendah, fuzzifiedHumidity.Lembap);
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Sedang });

    // Rule 5: IF ec_error is Sesuai AND humidity_error is Kering THEN durasi is Singkat
    alpha = Math.min(fuzzifiedEc.Sesuai, fuzzifiedHumidity.Kering);
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Singkat });

    // Rule 6: IF ec_error is Sesuai AND humidity_error is Lembap THEN durasi is Mati
    alpha = Math.min(fuzzifiedEc.Sesuai, fuzzifiedHumidity.Lembap);
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Mati });

    // Rule 7: IF ec_error is Tinggi THEN durasi is Mati
    alpha = fuzzifiedEc.Tinggi;
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Mati });

    // Rule 8: IF humidity_error is Basah THEN durasi is Mati
    alpha = fuzzifiedHumidity.Basah;
    if (alpha > 0) ruleOutputs.push({ alpha, z: outputValues.Mati });

    return ruleOutputs;
  }

  // =================================================================================
  // --- PART 3: DEFUZZIFICATION ---
  // Goal: Combine all rule outputs into a single, crisp final value.
  // We use the Weighted Average method, characteristic of the Tsukamoto model.
  // =================================================================================

  private defuzzify(ruleOutputs: RuleOutput[]): number {
    let numerator = 0;   // This is the top part of the formula: Σ(alpha * z)
    let denominator = 0; // This is the bottom part of the formula: Σ(alpha)

    for (const rule of ruleOutputs) {
      numerator += rule.alpha * rule.z;
      denominator += rule.alpha;
    }

    // Safety check to avoid division by zero if no rules were activated.
    if (denominator === 0) {
      return 0;
    }

    return numerator / denominator;
  }

  // =================================================================================
  // --- MAIN PUBLIC METHOD ---
  // Goal: Orchestrate all fuzzy logic steps from start to finish.
  // =================================================================================

  public calculatePumpDuration(target: TargetParams, actual: ActualReadings): number {
    // Step 1: Calculate the crisp error values.
    const targetEcCenter = (target.minSoilEc + target.maxSoilEc) / 2;
    const ecError = actual.soilConductivity - targetEcCenter;

    const targetHumidityCenter = (target.minSoilHumidity + target.maxSoilHumidity) / 2;
    const humidityError = actual.soilHumidity - targetHumidityCenter;

    console.log(`[FUZZY_INPUT] EC Error: ${ecError.toFixed(2)}, Humidity Error: ${humidityError.toFixed(2)}`);

    // Step 2: Fuzzify the crisp inputs.
    const fuzzifiedEc = this.fuzzifyEcError(ecError);
    const fuzzifiedHumidity = this.fuzzifyHumidityError(humidityError);

    // Step 3: Apply rules to get the list of active outputs.
    const activeRules = this.applyRules(fuzzifiedEc, fuzzifiedHumidity);

    // Step 4: Defuzzify to get the final, single duration value.
    const finalDuration = this.defuzzify(activeRules);

    // Return the result, rounded to the nearest integer.
    return Math.round(finalDuration);
  }
}
