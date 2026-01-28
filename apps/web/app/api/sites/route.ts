import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@bugable/db';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ sites });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { domain } = body;

  if (!domain || typeof domain !== 'string') {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  // Clean up domain
  const cleanDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  // Check if site already exists for this user
  const existing = await prisma.site.findFirst({
    where: {
      userId: user.id,
      baseUrl: cleanDomain,
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'Site already exists' }, { status: 409 });
  }

  // Create the site
  const site = await prisma.site.create({
    data: {
      userId: user.id,
      name: cleanDomain,
      baseUrl: cleanDomain,
    },
  });

  return NextResponse.json({ site }, { status: 201 });
}
