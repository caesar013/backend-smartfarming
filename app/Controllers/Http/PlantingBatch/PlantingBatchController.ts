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
      const result = await this.service.getBatches(options)

      return response.api(result, 'OK', 200)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreatePlantingBatchValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'PlantingBatch created!', 201)
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
      await request.validate(UpdatePlantingBatchValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `PlantingBatch with id: ${params.id} not found`)
      }
      return response.api(result, 'PlantingBatch updated!')
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
