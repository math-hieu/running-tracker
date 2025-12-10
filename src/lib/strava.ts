export interface StravaTokenResponse {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
  athlete: {
    id: number
    username: string
    firstname: string
    lastname: string
  }
}

export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  start_date: string
  start_date_local: string
  timezone: string
  achievement_count: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map: {
    id: string
    summary_polyline: string
    resource_state: number
  }
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
}

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'
const STRAVA_AUTH_BASE = 'https://www.strava.com/oauth'

export class StravaClient {
  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID || ''
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || ''
    this.redirectUri = process.env.STRAVA_REDIRECT_URI || ''
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all',
    })

    return `${STRAVA_AUTH_BASE}/authorize?${params.toString()}`
  }

  async exchangeToken(code: string): Promise<StravaTokenResponse> {
    const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange token')
    }

    return response.json()
  }

  async refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  }

  async getAthleteActivities(
    accessToken: string,
    page = 1,
    perPage = 30
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    })

    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activities')
    }

    return response.json()
  }

  async getActivity(
    accessToken: string,
    activityId: number
  ): Promise<StravaActivity> {
    const response = await fetch(
      `${STRAVA_API_BASE}/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activity')
    }

    return response.json()
  }
}

export const stravaClient = new StravaClient()
