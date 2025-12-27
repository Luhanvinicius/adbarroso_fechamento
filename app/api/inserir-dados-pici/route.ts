import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createMovimentacao } from '@/lib/db-operations-supabase';

// Dados consolidados de todos os meses
const todosOsDados = {
  agosto: [
    { dia: 1, mes: 8, ano: 2025, descricao: 'Rec. Culto de doutrina - Oferta de 15 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 15.00 },
    { dia: 3, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Oferta 20 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 20.00 },
    { dia: 3, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Dizimo - Samuel 100R$', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 3, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Dizimo- levi 100R$', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 7, mes: 8, ano: 2025, descricao: 'Rec. Culto da Vitoria - Dizimo - elenelda 152R$', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 152.00 },
    { dia: 7, mes: 8, ano: 2025, descricao: 'Rec. Culto da Vitoria - Ofertas 05 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 5.00 },
    { dia: 8, mes: 8, ano: 2025, descricao: 'Rec. Santa Ceia - Ofertas 20,50', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 20.50 },
    { dia: 10, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Oferta de 8 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 8.00 },
    { dia: 13, mes: 8, ano: 2025, descricao: 'Rec. Culto da Vitoria - Oferta de10 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 10.00 },
    { dia: 14, mes: 8, ano: 2025, descricao: 'Pg. Conta de agua - 27 reais e 54 centavos', tipo: 'saida' as const, valor: 27.54 },
    { dia: 14, mes: 8, ano: 2025, descricao: 'Pg. Conta de Energia - 52 Reais e 97 Centavos', tipo: 'saida' as const, valor: 52.97 },
    { dia: 15, mes: 8, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 07 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 7.00 },
    { dia: 17, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração- Dizimo - Samuel 60R$', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 60.00 },
    { dia: 17, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Dizimo - Levi 50R$', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 17, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração- Ofertas 06 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 6.00 },
    { dia: 22, mes: 8, ano: 2025, descricao: 'Rec. Culto de Doutrina - Oferta de 05 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 5.00 },
    { dia: 24, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Oferta 12 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 27, mes: 8, ano: 2025, descricao: 'Rec. Culto da Vitoria - Oferta de 03 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 3.00 },
    { dia: 29, mes: 8, ano: 2025, descricao: 'Rec. Culto de Doutrina - Oferta 09 Reais e 50 Centavos', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 9.50 },
    { dia: 31, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Dizimo - Ivoneide 150 Reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 150.00 },
    { dia: 31, mes: 8, ano: 2025, descricao: 'Rec. Culto de Adoração - Oferta - 32 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 32.00 },
  ],
  setembro: [
    { dia: 3, mes: 9, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 6,50', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 6.50 },
    { dia: 3, mes: 9, ano: 2025, descricao: 'Rec. Culto da vitoria- Dizimo Samuel 100 Reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 3, mes: 9, ano: 2025, descricao: 'Rec. Culto da vitoria- Dizimo Levi - 100 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 5, mes: 9, ano: 2025, descricao: 'Rec. Culto de Doutrina - Oferta 07 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 7.00 },
    { dia: 7, mes: 9, ano: 2025, descricao: 'Rec. Culto de adoração- Ofertas 12Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 10, mes: 9, ano: 2025, descricao: 'Rec. Culto da Vitoria - Ofertas 12Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 15, mes: 9, ano: 2025, descricao: 'Pg. Pagamento - Agua', tipo: 'saida' as const, valor: 52.98 },
    { dia: 17, mes: 9, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 5 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 5.00 },
    { dia: 19, mes: 9, ano: 2025, descricao: 'Rec. Culto de Doutrina - Oferta 15 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 15.00 },
    { dia: 19, mes: 9, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Samuel 50 Reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 19, mes: 9, ano: 2025, descricao: 'Rec. Culto de doutrina - Dizimo Samuel 50 Reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 21, mes: 9, ano: 2025, descricao: 'Rec. Culto da vitoria- Ofertas 10 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 10.00 },
    { dia: 24, mes: 9, ano: 2025, descricao: 'Pg. Pagamento - luz', tipo: 'saida' as const, valor: 20.58 },
    { dia: 24, mes: 9, ano: 2025, descricao: 'Rec. Culto de Doutrina - Oferta 07 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 7.00 },
    { dia: 28, mes: 9, ano: 2025, descricao: 'Rec. Culto de adoração- Ofertas 12Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 28, mes: 9, ano: 2025, descricao: 'Rec. Culto de adoração- dizimo - Pr Junior', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 150.00 },
    { dia: 28, mes: 9, ano: 2025, descricao: 'Rec. Culto de adoração- dizimo - Luhan', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 28, mes: 9, ano: 2025, descricao: 'Rec. Culto de adoração- dizimo - ivoneide 150', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 150.00 },
  ],
  outubro: [
    { dia: 1, mes: 10, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 5,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 5.00 },
    { dia: 3, mes: 10, ano: 2025, descricao: 'Rec. Culto da doutrina- Dizimo Levi - 100 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 3, mes: 10, ano: 2025, descricao: 'Rec. Culto da doutrina- Dizimo Samuel- 100 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 5, mes: 10, ano: 2025, descricao: 'Rec. Culto de adoração- Ofertas 9,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 9.00 },
    { dia: 13, mes: 10, ano: 2025, descricao: 'Pg. Pagamento - Agua', tipo: 'saida' as const, valor: 52.97 },
    { dia: 15, mes: 10, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 1 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 1.00 },
    { dia: 17, mes: 10, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Samuel 50 Reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 17, mes: 10, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Levi 60 Reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 60.00 },
    { dia: 17, mes: 10, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Iracema 60 Reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 60.00 },
    { dia: 19, mes: 10, ano: 2025, descricao: 'Rec. Culto de adoração- Ofertas 12,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 21, mes: 10, ano: 2025, descricao: 'Pg. Pagamento - luz', tipo: 'saida' as const, valor: 25.25 },
    { dia: 22, mes: 10, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 25,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 25.00 },
    { dia: 24, mes: 10, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 12,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 26, mes: 10, ano: 2025, descricao: 'Rec. Culto de adoração- Ofertas 14,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 14.00 },
    { dia: 26, mes: 10, ano: 2025, descricao: 'Rec. Culto de adoração- dizimo aurineide 70,00', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 70.00 },
    { dia: 26, mes: 10, ano: 2025, descricao: 'Rec. Culto de adoração- oferta especial Cristina', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 50.00 },
    { dia: 29, mes: 10, ano: 2025, descricao: 'Rec. Culto da vitoria- Dizimo da Eleneuda', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 150.00 },
  ],
  novembro: [
    { dia: 2, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração - Oferta de 3,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 3.00 },
    { dia: 5, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria - Dizimo Levi - 100 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 5, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria - Dizimo Samuel- 100 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
    { dia: 5, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria - Ofertas 4,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 4.00 },
    { dia: 7, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 7,00 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 7.00 },
    { dia: 12, mes: 11, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 4,50 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 4.50 },
    { dia: 14, mes: 11, ano: 2025, descricao: 'Rec. Culto de Santa Ceia - Oferas 16,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 16.00 },
    { dia: 16, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração - Ofertas 12,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 16, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração- Dizimo Levi - 50 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 16, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração- Dizimo Samuel- 50 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 19, mes: 11, ano: 2025, descricao: 'Rec. Culto da vitoria- Oferta de 7,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 7.00 },
    { dia: 20, mes: 11, ano: 2025, descricao: 'Pg. Pagamento Agua - 52,89', tipo: 'saida' as const, valor: 52.89 },
    { dia: 21, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 9,00 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 9.00 },
    { dia: 23, mes: 11, ano: 2025, descricao: 'Rec. Culto de adoração- Ofertas 31,00 reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 31.00 },
    { dia: 26, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria- dizimo aurineide 50,00', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 50.00 },
    { dia: 26, mes: 11, ano: 2025, descricao: 'Rec. Culto da Vitoria- Ofertas 12,00', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 12.00 },
    { dia: 28, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 3,00 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 3.00 },
    { dia: 30, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Ofertas 16,00 Reais', tipo: 'entrada' as const, categoriaEntrada: 'ofertas' as const, valor: 16.00 },
    { dia: 30, mes: 11, ano: 2025, descricao: 'Pg. compra de 4 garrafão de agua - 11 reais', tipo: 'saida' as const, valor: 11.00 },
    { dia: 30, mes: 11, ano: 2025, descricao: 'Pg. pagamento conta de Luz - 28,52', tipo: 'saida' as const, valor: 28.52 },
    { dia: 30, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Pr Junior- 140 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 140.00 },
    { dia: 30, mes: 11, ano: 2025, descricao: 'Rec. Culto de Doutrina - Dizimo Robson - 100 reais', tipo: 'entrada' as const, categoriaEntrada: 'dizimo' as const, valor: 100.00 },
  ],
};

// Função compartilhada para inserir dados
async function inserirDados() {
  console.log('🌱 Inserindo TODOS os dados de Agosto, Setembro, Outubro e Novembro/2025 para Pici...');

  // Buscar ID da congregação Pici
  const { data: pici, error: errorPici } = await supabaseAdmin
    .from('congregacoes')
    .select('id, name')
    .ilike('name', 'Pici')
    .single();

  if (errorPici || !pici) {
    throw new Error('Congregação Pici não encontrada');
  }

  // Buscar usuário
  let { data: usuario } = await supabaseAdmin
    .from('users')
    .select('id, name, email')
    .eq('email', 'prjunior@adbarroso.com')
    .single();

  if (!usuario) {
    const { data: usuariosPici } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('congregacao_id', pici.id)
      .limit(1);

    if (usuariosPici && usuariosPici.length > 0) {
      usuario = usuariosPici[0];
    } else {
      const { data: admin } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (!admin) {
        throw new Error('Nenhum usuário encontrado');
      }
      usuario = admin;
    }
  }

  // Inserir dados de forma idempotente (sem deletar dados existentes)
  const resultados: any = {};
  let totalInserido = 0;
  let totalErros = 0;
  let totalIgnorados = 0;

  for (const [mesNome, dados] of Object.entries(todosOsDados)) {
    const mes = dados[0].mes;
    const ano = dados[0].ano;
    
    // Verificar quantas movimentações já existem para este mês/ano
    const { data: existentes } = await supabaseAdmin
      .from('movimentacoes')
      .select('id, dia, mes, ano, descricao, valor')
      .eq('congregacao_id', pici.id)
      .eq('mes', mes)
      .eq('ano', ano);

    const movimentacoesExistentes = existentes || [];
    
    // Inserir apenas dados que não existem (verificar por dia, descrição e valor)
    let sucesso = 0;
    let erros = 0;
    let ignorados = 0;

    for (const mov of dados) {
      // Verificar se já existe uma movimentação com mesmo dia, descrição e valor
      const jaExiste = movimentacoesExistentes.some(
        (existente: any) =>
          existente.dia === mov.dia &&
          existente.descricao === mov.descricao &&
          parseFloat(existente.valor) === mov.valor
      );

      if (jaExiste) {
        ignorados++;
        totalIgnorados++;
        continue; // Pular se já existe
      }

      try {
        await createMovimentacao({
          ...mov,
          congregacaoId: pici.id,
          userId: usuario.id,
        });
        sucesso++;
        totalInserido++;
      } catch (error: any) {
        erros++;
        totalErros++;
        console.error(`Erro ao criar movimentação do dia ${mov.dia}:`, error.message);
      }
    }

    resultados[mesNome] = { sucesso, erros, ignorados, existentes: movimentacoesExistentes.length };
  }

  return {
    success: true,
    message: 'Dados inseridos com sucesso (sem deletar dados existentes)',
    totalInserido,
    totalErros,
    totalIgnorados,
    resultados,
    nota: 'Dados existentes foram preservados. Apenas novos dados foram inseridos.',
  };
}

export async function GET() {
  try {
    const resultado = await inserirDados();
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro ao inserir dados:', error);
    return NextResponse.json(
      { error: 'Erro ao inserir dados', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const resultado = await inserirDados();
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro ao inserir dados:', error);
    return NextResponse.json(
      { error: 'Erro ao inserir dados', details: error.message },
      { status: 500 }
    );
  }
}

