import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing email, password, or name' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const { rows } = await pool.query(
      'INSERT INTO admins (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, password_hash, name, 'user']
    );
    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Database insert error:', error);
    return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
  }
}
