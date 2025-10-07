// Add this interface definition
import FertilizerSchedule from 'App/Models/FertilizerSchedule/FertilizerSchedule'

interface DailyStatus {
  age: number
  stageName: string
  tasks: FertilizerSchedule[]
}

// This describes the final "lean" object you want to create
interface LeanPlantingBatch {
  id: number
  plantingDate: string
  harvestDate: string | null
  plant: { name: string }
  locations: { name: string }[]
  dailyStatus: DailyStatus
}
