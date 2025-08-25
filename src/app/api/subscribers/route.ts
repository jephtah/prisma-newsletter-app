import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const SubscriberSchema = z.object({
  email: z.email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required').optional(),
})

export async function GET() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isActive: true,
      },
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = SubscriberSchema.parse(body)

    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: validatedData.email },
    })

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'Email is already subscribed to our newsletter' },
          { status: 400 }
        )
      } else {
        const reactivatedSubscriber = await prisma.subscriber.update({
          where: { email: validatedData.email },
          data: { 
            isActive: true,
            name: validatedData.name || existingSubscriber.name,
          },
        })
        return NextResponse.json(reactivatedSubscriber, { status: 201 })
      }
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
      },
    })

    return NextResponse.json(subscriber, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}