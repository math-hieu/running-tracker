import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const activity = await prisma.activity.create({
      data: {
        userId: body.userId || 'default-user', // À remplacer par l'authentification réelle
        title: body.title,
        description: body.description,
        distance: body.distance,
        duration: body.duration,
        pace: body.pace,
        date: body.date ? new Date(body.date) : new Date(),
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
        calories: body.calories,
        elevation: body.elevation,
        heartRate: body.heartRate,
        route: body.route,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
