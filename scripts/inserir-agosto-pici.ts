// Script para inserir movimentações de Agosto/2025 para a congregação Pici
// Execute: npx tsx scripts/inserir-agosto-pici.ts

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

async function inserirAgostoPici() {
  try {
    console.log('🌱 Inserindo movimentações de Agosto/2025 para Pici...\n');

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

    // Verificar se já existem movimentações de Agosto/2025 para Pici
    const { data: movimentacoesExistentes } = await supabaseAdmin
      .from('movimentacoes')
      .select('id')
      .eq('congregacao_id', pici.id)
      .eq('mes', 8)
      .eq('ano', 2025);

    if (movimentacoesExistentes && movimentacoesExistentes.length > 0) {
      console.log(`⚠️  ATENÇÃO: Já existem ${movimentacoesExistentes.length} movimentações de Agosto/2025 para Pici!`);
      console.log('   Deseja continuar mesmo assim? As novas movimentações serão adicionadas.\n');
    }

    // Dados das movimentações de Agosto/2025 conforme a imagem
    const movimentacoesData = [
      {
        dia: 1,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de doutrina - Oferta de 15 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 15.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 3,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Oferta 20 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 20.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 3,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Dizimo - Samuel 100R$',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 3,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Dizimo- levi 100R$',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 7,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Dizimo - elenelda 152R$',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 152.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 7,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Ofertas 05 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 5.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 8,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Santa Ceia - Ofertas 20,50',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 20.50,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 10,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Oferta de 8 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 8.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 13,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Oferta de10 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 10.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 14,
        mes: 8,
        ano: 2025,
        descricao: 'Pg. Conta de agua - 27 reais e 54 centavos',
        tipo: 'saida' as const,
        valor: 27.54,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 14,
        mes: 8,
        ano: 2025,
        descricao: 'Pg. Conta de Energia - 52 Reais e 97 Centavos',
        tipo: 'saida' as const,
        valor: 52.97,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 15,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Ofertas 07 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 7.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 17,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração- Dizimo - Samuel 60R$',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 60.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 17,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Dizimo - Levi 50R$',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 50.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 17,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração- Ofertas 06 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 6.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 22,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Oferta de 05 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 5.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 24,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Oferta 12 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 12.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 27,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Oferta de 03 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 3.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 29,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Oferta 09 Reais e 50 Centavos',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 9.50,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 31,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Dizimo - Ivoneide 150 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 150.00,
        congregacaoId: pici.id,
        userId: usuario.id,
      },
      {
        dia: 31,
        mes: 8,
        ano: 2025,
        descricao: 'Rec. Culto de Adoração - Oferta - 32 Reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 32.00,
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
        console.log(`  ✓ ${mov.dia}/08 - ${mov.descricao.substring(0, 50)}...`);
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
      .eq('mes', 8)
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

      console.log(`\n📊 Resumo de Agosto/2025 - Pici:`);
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

inserirAgostoPici();


