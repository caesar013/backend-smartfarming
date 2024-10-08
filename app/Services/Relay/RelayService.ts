import BaseService from "App/Base/Services/BaseService"
import RelayRepository from "App/Repositories/Relay/RelayRepository"
import client from '../../../start/mqtt'

export default class RelayService extends BaseService {
  constructor() {
    super(new RelayRepository())
  }

  public async setRelay(number: number, state: number) {

    let success = true;

      if(state == 1){
        const relay = await this.repository.get(number);

        if(relay){
          return {
            success: false,
            message: 'Relay already enabled!'
          };
        }

        await this.repository.create(number, true);
      } else {
        const relay = await this.repository.get(number);

        if(relay){
          await this.repository.update(relay, false);
        }
      }

      client.publish(`smartfarming/relay`, JSON.stringify({ number, state }), (e) => {
        if(e){
          success = false
        }
      });
      return {
        success
      };
  }

  public async getStatus(){
    return this.repository.getStatus();
  }
}
    