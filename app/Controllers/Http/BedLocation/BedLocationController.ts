import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BedLocationService from 'App/Services/BedLocation/BedLocationService'
import CreateBedLocationValidator from 'App/Validators/BedLocation/CreateBedLocationValidator'
import UpdateBedLocationValidator from 'App/Validators/BedLocation/UpdateBedLocationValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class BedLocationController {
  service = new BedLocationService()
  FETCHED_ATTRIBUTE = [
    // attribute
    'name',
    'description',
    'address',
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
      await request.validate(CreateBedLocationValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.store(data)
      return response.api(result, 'BedLocation created!', 201)
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
        return response.api(null, `BedLocation with id: ${params.id} not found`)
      }
      return response.api(result)
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      await request.validate(UpdateBedLocationValidator)
      const data = request.only(this.FETCHED_ATTRIBUTE)
      const result = await this.service.update(params.id, data)
      if (!result) {
        return response.api(null, `BedLocation with id: ${params.id} not found`)
      }
      return response.api(result, 'BedLocation updated!')
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
        return response.api(null, `BedLocation with id: ${params.id} not found`)
      }
      return response.api(null, 'BedLocation deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }

  public async destroyAll({ response }: HttpContextContract) {
    try {
      await this.service.deleteAll()
      return response.api(null, 'All BedLocation deleted!')
    } catch (error) {
      return response.error(error.message)
    }
  }
}
