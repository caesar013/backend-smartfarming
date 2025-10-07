import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FertilizerService from 'App/Services/Fertilizer/FertilizerService'
import CreateFertilizerValidator from 'App/Validators/Fertilizer/CreateFertilizerValidator'
import UpdateFertilizerValidator from 'App/Validators/Fertilizer/UpdateFertilizerValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class FertilizerController {
  service = new FertilizerService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'name',
    'nPercentage',
    'pPercentage',
    'kPercentage',
  ]

  public async index ({ request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.getAll(options)
      return response.api(result, 'OK', 200, request)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async store ({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreateFertilizerValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'Fertilizer created!', 201)
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async show ({ params, request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.show(params.id, options)
      if (!result) {
        return response.api(null, `Fertilizer with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update ({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateFertilizerValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `Fertilizer with id: ${params.id} not found`)
      }
      return response.api(result, 'Fertilizer updated!')
    } catch (error) {
      if (error instanceof ValidationException) {
        const errorValidation: any = error
        return response.error(errorValidation.message, errorValidation.messages.errors, 422)
      }
      return response.error(error.message)
    }
  }

  public async destroy ({ params, response }: HttpContextContract) {
    try {
      const result = await this.service.delete(params.id)
      if (!result) {
        return response.api(null, `Fertilizer with id: ${params.id} not found`)
      }
      return response.api(null, 'Fertilizer deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll ({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All Fertilizer deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
