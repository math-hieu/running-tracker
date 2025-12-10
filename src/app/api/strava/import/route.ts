import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ImportActivityRequest {
  userId: string
  stravaId: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  average_heartrate?: number
  calories?: number
  map?: {
    summary_polyline: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportActivityRequest = await request.json()

    // Vérifier si l'activité existe déjà
    const existingActivity = await prisma.activity.findUnique({
      where: {
        stravaId: body.stravaId.toString(),
      },
    })

    if (existingActivity) {
      return NextResponse.json(
        { error: 'Activity already imported' },
        { status: 409 }
      )
    }

    // Calculer l'allure (min/km)
    const distanceKm = body.distance / 1000
    const durationMinutes = body.moving_time / 60
    const pace = distanceKm > 0 ? durationMinutes / distanceKm : 0

    // Créer l'activité
    const activity = await prisma.activity.create({
      data: {
        userId: body.userId,
        stravaId: body.stravaId.toString(),
        title: body.name,
        distance: distanceKm,
        duration: body.moving_time,
        pace: pace,
        date: new Date(body.start_date),
        startTime: new Date(body.start_date),
        elevation: body.total_elevation_gain,
        heartRate: body.average_heartrate ? Math.round(body.average_heartrate) : null,
        calories: body.calories,
        route: body.map?.summary_polyline
          ? { summary_polyline: body.map.summary_polyline }
          : null,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error importing activity:', error)
    return NextResponse.json(
      { error: 'Failed to import activity' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activityId = searchParams.get('activityId')

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      )
    }

    await prisma.activity.delete({
      where: {
        id: activityId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}
