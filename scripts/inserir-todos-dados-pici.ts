// Script consolidado para inserir TODOS os dados de Agosto, Setembro, Outubro e Novembro/2025 para Pici
// Execute: node --import tsx scripts/inserir-todos-dados-pici.ts
// Este script insere os dados diretamente no Supabase de produção

// IMPORTANTE: Carregar variáveis de ambiente ANTES de qualquer import que dependa delas
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  let loadedCount = 0;
  envFile.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (key && cleanValue) {
          process.env[key] = cleanValue;
          loadedCount++;
        }
      }
    }
  });
  console.log(`✅ ${loadedCount} variáveis de ambiente carregadas do .env.local`);
  
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!hasUrl || !hasAnonKey || !hasServiceKey) {
    console.error('\n❌ Variáveis essenciais não encontradas!');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', hasUrl ? '✓' : '✗');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasAnonKey ? '✓' : '✗');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', hasServiceKey ? '✓' : '✗');
    process.exit(1);
  }
  
  console.log('✅ Todas as variáveis essenciais carregadas com sucesso!');
  console.log(`📍 Conectando ao Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);
} else {
  console.error('❌ Arquivo .env.local não encontrado em:', envPath);
  process.exit(1);
}

import { supabaseAdmin } from '../lib/supabase';
import { createMovimentacao } from '../lib/db-operations-supabase';

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

async function inserirTodosDadosPici() {
  try {
    console.log('🌱 Inserindo TODOS os dados de Agosto, Setembro, Outubro e Novembro/2025 para Pici...\n');

    // Buscar ID da congregação Pici
    const { data: pici, error: errorPici } = await supabaseAdmin
      .from('congregacoes')
      .select('id, name')
      .ilike('name', 'Pici')
      .single();

    if (errorPici || !pici) {
      console.error('❌ Erro ao buscar congregação Pici:', errorPici);
      process.exit(1);
    }

    console.log(`✅ Congregação Pici encontrada: ${pici.id}\n`);

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
          console.error('❌ Nenhum usuário encontrado!');
          process.exit(1);
        }
        usuario = admin;
      }
    }

    console.log(`✅ Usuário encontrado: ${usuario.name} (${usuario.email})\n`);

    // Verificar e limpar dados existentes antes de inserir
    console.log('🔍 Verificando dados existentes...\n');
    
    for (const [mesNome, dados] of Object.entries(todosOsDados)) {
      const mes = dados[0].mes;
      const ano = dados[0].ano;
      
      const { data: existentes } = await supabaseAdmin
        .from('movimentacoes')
        .select('id')
        .eq('congregacao_id', pici.id)
        .eq('mes', mes)
        .eq('ano', ano);

      if (existentes && existentes.length > 0) {
        console.log(`⚠️  Encontradas ${existentes.length} movimentações existentes para ${mesNome}/${ano}`);
        console.log(`   Removendo dados antigos...`);
        
        const { error: deleteError } = await supabaseAdmin
          .from('movimentacoes')
          .delete()
          .eq('congregacao_id', pici.id)
          .eq('mes', mes)
          .eq('ano', ano);

        if (deleteError) {
          console.error(`   ❌ Erro ao remover: ${deleteError.message}`);
        } else {
          console.log(`   ✅ Dados antigos removidos\n`);
        }
      }
    }

    // Inserir todos os dados
    let totalInserido = 0;
    let totalErros = 0;

    for (const [mesNome, dados] of Object.entries(todosOsDados)) {
      console.log(`📝 Inserindo dados de ${mesNome.toUpperCase()}...`);
      
      let sucesso = 0;
      let erros = 0;

      for (const mov of dados) {
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
          console.error(`   ✗ Erro ao criar movimentação do dia ${mov.dia}:`, error.message);
        }
      }

      console.log(`   ✅ ${sucesso} movimentações criadas`);
      if (erros > 0) {
        console.log(`   ⚠️  ${erros} erros encontrados`);
      }
      console.log('');
    }

    console.log(`\n✅ Processo concluído!`);
    console.log(`   - Total inserido: ${totalInserido} movimentações`);
    if (totalErros > 0) {
      console.log(`   - Total de erros: ${totalErros}`);
    }

    // Verificar totais por mês
    console.log('\n📊 Resumo por mês:\n');
    
    for (const [mesNome, dados] of Object.entries(todosOsDados)) {
      const mes = dados[0].mes;
      const ano = dados[0].ano;
      
      const { data: movimentacoesFinais } = await supabaseAdmin
        .from('movimentacoes')
        .select('*')
        .eq('congregacao_id', pici.id)
        .eq('mes', mes)
        .eq('ano', ano);

      if (movimentacoesFinais && movimentacoesFinais.length > 0) {
        const entradas = movimentacoesFinais.filter(m => m.tipo === 'entrada');
        const saidas = movimentacoesFinais.filter(m => m.tipo === 'saida');
        
        const totalDizimo = entradas
          .filter(e => e.categoria_entrada === 'dizimo')
          .reduce((sum, e) => sum + parseFloat(e.valor), 0);
        
        const totalOfertas = entradas
          .filter(e => e.categoria_entrada === 'ofertas')
          .reduce((sum, e) => sum + parseFloat(e.valor), 0);
        
        const totalEntradas = entradas.reduce((sum, e) => sum + parseFloat(e.valor), 0);
        const totalSaidas = saidas.reduce((sum, s) => sum + parseFloat(s.valor), 0);
        const saldoFinal = totalEntradas - totalSaidas;

        console.log(`   ${mesNome.toUpperCase()}/${ano}:`);
        console.log(`     - Dízimo: R$ ${totalDizimo.toFixed(2)}`);
        console.log(`     - Ofertas: R$ ${totalOfertas.toFixed(2)}`);
        console.log(`     - Entradas: R$ ${totalEntradas.toFixed(2)}`);
        console.log(`     - Saídas: R$ ${totalSaidas.toFixed(2)}`);
        console.log(`     - Saldo: R$ ${saldoFinal.toFixed(2)}`);
        console.log(`     - Movimentações: ${movimentacoesFinais.length}\n`);
      }
    }

    console.log('✅ Todos os dados foram inseridos no Supabase de produção!');
    console.log('📍 Os dados estão agora persistidos e não serão perdidos em novos deploys.\n');
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }
}

inserirTodosDadosPici();

