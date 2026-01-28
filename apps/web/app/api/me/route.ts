import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { createClient } from '@/lib/supabase/server';
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

// PATCH /api/me - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const body = await request.json();
    const { fullName } = body;

    // Update profile
    const profile = await prisma.profile.update({
      where: { id: user!.id },
      data: {
        ...(fullName !== undefined && { fullName }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      user: {
        id: user!.id,
        email: user!.email,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
      },
    });
  } catch (error) {
    console.error('PATCH /api/me error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// DELETE /api/me - Delete current user's account
export async function DELETE() {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    // Delete all user data (cascades will handle related records)
    // Sites -> Pages -> Jobs -> JobEvents
    await prisma.site.deleteMany({
      where: { userId: user!.id },
    });

    // Delete the profile
    await prisma.profile.delete({
      where: { id: user!.id },
    });

    // Sign out the user (auth record remains but data is deleted)
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/me error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
