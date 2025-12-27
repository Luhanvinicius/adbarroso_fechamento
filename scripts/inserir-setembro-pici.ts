// Script para inserir movimentações de Setembro/2025 para a congregação Pici
// Execute: npx tsx scripts/inserir-setembro-pici.ts

// IMPORTANTE: Carregar variáveis de ambiente ANTES de qualquer import que dependa delas
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  let loadedCount = 0;
  envFile.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    // Ignorar linhas vazias e comentários
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        // Remover aspas se houver
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (key && cleanValue) {
          process.env[key] = cleanValue;
          loadedCount++;
        }
      }
    }
  });
  console.log(`✅ ${loadedCount} variáveis de ambiente carregadas do .env.local`);
  
  // Verificar se as variáveis essenciais foram carregadas
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!hasUrl || !hasAnonKey) {
    console.error('\n❌ Variáveis essenciais não encontradas!');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', hasUrl ? '✓' : '✗');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasAnonKey ? '✓' : '✗');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', hasServiceKey ? '✓' : '✗');
    console.log('\n📝 Verifique se o arquivo .env.local contém essas variáveis.');
    process.exit(1);
  }
  
  console.log('✅ Todas as variáveis essenciais carregadas com sucesso!');
} else {
  console.error('❌ Arquivo .env.local não encontrado em:', envPath);
  console.log('📝 Crie o arquivo .env.local na raiz do projeto com as variáveis de ambiente.');
  process.exit(1);
}

// Agora sim, importar módulos que dependem das variáveis de ambiente
import { supabaseAdmin } from '../lib/supabase';
import { createMovimentacao } from '../lib/db-operations-supabase';

async function inserirSetembroPici() {
  try {
    console.log('🌱 Inserindo movimentações de Setembro/2025 para Pici...\n');

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

    // Buscar um usuário para vincular as movimentações
    // Tentar primeiro o Pr. Júnior, depois qualquer usuário vinculado à Pici
    let { data: usuario } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', 'prjunior@adbarroso.com')
      .single();

    if (!usuario) {
      // Se não encontrar, buscar qualquer usuário vinculado à Pici
      const { data: usuariosPici } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .eq('congregacao_id', pici.id)
        .limit(1);

      if (usuariosPici && usuariosPici.length > 0) {
        usuario = usuariosPici[0];
      } else {
        // Se ainda não encontrar, buscar qualquer usuário admin
        const { data: admin } = await supabaseAdmin
          .from('users')
          .select('id, name, email')
          .eq('role', 'admin')
          .limit(1)
          .single();

        if (!admin) {
          console.error('❌ Nenhum usuário encontrado para vincular as movimentações!');
          process.exit(1);
        }
        usuario = admin;
      }
    }

    console.log(`✅ Usuário encontrado: ${usuario.name} (${usuario.email})\n`);

    // Verificar se já existem movimentações de Setembro/2025 para Pici
    const { data: movimentacoesExistentes } = await supabaseAdmin
      .from('movimentacoes')
      .select('id')
      .eq('congregacao_id', pici.id)
      .eq('mes', 9)
      .eq('ano', 2025);

    if (movimentacoesExistentes && movimentacoesExistentes.length > 0) {
      console.log(`⚠️  ATENÇÃO: Já existem ${movimentacoesExistentes.length} movimentações de Setembro/2025 para Pici!`);
      console.log('   Deseja continuar mesmo assim? As novas movimentações serão adicionadas.\n');
    }

    // Dados das movimentações de Setembro/2025 (baseado nos dados de agosto)
    const movimentacoesData = [
      {
        dia: 3,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto da vitoria- Oferta de 6,50',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 6.50,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 3,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto da vitoria- Dizimo Samuel 100 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 3,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto da vitoria- Dizimo Levi - 100 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 5,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Oferta 07 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 7.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 7,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de adoração- Ofertas 12Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 12.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 10,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Ofertas 12Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 12.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 15,
        mes: 9,
        ano: 2025,
        descricao: 'Pg. Pagamento - Agua',
        tipo: 'saida' as const,
        valor: 52.98,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 17,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto da vitoria- Oferta de 5 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 5.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 19,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Oferta 15 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 15.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 19,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Dizimo Samuel 50 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 50.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 19,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de doutrina - Dizimo Samuel 50 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 50.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 21,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto da vitoria- Ofertas 10 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 10.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 24,
        mes: 9,
        ano: 2025,
        descricao: 'Pg. Pagamento - luz',
        tipo: 'saida' as const,
        valor: 20.58,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 24,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Oferta 07 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 7.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 28,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de adoração- Ofertas 12Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 12.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 28,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de adoração- dizimo - Pr Junior',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 150.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 28,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de adoração- dizimo - Luhan',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 50.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 28,
        mes: 9,
        ano: 2025,
        descricao: 'Rec. Culto de adoração- dizimo - ivoneide 150',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 150.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
    ];

    console.log(`📝 Criando ${movimentacoesData.length} movimentações...\n`);

    let sucesso = 0;
    let erros = 0;

    for (const mov of movimentacoesData) {
      try {
        await createMovimentacao(mov);
        sucesso++;
        console.log(`  ✓ ${mov.dia}/09 - ${mov.descricao.substring(0, 50)}...`);
      } catch (error: any) {
        erros++;
        console.error(`  ✗ Erro ao criar movimentação do dia ${mov.dia}:`, error.message);
      }
    }

    console.log(`\n✅ Processo concluído!`);
    console.log(`   - ${sucesso} movimentações criadas com sucesso`);
    if (erros > 0) {
      console.log(`   - ${erros} erros encontrados`);
    }

    // Verificar totais
    const { data: movimentacoesFinais } = await supabaseAdmin
      .from('movimentacoes')
      .select('*')
      .eq('congregacao_id', pici.id)
      .eq('mes', 9)
      .eq('ano', 2025);

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

      console.log(`\n📊 Resumo de Setembro/2025 - Pici:`);
      console.log(`   - Total Dízimo: R$ ${totalDizimo.toFixed(2)}`);
      console.log(`   - Total Ofertas: R$ ${totalOfertas.toFixed(2)}`);
      console.log(`   - Total Entradas: R$ ${totalEntradas.toFixed(2)}`);
      console.log(`   - Total Saídas: R$ ${totalSaidas.toFixed(2)}`);
      console.log(`   - Saldo Final: R$ ${saldoFinal.toFixed(2)}`);
      console.log(`   - Total de movimentações: ${movimentacoesFinais.length}`);
    }
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }
}

inserirSetembroPici();

