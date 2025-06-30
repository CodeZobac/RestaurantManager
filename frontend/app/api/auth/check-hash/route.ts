import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { hash } = await request.json();

  if (hash === process.env.ADMIN_LOGIN_HASH) {
    return NextResponse.json({ success: true });
  } else {
    return new NextResponse('Unauthorized', { status: 401 });
  }
}
