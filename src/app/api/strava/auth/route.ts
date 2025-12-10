import { NextResponse } from 'next/server'
import { stravaClient } from '@/lib/strava'

export async function GET() {
  const authUrl = stravaClient.getAuthorizationUrl()
  return NextResponse.redirect(authUrl)
}
