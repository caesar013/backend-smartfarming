import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PlantingBatchService from 'App/Services/PlantingBatch/PlantingBatchService'
import CreatePlantingBatchValidator from 'App/Validators/PlantingBatch/CreatePlantingBatchValidator'
import UpdatePlantingBatchValidator from 'App/Validators/PlantingBatch/UpdatePlantingBatchValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class PlantingBatchController {
  service = new PlantingBatchService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'plantId',
    'plantingDate',
    'harvestDate',
  ]

  public async index({ request, response }: HttpContextContract) {
    try {
      // Parse query parameters for filtering and pagination
      const options = {
        filter: {
          plantId: request.input('plantId'), // Reads ?plantId= from the URL
        },
        pagination: {
          page: request.input('page', 1),
          limit: request.input('limit', 10),
        },
      }

      // Call the new dedicated service method
      const fullResult = await this.service.getBatches(options)

      const leanResult = {
      meta: fullResult.meta, // Keep the pagination meta as is
      data: fullResult.data.map((batch: any) => {
        // For each batch, return a new object with only the fields you need
        return {
          id: batch.id,
          plantingDate: batch.plantingDate,
          harvestDate: batch.harvestDate,
          plant: {
            name: batch.plant.name,
          },
          locations: batch.locations.map((loc) => ({ name: loc.name })),
          dailyStatus: batch.dailyStatus,
        }
      }),
    }

    // 3. Return the new, leaner result
    return leanResult
      // return response.api(result, 'OK', 200)
    } catch (error) {
      return response.error(error.message)
    }
  }

  /**
   * Store a newly created resource in storage.
   * This method now uses the CreatePlantingBatchValidator to validate the request.
   * @param param { request, response }: HttpContextContract
   * @returns { Promise<void> }
   */
  public async store({ request, response }: HttpContextContract) {
    try {
      // The payload now contains the validated locations array
      const payload = await request.validate(CreatePlantingBatchValidator)

      // Call the new, specific service method
      const result = await this.service.createBatch(payload)

      return response.api(result, 'Planting Batch created successfully!', 201)
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async show({ params, request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.show(params.id, options)
      if (!result) {
        return response.api(null, `PlantingBatch with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      // Get the full validated payload, including the optional 'locations'
      const payload = await request.validate(UpdatePlantingBatchValidator)

      // Call the new, specific service method for updating
      const result = await this.service.updateBatch(params.id, payload)

      if (!result) {
        return response.api(null, `PlantingBatch with id: ${params.id} not found`, 404)
      }

      return response.api(result, 'Planting Batch updated successfully!')
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const result = await this.service.delete(params.id)
      if (!result) {
        return response.api(null, `PlantingBatch with id: ${params.id} not found`)
      }
      return response.api(null, 'PlantingBatch deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All PlantingBatch deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
