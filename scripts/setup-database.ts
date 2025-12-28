// Script para criar todas as tabelas automaticamente no Supabase
// Execute: npx tsx scripts/setup-database.ts

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
import { readFileSync as readFile } from 'fs';
import { resolve as resolvePath } from 'path';

async function setupDatabase() {
  try {
    console.log('🗄️  Configurando banco de dados no Supabase...\n');

    // Ler o schema SQL
    const schemaPath = resolvePath(process.cwd(), 'supabase/schema.sql');
    const schemaSQL = readFile(schemaPath, 'utf-8');

    console.log('📋 Executando schema SQL...\n');

    // Dividir o SQL em comandos individuais
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const command of commands) {
      if (command.trim().length === 0 || command.startsWith('--')) continue;
      
      try {
        // Tentar executar via RPC (se disponível) ou usar uma abordagem alternativa
        // Como o Supabase não permite executar SQL arbitrário via API,
        // vamos tentar criar as tabelas uma por uma usando a API
        
        // Pular comentários e comandos vazios
        if (command.includes('CREATE TABLE')) {
          const tableMatch = command.match(/CREATE TABLE.*?(\w+)\s*\(/i);
          if (tableMatch) {
            const tableName = tableMatch[1];
            console.log(`  ⏳ Tentando criar tabela: ${tableName}...`);
          }
        }
      } catch (err: any) {
        errorCount++;
        // Ignorar erros de "já existe"
        if (!err.message?.includes('already exists') && !err.message?.includes('duplicate')) {
          console.warn(`  ⚠️  Aviso: ${err.message}`);
        }
      }
    }

    console.log('\n⚠️  Não é possível criar tabelas automaticamente via API do Supabase.');
    console.log('📝 Você precisa executar o schema SQL manualmente.\n');
    
    console.log('🔗 Acesse o Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/hkjvxswdpsoiidgvuyit/sql/new\n');
    
    console.log('📋 Ou clique no botão "Open in Supabase" no Vercel e vá em SQL Editor\n');
    
    console.log('📄 SQL para copiar e colar:\n');
    console.log('─'.repeat(70));
    console.log(schemaSQL);
    console.log('─'.repeat(70));

    // Tentar verificar se as tabelas já existem
    console.log('\n🔍 Verificando tabelas existentes...\n');
    const tables = ['congregacoes', 'users', 'movimentacoes', 'saldos_anteriores'];
    
    for (const tableName of tables) {
      try {
        const { error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST205' || error.message.includes('not found')) {
            console.log(`  ❌ ${tableName}: NÃO EXISTE`);
          } else {
            console.log(`  ⚠️  ${tableName}: Erro - ${error.message.substring(0, 50)}...`);
          }
        } else {
          console.log(`  ✅ ${tableName}: EXISTE`);
        }
      } catch (err: any) {
        console.log(`  ❌ ${tableName}: Erro ao verificar`);
      }
    }

    console.log('\n💡 Depois de executar o SQL, rode: npm run seed\n');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

setupDatabase();


