import { NextRequest, NextResponse } from 'next/server';
import { getSaldoAnterior, setSaldoAnterior } from '@/lib/db-operations-supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const congregacaoId = searchParams.get('congregacaoId');
    const mes = searchParams.get('mes');
    const ano = searchParams.get('ano');

    if (!congregacaoId || !mes || !ano) {
      return NextResponse.json(
        { error: 'congregacaoId, mes e ano são obrigatórios' },
        { status: 400 }
      );
    }

    const saldo = await getSaldoAnterior(
      congregacaoId,
      parseInt(mes),
      parseInt(ano)
    );
    return NextResponse.json({ valor: saldo });
  } catch (error) {
    console.error('Erro ao buscar saldo anterior:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar saldo anterior' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { congregacaoId, mes, ano, valor } = await request.json();

    if (!congregacaoId || mes === undefined || ano === undefined || valor === undefined) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    await setSaldoAnterior(congregacaoId, mes, ano, valor);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar saldo anterior:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar saldo anterior' },
      { status: 500 }
    );
  }
}
