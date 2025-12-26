import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/db-operations-supabase';

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dbData, ...userData } = body;
    
    // dbData não é mais necessário com Supabase, mas mantemos compatibilidade
    
    const user = await createUser(userData);
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
