import Env from '@ioc:Adonis/Core/Env'
import https from 'https'
import { URL } from 'url'

export type FuzzyWeatherCondition = 'Cerah' | 'Hujan'

export interface BmkgWeatherResult {
  condition: FuzzyWeatherCondition
  description?: string
  forecastTime?: string
  adm4: string
  source: 'bmkg'
}

type BmkgForecast = {
  local_datetime?: string
  datetime?: string
  weather_desc?: string
  weather?: string
  [key: string]: unknown
}

type BmkgResponse = {
  data?: Array<{
    cuaca?: unknown
    [key: string]: unknown
  }>
}

export default class BmkgWeatherService {
  private readonly baseUrl = 'https://api.bmkg.go.id/publik/prakiraan-cuaca'
  private readonly defaultAdm4 = '35.79.02.2006'
  private readonly defaultTimeoutMs = 5000

  public async getCurrentFuzzyWeather(): Promise<BmkgWeatherResult> {
    const adm4 = this.getAdm4()
    const response = await this.fetchForecast(adm4)
    const forecast = this.getNearestForecast(this.getForecasts(response))

    if (!forecast) {
      throw new Error('BMKG forecast data is empty')
    }

    const description = this.getWeatherDescription(forecast)
    const forecastTime = forecast.local_datetime || forecast.datetime

    return {
      condition: this.mapDescriptionToCondition(description),
      description,
      forecastTime,
      adm4,
      source: 'bmkg',
    }
  }

  private getAdm4(): string {
    return Env.get('BMKG_ADM4', this.defaultAdm4) || this.defaultAdm4
  }

  private getTimeoutMs(): number {
    const timeout = Number(Env.get('BMKG_TIMEOUT_MS', this.defaultTimeoutMs))
    return Number.isFinite(timeout) && timeout > 0 ? timeout : this.defaultTimeoutMs
  }

  private fetchForecast(adm4: string): Promise<BmkgResponse> {
    const url = new URL(this.baseUrl)
    url.searchParams.set('adm4', adm4)

    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let body = ''

        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          body += chunk
        })

        response.on('end', () => {
          const statusCode = response.statusCode || 0

          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`BMKG request failed with status ${statusCode}`))
            return
          }

          try {
            resolve(JSON.parse(body))
          } catch (error) {
            reject(new Error(`Failed to parse BMKG response: ${error.message}`))
          }
        })
      })

      request.setTimeout(this.getTimeoutMs(), () => {
        request.destroy(new Error('BMKG request timed out'))
      })

      request.on('error', reject)
    })
  }

  private getForecasts(response: BmkgResponse): BmkgForecast[] {
    const forecasts: BmkgForecast[] = []
    const locations = Array.isArray(response.data) ? response.data : []

    for (const location of locations) {
      this.collectForecasts(location.cuaca, forecasts)
    }

    return forecasts
  }

  private collectForecasts(value: unknown, forecasts: BmkgForecast[]) {
    if (Array.isArray(value)) {
      for (const item of value) {
        this.collectForecasts(item, forecasts)
      }
      return
    }

    if (value && typeof value === 'object') {
      forecasts.push(value as BmkgForecast)
    }
  }

  private getNearestForecast(forecasts: BmkgForecast[]): BmkgForecast | null {
    const now = Date.now()

    return forecasts.find((forecast) => {
      const timestamp = this.getForecastTimestamp(forecast)
      return !Number.isNaN(timestamp) && timestamp >= now
    }) || forecasts[0] || null
  }

  private getForecastTimestamp(forecast: BmkgForecast): number {
    const dateTime = forecast.local_datetime || forecast.datetime

    if (!dateTime) {
      return Number.NaN
    }

    return new Date(dateTime.replace(' ', 'T')).getTime()
  }

  private getWeatherDescription(forecast: BmkgForecast): string {
    return String(forecast.weather_desc || forecast.weather || '').trim()
  }

  private mapDescriptionToCondition(description: string): FuzzyWeatherCondition {
    const normalized = description.toLowerCase()
    const rainKeywords = ['hujan', 'gerimis', 'rain', 'shower', 'drizzle', 'thunder', 'petir', 'storm']

    return rainKeywords.some((keyword) => normalized.includes(keyword)) ? 'Hujan' : 'Cerah'
  }
}
