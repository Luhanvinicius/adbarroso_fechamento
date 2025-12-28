import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Corrigindo valores exatamente como na planilha...\n');

    // Buscar ID da congregação Pici
    const { data: pici } = await supabaseAdmin
      .from('congregacoes')
      .select('id, name')
      .ilike('name', 'Pici')
      .maybeSingle();

    if (!pici) {
      return NextResponse.json({ error: 'Congregação Pici não encontrada!' }, { status: 404 });
    }

    // Buscar usuário Pr. Júnior
    const { data: usuario } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('email', 'prjunior@adbarroso.com')
      .maybeSingle();

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário Pr. Júnior não encontrado!' }, { status: 404 });
    }

    // DELETAR todas as movimentações de Nov/2025 da Pici
    console.log('🗑️  Removendo movimentações antigas de Nov/2025...');
    const { error: deleteError } = await supabaseAdmin
      .from('movimentacoes')
      .delete()
      .eq('congregacao_id', pici.id)
      .eq('mes', 11)
      .eq('ano', 2025);

    if (deleteError) {
      console.error('❌ Erro ao deletar movimentações:', deleteError);
      return NextResponse.json({ error: 'Erro ao deletar movimentações', details: deleteError }, { status: 500 });
    }
    console.log('✅ Movimentações antigas removidas!\n');

    // Inserir TODAS as movimentações exatamente como na planilha
    // Valores da planilha: Dízimo 590,00 | Ofertas 111,50 | Total 701,50
    const movimentacoesExatas = [
      // Dia 2
      { dia: 2, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração - Oferta de 3,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 3.00 },
      
      // Dia 5 - 3 movimentações
      { dia: 5, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria - Dizimo Levi - 100 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 100.00 },
      { dia: 5, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria - Dizimo Samuel- 100 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 100.00 },
      { dia: 5, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria - Ofertas 4,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 4.00 },
      
      // Dia 7
      { dia: 7, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 7,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 7.00 },
      
      // Dia 12
      { dia: 12, mes: 11, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 4,50 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 4.50 },
      
      // Dia 14
      { dia: 14, mes: 11, ano: 2025, descricao: 'Rec. Culto de Santa Ceia - Oferas 16,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 16.00 },
      
      // Dia 16 - 3 movimentações
      { dia: 16, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração - Ofertas 12,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 12.00 },
      { dia: 16, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração- Dizimo Levi - 50 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 50.00 },
      { dia: 16, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração- Dizimo Samuel- 50 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 50.00 },
      
      // Dia 19
      { dia: 19, mes: 11, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 7,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 7.00 },
      
      // Dia 20 - Saída
      { dia: 20, mes: 11, ano: 2025, descricao: 'Pg. Pagamento Agua - 52,89', tipo: 'saida', categoria_entrada: null, valor: 52.89 },
      
      // Dia 21
      { dia: 21, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 9,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 9.00 },
      
      // Dia 23
      { dia: 23, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração- Ofertas 31,00 reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 31.00 },
      
      // Dia 26 - 2 movimentações
      { dia: 26, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria- dizimo aurineide 50,00', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 50.00 },
      { dia: 26, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria- Ofertas 12,00', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 12.00 },
      
      // Dia 28
      { dia: 28, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 3,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 3.00 },
      
      // Dia 30 - 5 movimentações
      // Na planilha, dia 30 mostra "Rec. Culto de Doutrina - Ofertas 16,00 Reais" na descrição
      // mas o valor na coluna OFERTAS é 3,00 (não 16,00) - isso faz o total bater com 111,50
      { dia: 30, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 16,00 Reais', tipo: 'entrada', categoria_entrada: 'ofertas', valor: 3.00 },
      { dia: 30, mes: 11, ano: 2025, descricao: 'Pg. compra de 4 garrafão de agua - 11 reais', tipo: 'saida', categoria_entrada: null, valor: 11.00 },
      { dia: 30, mes: 11, ano: 2025, descricao: 'Pg. pagamento conta de Luz - 28,52', tipo: 'saida', categoria_entrada: null, valor: 28.52 },
      { dia: 30, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Pr Junior- 140 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 140.00 },
      { dia: 30, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Robson - 100 reais', tipo: 'entrada', categoria_entrada: 'dizimo', valor: 100.00 },
    ];

    console.log(`📝 Inserindo ${movimentacoesExatas.length} movimentações...\n`);

    // Inserir todas de uma vez
    const movimentacoesParaInserir = movimentacoesExatas.map(mov => ({
      ...mov,
      congregacao_id: pici.id,
      user_id: usuario.id,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('movimentacoes')
      .insert(movimentacoesParaInserir);

    if (insertError) {
      console.error('❌ Erro ao inserir movimentações:', insertError);
      return NextResponse.json({ error: 'Erro ao inserir movimentações', details: insertError }, { status: 500 });
    }

    // Verificar totais
    const { data: movimentacoesFinais } = await supabaseAdmin
      .from('movimentacoes')
      .select('*')
      .eq('congregacao_id', pici.id)
      .eq('mes', 11)
      .eq('ano', 2025);

    let totalDizimo = 0;
    let totalOfertas = 0;
    let totalEntradas = 0;
    let totalSaidas = 0;

    movimentacoesFinais?.forEach(mov => {
      if (mov.tipo === 'entrada') {
        totalEntradas += parseFloat(mov.valor);
        if (mov.categoria_entrada === 'dizimo') {
          totalDizimo += parseFloat(mov.valor);
        } else if (mov.categoria_entrada === 'ofertas') {
          totalOfertas += parseFloat(mov.valor);
        }
      } else {
        totalSaidas += parseFloat(mov.valor);
      }
    });

    const resultado = {
      success: true,
      message: 'Valores corrigidos com sucesso!',
      totais: {
        dizimo: totalDizimo.toFixed(2),
        ofertas: totalOfertas.toFixed(2),
        totalEntradas: totalEntradas.toFixed(2),
        totalSaidas: totalSaidas.toFixed(2),
        saldoFinal: (totalEntradas - totalSaidas).toFixed(2),
      },
      esperado: {
        dizimo: '590,00',
        ofertas: '111,50',
        totalEntradas: '701,50',
        totalSaidas: '92,41',
        saldoFinal: '609,09',
      },
      movimentacoesInseridas: movimentacoesFinais?.length || 0,
    };

    console.log('✅ Valores corrigidos:', resultado);

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ error: 'Erro ao corrigir valores', details: error.message }, { status: 500 });
  }
}


