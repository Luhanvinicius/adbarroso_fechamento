import { NextRequest, NextResponse } from 'next/server';
import { getMovimentacoes, createMovimentacao } from '@/lib/db-operations-supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const congregacaoId = searchParams.get('congregacaoId') || undefined;
    const mes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!) : undefined;
    const ano = searchParams.get('ano') ? parseInt(searchParams.get('ano')!) : undefined;

    const movimentacoes = await getMovimentacoes(congregacaoId, mes, ano);
    return NextResponse.json(movimentacoes);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar movimentações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const movimentacao = await createMovimentacao(body);
    return NextResponse.json(movimentacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar movimentação' },
      { status: 500 }
    );
  }
}
