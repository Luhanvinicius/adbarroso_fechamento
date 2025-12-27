import { NextRequest, NextResponse } from 'next/server';
import { getRelatorioMensal } from '@/lib/db-operations-supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const congregacaoId = searchParams.get('congregacaoId');
    const mes = searchParams.get('mes');
    const ano = searchParams.get('ano');

    console.log('GET /api/relatorios:', { congregacaoId, mes, ano });

    if (!congregacaoId || !mes || !ano) {
      console.error('Parâmetros faltando:', { congregacaoId, mes, ano });
      return NextResponse.json(
        { error: 'congregacaoId, mes e ano são obrigatórios' },
        { status: 400 }
      );
    }

    const relatorio = await getRelatorioMensal(
      congregacaoId,
      parseInt(mes),
      parseInt(ano)
    );
    
    console.log('Relatório retornado:', relatorio);
    
    return NextResponse.json(relatorio);
  } catch (error: any) {
    console.error('Erro ao buscar relatório:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar relatório' },
      { status: 500 }
    );
  }
}
