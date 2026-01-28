import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { getAuthenticatedUser, errorResponse } from '@/lib/api-helpers';

// GET /api/me - Get current authenticated user
export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    // Get profile from database
    const profile = await prisma.profile.findUnique({
      where: { id: user!.id },
    });

    return NextResponse.json({
      user: {
        id: user!.id,
        email: user!.email,
        fullName: profile?.fullName || null,
        avatarUrl: profile?.avatarUrl || null,
      },
    });
  } catch (error) {
    console.error('GET /api/me error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
