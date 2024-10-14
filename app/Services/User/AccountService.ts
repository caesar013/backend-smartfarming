import BaseService from "App/Base/Services/BaseService"
import AccountRepository from "App/Repositories/User/AccountRepository"
import Hash from '@ioc:Adonis/Core/Hash'

export default class AccountService extends BaseService {
  constructor() {
    super(new AccountRepository())
  }

  async store(data: any) {
    try {
      if (data.pwd) {
        data.pwd = await Hash.make(data.pwd)
      }
      return await this.repository.store(data)
    } catch (error) {
      throw error
    }
  }

  async createAccount(data: any) {
    const email = await this.repository.findByEmail(data.email);

    if(email) {
      return {
        success: false,
        message: "Email is already used!"
      }
    }

    const username = await this.repository.findByUsername(data.username);

    if(username) {
      return {
        success: false,
        message: "Username is already used!"
      }
    }

    try {
      data.urole_id = 'e3094832-fbbf-4d88-9bb3-0b83e374cc37';
      data.google_id = 1;
      await this.store(data);

      return {
        success: true,
        message: "Account created!"
      }

    } catch (e) {
      return {
        success: false,
        message: e.message
      }
    }
  }

  async update(id: any, data: any) {
    try {
      if (data.pwd) {
        data.pwd = await Hash.make(data.pwd)
      }
      return await this.repository.update(id, data)
    } catch (error) {
      throw error
    }
  }
  
  async findByEmail (email: string) {
    try {
      const akun = await this.repository.findByEmail(email)
      return akun
    } catch (error) {
      throw error
    }
  }
}
    