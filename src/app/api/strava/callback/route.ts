import { NextRequest, NextResponse } from 'next/server'
import { stravaClient } from '@/lib/strava'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL('/strava?error=strava_auth_failed', request.url)
    )
  }

  try {
    const tokenData = await stravaClient.exchangeToken(code)

    // Créer ou mettre à jour l'utilisateur avec les tokens Strava
    const user = await prisma.user.upsert({
      where: {
        stravaAthleteId: tokenData.athlete.id.toString(),
      },
      update: {
        stravaAccessToken: tokenData.access_token,
        stravaRefreshToken: tokenData.refresh_token,
        stravaTokenExpiry: new Date(tokenData.expires_at * 1000),
        name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
      },
      create: {
        email: `${tokenData.athlete.id}@strava.local`,
        name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
        stravaAthleteId: tokenData.athlete.id.toString(),
        stravaAccessToken: tokenData.access_token,
        stravaRefreshToken: tokenData.refresh_token,
        stravaTokenExpiry: new Date(tokenData.expires_at * 1000),
      },
    })

    // Rediriger vers la page d'import avec l'ID utilisateur
    return NextResponse.redirect(
      new URL(`/import?userId=${user.id}`, request.url)
    )
  } catch (error) {
    console.error('Error during Strava callback:', error)
    return NextResponse.redirect(
      new URL('/strava?error=strava_auth_failed', request.url)
    )
  }
}
