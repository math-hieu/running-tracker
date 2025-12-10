import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, weekNumber, dayOfWeek, sessionType } = body

    // Chercher si déjà complété
    const existing = await prisma.sessionCompletion.findUnique({
      where: {
        userId_weekNumber_dayOfWeek_sessionType: {
          userId: userId || 'default-user',
          weekNumber,
          dayOfWeek: dayOfWeek || null,
          sessionType,
        },
      },
    })

    if (existing) {
      // Déjà complété -> supprimer
      await prisma.sessionCompletion.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ isCompleted: false })
    } else {
      // Pas complété -> créer
      const completion = await prisma.sessionCompletion.create({
        data: {
          userId: userId || 'default-user',
          weekNumber,
          dayOfWeek: dayOfWeek || null,
          sessionType,
        },
      })
      return NextResponse.json({ isCompleted: true, completion })
    }
  } catch (error) {
    console.error('Error toggling session completion:', error)
    return NextResponse.json(
      { error: 'Failed to toggle session completion' },
      { status: 500 }
    )
  }
}
