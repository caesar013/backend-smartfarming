import PlantGrowthParameter from 'App/Models/PlantGrowthParameter/PlantGrowthParameter'

export default class PlantParameterService {
  /**
   * Get growth parameters by plant ID and age in days.
   * @param plantId - plant ID for which to retrieve parameters
   * @param ageInDays - Current age of the plant in days
   * @returns Object containing the growth parameters, or null if not found.
   */
  public async getParametersByAge(plantId: number, ageInDays: number) {
    try {
      const parameters = await PlantGrowthParameter.query()
        .where('plantId', plantId)
        .where('minAge', '<=', ageInDays)
        .where('maxAge', '>=', ageInDays)
        .first() // Only fetch the first matching record

      if (!parameters) {
        console.log(`Failed to find growth parameters for plant ID ${plantId} at age ${ageInDays} days.`)
        return null
      }

      // Return the relevant parameters as an object
      return {
        minSoilEc: parameters.minSoilEc,
        maxSoilEc: parameters.maxSoilEc || parameters.minSoilEc + 300,
        minSoilHumidity: parameters.minSoilHumidity,
        maxSoilHumidity: parameters.maxSoilHumidity || parameters.minSoilHumidity + 20,
        minPh: parameters.minPh,
        maxPh: parameters.maxPh || parameters.minPh + 1
      }
    } catch (error) {
      console.error('Error saat mengambil parameter pertumbuhan:', error)
      return null
    }
  }
}
