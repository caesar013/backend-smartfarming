import BaseRepository from "App/Base/Repositories/BaseRepository";
import Actuator from "App/Models/Actuator/Actuator";

export default class ActuatorRepository extends BaseRepository {
  constructor() {
    super(Actuator)
  }

  /**
   * Finds a record by its ID or throws a custom exception if not found.
   * @param id The ID of the record.
   * @returns The Actuator model instance.
   */
  public async findOrFail(id: number): Promise<Actuator> {
    const record = this.model.find(id)
    if (!record) {
      throw new Error(`Actuator with ID ${id} was not found.`)
    }
    return record as Actuator
  }

  /**
   * Finds a record by its ID.
   * @param id The ID of the record.
   * @returns The Actuator model instance or null.
   */
  public async find(id: number): Promise<Actuator | null> {
    return await Actuator.find(id)
  }
}
