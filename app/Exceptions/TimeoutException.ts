import { Exception } from '@adonisjs/core/build/standalone'

/*
|--------------------------------------------------------------------------
| TimeoutException
|--------------------------------------------------------------------------
|
| This custom exception is thrown when our service doesn't get a reply
| from the ESP32 within the specified time limit. It returns a 504
| Gateway Timeout HTTP status code, which is more specific than a
| generic 500 Internal Server Error.
|
*/
export default class TimeoutException extends Exception {
  constructor(message: string) {
    // Call the parent constructor with a custom message, a 504 status code, and an error code.
    super(message, 504, 'E_TIMEOUT')
  }
}
