// Script para popular o banco de dados com dados iniciais
// Execute: npx tsx scripts/seed.ts

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
import { createCongregacao, createUser, createMovimentacao } from '../lib/db-operations-supabase';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Verificar se as tabelas existem antes de continuar
    console.log('🔍 Verificando se as tabelas existem...');
    const { error: checkError } = await supabaseAdmin
      .from('congregacoes')
      .select('id')
      .limit(1);
    
    if (checkError) {
      if (checkError.code === 'PGRST205' || checkError.message.includes('not found')) {
        console.error('\n❌ ERRO: As tabelas não existem no Supabase!');
        console.error('\n📝 AÇÃO NECESSÁRIA:');
        console.error('   1. Acesse: https://supabase.com/dashboard');
        console.error('   2. Selecione seu projeto');
        console.error('   3. Vá em "SQL Editor"');
        console.error('   4. Copie e cole TODO o conteúdo do arquivo: supabase/schema.sql');
        console.error('   5. Clique em "Run"');
        console.error('   6. Aguarde a confirmação de sucesso');
        console.error('   7. Execute este comando novamente: npm run seed\n');
        console.error('💡 Dica: Execute "npm run check-tables" para verificar se as tabelas foram criadas.\n');
        process.exit(1);
      }
    }
    console.log('✅ Tabelas verificadas!\n');

    // Limpar dados existentes (cuidado em produção!)
    console.log('🗑️  Limpando dados existentes...');
    try {
      await supabaseAdmin.from('movimentacoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('saldos_anteriores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('congregacoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (cleanError: any) {
      // Ignorar erros de limpeza se não houver dados
      if (!cleanError.message.includes('not found')) {
        console.warn('⚠️  Aviso ao limpar:', cleanError.message);
      }
    }

    // Criar congregações
    console.log('📋 Criando congregações...');
    const congregacoesData = [
      { name: 'Pici', campo: 'Barroso II' },
      { name: 'Potengi', campo: 'Barroso II' },
      { name: 'Nova Assunção', campo: 'Barroso II' },
      { name: 'Novo Barroso', campo: 'Barroso II' },
      { name: 'Sede', campo: 'Barroso II' },
      { name: 'Jangurussu', campo: 'Barroso II' },
      { name: 'Vila Ema', campo: 'Barroso II' },
    ];

    const createdCongregacoes = [];
    for (const cong of congregacoesData) {
      const created = await createCongregacao(cong);
      createdCongregacoes.push(created);
      console.log(`  ✓ ${created.name}`);
    }

    // Criar usuários
    console.log('👥 Criando usuários...');
    const usersData = [
      {
        name: 'Admin Sistema',
        email: 'admin@adbarroso.com',
        password: 'admin123',
        role: 'admin' as const,
        campo: 'Barroso II',
        congregacaoId: undefined,
      },
      {
        name: 'Pr. Presidente do Campo',
        email: 'presidente@adbarroso.com',
        password: 'pres123',
        role: 'presidente_campo' as const,
        campo: 'Barroso II',
        congregacaoId: undefined,
      },
      {
        name: 'Pr. Júnior',
        email: 'prjunior@adbarroso.com',
        password: 'pr123',
        role: 'pastor' as const,
        campo: 'Barroso II',
        congregacaoId: createdCongregacoes.find(c => c.name === 'Pici')?.id,
      },
      {
        name: 'Tesoureiro Campo',
        email: 'tesoureiro@adbarroso.com',
        password: 'tes123',
        role: 'tesoureiro_campo' as const,
        campo: 'Barroso II',
        congregacaoId: undefined,
      },
      {
        name: 'Tesoureiro Pici',
        email: 'tespici@adbarroso.com',
        password: 'tes123',
        role: 'tesoureiro_congregacao' as const,
        campo: 'Barroso II',
        congregacaoId: createdCongregacoes.find(c => c.name === 'Pici')?.id,
      },
      {
        name: 'Líder Sede',
        email: 'lider@adbarroso.com',
        password: 'lider123',
        role: 'lider_congregacao' as const,
        campo: 'Barroso II',
        congregacaoId: createdCongregacoes.find(c => c.name === 'Sede')?.id,
      },
    ];

    const createdUsers = [];
    for (const user of usersData) {
      const created = await createUser(user);
      createdUsers.push(created);
      console.log(`  ✓ ${created.name} (${created.email})`);
    }

    // Criar movimentações de exemplo (Novembro 2025 - Sede)
    console.log('💰 Criando movimentações de exemplo...');
    const sedeId = createdCongregacoes.find(c => c.name === 'Sede')?.id!;
    const userId = createdUsers.find(u => u.email === 'prjunior@adbarroso.com')?.id!;

    const movimentacoesData = [
      {
        dia: 2,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto de adoração - Oferta de 3,00 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'ofertas' as const,
        valor: 3.00,
        congregacaoId: sedeId,
        userId: userId,
      },
      {
        dia: 5,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Dizimo Levi - 100 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: sedeId,
        userId: userId,
      },
      {
        dia: 5,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto da Vitoria - Dizimo Samuel- 100 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 100.00,
        congregacaoId: sedeId,
        userId: userId,
      },
      {
        dia: 16,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto de adoração- Dizimo Levi - 50 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 50.00,
        congregacaoId: sedeId,
        userId: userId,
      },
      {
        dia: 20,
        mes: 11,
        ano: 2025,
        descricao: 'Pg. Pagamento Agua - 52,89',
        tipo: 'saida' as const,
        valor: 52.89,
        congregacaoId: sedeId,
        userId: userId,
      },
      {
        dia: 30,
        mes: 11,
        ano: 2025,
        descricao: 'Pg. compra de 4 garrafão de agua - 11 reais',
        tipo: 'saida' as const,
        valor: 11.00,
        congregacaoId: sedeId,
        userId: userId,
      },
      {
        dia: 30,
        mes: 11,
        ano: 2025,
        descricao: 'Pg. pagamento conta de Luz - 28,52',
        tipo: 'saida' as const,
        valor: 28.52,
        congregacaoId: sedeId,
        userId: userId,
      },
      {
        dia: 30,
        mes: 11,
        ano: 2025,
        descricao: 'Rec. Culto de Doutrina - Dizimo Pr Junior- 140 reais',
        tipo: 'entrada' as const,
        categoriaEntrada: 'dizimo' as const,
        valor: 140.00,
        congregacaoId: sedeId,
        userId: userId,
      },
    ];

    for (const mov of movimentacoesData) {
      await createMovimentacao(mov);
    }
    console.log(`  ✓ ${movimentacoesData.length} movimentações criadas`);

    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`  - ${createdCongregacoes.length} congregações`);
    console.log(`  - ${createdUsers.length} usuários`);
    console.log(`  - ${movimentacoesData.length} movimentações`);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();

