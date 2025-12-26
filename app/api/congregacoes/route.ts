import { NextResponse } from 'next/server';
import { getAllCongregacoes, createCongregacao } from '@/lib/db-operations-supabase';

export async function GET() {
  try {
    const congregacoes = await getAllCongregacoes();
    return NextResponse.json(congregacoes);
  } catch (error) {
    console.error('Erro ao buscar congregações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar congregações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const congregacao = await createCongregacao(body);
    return NextResponse.json(congregacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar congregação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar congregação' },
      { status: 500 }
    );
  }
}
