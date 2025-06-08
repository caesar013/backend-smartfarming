import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PlantService from 'App/Services/Plant/PlantService'
import CreatePlantValidator from 'App/Validators/Plant/CreatePlantValidator'
import UpdatePlantValidator from 'App/Validators/Plant/UpdatePlantValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class PlantController {
  service = new PlantService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'name',
    'scientific_name',
    'description',
  ]

  public async index({ request, response }: HttpContextContract) {
    try {
      const options = request.parseParams(request.all())
      const result = await this.service.getAll(options)
      return response.api(result, 'OK', 200, request)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreatePlantValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'Plant created!', 201)
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
        return response.api(null, `Plant with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdatePlantValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `Plant with id: ${params.id} not found`)
      }
      return response.api(result, 'Plant updated!')
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
        return response.api(null, `Plant with id: ${params.id} not found`)
      }
      return response.api(null, 'Plant deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All Plant deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
