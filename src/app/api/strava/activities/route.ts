import { NextRequest, NextResponse } from 'next/server'
import { stravaClient } from '@/lib/strava'
import { prisma } from '@/lib/prisma'

async function refreshTokenIfNeeded(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.stravaRefreshToken) {
    throw new Error('User not found or not connected to Strava')
  }

  // Vérifier si le token a expiré
  if (user.stravaTokenExpiry && new Date() >= user.stravaTokenExpiry) {
    const tokenData = await stravaClient.refreshToken(user.stravaRefreshToken)

    // Mettre à jour les tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        stravaAccessToken: tokenData.access_token,
        stravaRefreshToken: tokenData.refresh_token,
        stravaTokenExpiry: new Date(tokenData.expires_at * 1000),
      },
    })

    return tokenData.access_token
  }

  return user.stravaAccessToken!
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const page = searchParams.get('page') || '1'
  const perPage = searchParams.get('perPage') || '30'

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  try {
    const accessToken = await refreshTokenIfNeeded(userId)
    const activities = await stravaClient.getAthleteActivities(
      accessToken,
      parseInt(page),
      parseInt(perPage)
    )

    // Filtrer uniquement les activités de course
    const runningActivities = activities.filter(
      (activity) => activity.type === 'Run'
    )

    // Récupérer les IDs Strava déjà importés
    const existingActivities = await prisma.activity.findMany({
      where: {
        userId,
        stravaId: {
          in: runningActivities.map((a) => a.id.toString()),
        },
      },
      select: {
        stravaId: true,
      },
    })

    const importedIds = new Set(
      existingActivities.map((a) => a.stravaId).filter(Boolean)
    )

    // Ajouter un flag pour indiquer si l'activité est déjà importée
    const activitiesWithStatus = runningActivities.map((activity) => ({
      ...activity,
      isImported: importedIds.has(activity.id.toString()),
    }))

    return NextResponse.json(activitiesWithStatus)
  } catch (error) {
    console.error('Error fetching Strava activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Strava activities' },
      { status: 500 }
    )
  }
}
