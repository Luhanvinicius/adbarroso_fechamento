// Script para verificar se as tabelas existem no Supabase
// Execute: npx tsx scripts/check-tables.ts

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
}

import { supabaseAdmin } from '../lib/supabase';

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no Supabase...\n');

    const tables = ['congregacoes', 'users', 'movimentacoes', 'saldos_anteriores'];
    
    for (const tableName of tables) {
      try {
        // Tentar fazer uma query simples na tabela
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST205' || error.message.includes('not found')) {
            console.log(`❌ ${tableName}: NÃO EXISTE`);
          } else {
            console.log(`⚠️  ${tableName}: Erro - ${error.message}`);
          }
        } else {
          console.log(`✅ ${tableName}: Existe (${data?.length || 0} registros)`);
        }
      } catch (err: any) {
        console.log(`❌ ${tableName}: Erro - ${err.message}`);
      }
    }

    console.log('\n📝 Se alguma tabela não existe, execute o schema SQL no Supabase Dashboard:');
    console.log('   1. Acesse: https://supabase.com/dashboard');
    console.log('   2. Vá em SQL Editor');
    console.log('   3. Execute o conteúdo do arquivo: supabase/schema.sql');
    
  } catch (error: any) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  }
}

checkTables();

