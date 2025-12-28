// Script para verificar e corrigir IDs de congregações
// Execute: npx tsx scripts/verificar-congregacoes.ts

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

async function verificarCongregacoes() {
  try {
    console.log('🔍 Verificando congregações e movimentações...\n');

    // Buscar todas as congregações
    const { data: congregacoes, error: errorCongregacoes } = await supabaseAdmin
      .from('congregacoes')
      .select('*')
      .order('name');

    if (errorCongregacoes) {
      console.error('❌ Erro ao buscar congregações:', errorCongregacoes);
      return;
    }

    console.log('📋 Congregações encontradas:');
    congregacoes?.forEach(cong => {
      console.log(`   - ${cong.name} (${cong.campo}): ${cong.id}`);
    });
    console.log('');

    // Buscar todas as movimentações de novembro/2025
    const { data: movimentacoes, error: errorMovimentacoes } = await supabaseAdmin
      .from('movimentacoes')
      .select('*, congregacoes(id, name)')
      .eq('mes', 11)
      .eq('ano', 2025)
      .order('dia');

    if (errorMovimentacoes) {
      console.error('❌ Erro ao buscar movimentações:', errorMovimentacoes);
      return;
    }

    console.log(`\n📊 Movimentações de Novembro/2025: ${movimentacoes?.length || 0}`);
    
    if (movimentacoes && movimentacoes.length > 0) {
      // Agrupar por congregação
      const porCongregacao: { [key: string]: any[] } = {};
      
      movimentacoes.forEach(mov => {
        const congId = mov.congregacao_id;
        if (!porCongregacao[congId]) {
          porCongregacao[congId] = [];
        }
        porCongregacao[congId].push(mov);
      });

      console.log('\n📈 Movimentações por congregação:');
      for (const [congId, movs] of Object.entries(porCongregacao)) {
        const cong = congregacoes?.find(c => c.id === congId);
        console.log(`\n   ${cong ? cong.name : 'CONGREGAÇÃO NÃO ENCONTRADA'} (${congId}):`);
        console.log(`   Total: ${movs.length} movimentações`);
        movs.forEach(mov => {
          console.log(`     - Dia ${mov.dia}: ${mov.descricao} - R$ ${mov.valor}`);
        });
      }

      // Verificar se há movimentações sem congregação válida
      const movimentacoesInvalidas = movimentacoes.filter(mov => {
        return !congregacoes?.find(c => c.id === mov.congregacao_id);
      });

      if (movimentacoesInvalidas.length > 0) {
        console.log('\n⚠️  Movimentações com congregação inválida:');
        movimentacoesInvalidas.forEach(mov => {
          console.log(`   - ID: ${mov.id}, Congregação ID: ${mov.congregacao_id}`);
        });
      }

      // Verificar se Pici existe e tem movimentações
      const pici = congregacoes?.find(c => c.name.toLowerCase() === 'pici');
      if (pici) {
        console.log(`\n✅ Congregação Pici encontrada: ${pici.id}`);
        const movimentacoesPici = movimentacoes.filter(mov => mov.congregacao_id === pici.id);
        console.log(`   Movimentações vinculadas: ${movimentacoesPici.length}`);
        
        if (movimentacoesPici.length === 0 && movimentacoes.length > 0) {
          console.log('\n⚠️  ATENÇÃO: Há movimentações de Nov/2025 mas nenhuma está vinculada à Pici!');
          console.log('   As movimentações estão vinculadas a outra congregação.');
        }
      } else {
        console.log('\n❌ Congregação Pici NÃO encontrada!');
      }
    } else {
      console.log('   Nenhuma movimentação encontrada.');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

verificarCongregacoes();


