// Script para corrigir movimentações de Nov/2025 para a congregação Pici
// Execute: npx tsx scripts/corrigir-movimentacoes-pici.ts

// Carregar variáveis de ambiente
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
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
        }
      }
    }
  });
  console.log('✅ Variáveis de ambiente carregadas\n');
} else {
  console.error('❌ Arquivo .env.local não encontrado!');
  process.exit(1);
}

import { supabaseAdmin } from '../lib/supabase';

async function corrigirMovimentacoes() {
  try {
    console.log('🔧 Corrigindo movimentações de Nov/2025 para Pici...\n');

    // Buscar ID da congregação Pici
    const { data: pici, error: errorPici } = await supabaseAdmin
      .from('congregacoes')
      .select('id, name')
      .ilike('name', 'Pici')
      .maybeSingle();

    if (errorPici || !pici) {
      console.error('❌ Erro ao buscar congregação Pici:', errorPici);
      return;
    }

    console.log(`✅ Congregação Pici encontrada: ${pici.id}\n`);

    // Buscar movimentações de Nov/2025
    const { data: movimentacoes, error: errorMov } = await supabaseAdmin
      .from('movimentacoes')
      .select('id, dia, descricao, congregacao_id, congregacoes(name)')
      .eq('mes', 11)
      .eq('ano', 2025);

    if (errorMov) {
      console.error('❌ Erro ao buscar movimentações:', errorMov);
      return;
    }

    if (!movimentacoes || movimentacoes.length === 0) {
      console.log('⚠️  Nenhuma movimentação encontrada para Nov/2025');
      return;
    }

    console.log(`📊 Encontradas ${movimentacoes.length} movimentações de Nov/2025\n`);

    // Atualizar todas para Pici
    const idsParaAtualizar = movimentacoes.map(m => m.id);
    
    console.log('🔄 Atualizando movimentações...');
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('movimentacoes')
      .update({ congregacao_id: pici.id })
      .in('id', idsParaAtualizar)
      .select('id, dia, descricao');

    if (updateError) {
      console.error('❌ Erro ao atualizar movimentações:', updateError);
      return;
    }

    console.log(`\n✅ ${updated?.length || 0} movimentações atualizadas com sucesso!\n`);
    
    if (updated && updated.length > 0) {
      console.log('📋 Movimentações atualizadas:');
      updated.forEach(mov => {
        console.log(`   - Dia ${mov.dia}: ${mov.descricao}`);
      });
    }

    console.log('\n✅ Correção concluída! Agora as movimentações estão vinculadas à congregação Pici.');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

corrigirMovimentacoes();

