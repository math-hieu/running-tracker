import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'default-user'

    const completions = await prisma.sessionCompletion.findMany({
      where: { userId },
      orderBy: [
        { weekNumber: 'asc' },
      ],
    })

    return NextResponse.json(completions)
  } catch (error) {
    console.error('Error fetching session completions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session completions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, weekNumber, dayOfWeek, sessionType } = body

    // Créer la complétion
    const completion = await prisma.sessionCompletion.create({
      data: {
        userId: userId || 'default-user',
        weekNumber,
        dayOfWeek: dayOfWeek || null,
        sessionType,
      },
    })

    return NextResponse.json(completion, { status: 201 })
  } catch (error) {
    console.error('Error creating session completion:', error)
    return NextResponse.json(
      { error: 'Failed to create session completion' },
      { status: 500 }
    )
  }
}
