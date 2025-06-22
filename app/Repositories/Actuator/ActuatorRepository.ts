import BaseRepository from "App/Base/Repositories/BaseRepository";
import Actuator from "App/Models/Actuator/Actuator";

export default class ActuatorRepository extends BaseRepository {
  constructor() {
    super(Actuator)
  }

  /**
   * Finds a record by its ID or throws a custom exception if not found.
   * @param slug The slug of the record.
   * @returns The Actuator model instance.
   */
  public async findOrFail(slug: string): Promise<Actuator> {
    const record = this.find(slug)
    if (!record) {
      throw new Error(`Actuator named ${slug} was not found.`)
    }
    return record as unknown as Actuator
  }

  /**
   * Finds a record by its ID.
   * @param id The ID of the record.
   * @returns The Actuator model instance or null.
   */
  public async find(slug: string): Promise<Actuator | null> {
    return await Actuator.findByOrFail('slug', slug)
  }
}
