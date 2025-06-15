import BaseService from "App/Base/Services/BaseService"
import SensorReadingRepository from "App/Repositories/SensorReading/SensorReadingRepository"

export default class SensorReadingService extends BaseService {
  constructor() {
    super(new SensorReadingRepository())
  }

  public async search(options?: any) {
    const { isLatest } = options || {}
    if (isLatest) {
      const latestReadings = await this.repository.getLatestReadings()

      const formattedReadings = latestReadings.reduce((accumulator, currentReading) => {
        const sensor_name = currentReading.name.replace('_', '').toLowerCase() // Convert to lowercase and remove underscores
        accumulator[sensor_name] = currentReading.payload
        return accumulator
      }, {})

      return formattedReadings
    }
    return this.repository.search(options)
  }
}
