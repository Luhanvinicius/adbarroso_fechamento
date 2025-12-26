// Script para criar todas as tabelas automaticamente usando conexão PostgreSQL direta
// Execute: npx tsx scripts/setup-database-direct.ts

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

async function setupDatabase() {
  try {
    // Verificar se pg está instalado
    let pg: any;
    try {
      pg = require('pg');
    } catch (e) {
      console.error('❌ Pacote "pg" não encontrado!');
      console.log('📦 Instalando dependência...\n');
      console.log('Execute: npm install pg @types/pg\n');
      process.exit(1);
    }

    const { Client } = pg;

    // Construir URL de conexão não-pooling para DDL
    // Usar valores padrão do Supabase se não estiverem no .env.local
    let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    
    // Se não tiver URL completa, construir a partir das variáveis individuais
    if (!connectionString || connectionString.includes('undefined')) {
      // Usar host direto (db.hkjvxswdpsoiidgvuyit.supabase.co) ao invés do pooler para DDL
      const user = process.env.POSTGRES_USER || 'postgres.hkjvxswdpsoiidgvuyit';
      const password = process.env.POSTGRES_PASSWORD || 'xGlciq0wEgzYRs0E';
      // Host direto do Supabase (sem pooler) para DDL
      const host = 'db.hkjvxswdpsoiidgvuyit.supabase.co';
      const database = process.env.POSTGRES_DATABASE || 'postgres';
      
      // Construir URL: postgres://user:password@host:5432/database?sslmode=require
      connectionString = `postgres://${user}:${password}@${host}:5432/${database}?sslmode=require`;
      console.log(`🔗 Usando URL construída: postgres://${user}:***@${host}:5432/${database}\n`);
    } else {
      console.log('🔗 Usando URL do .env.local\n');
    }
    
    // Debug: mostrar variáveis carregadas (sem senha)
    console.log('📋 Variáveis carregadas:');
    console.log(`   POSTGRES_URL_NON_POOLING: ${process.env.POSTGRES_URL_NON_POOLING ? '✅' : '❌'}`);
    console.log(`   POSTGRES_USER: ${process.env.POSTGRES_USER || 'usando padrão'}`);
    console.log(`   POSTGRES_HOST: ${process.env.POSTGRES_HOST || 'usando padrão'}`);
    console.log(`   POSTGRES_DATABASE: ${process.env.POSTGRES_DATABASE || 'usando padrão'}\n`);

    console.log('🔌 Conectando ao banco de dados...');
    const client = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false // Aceitar certificado self-signed do Supabase
      }
    });

    await client.connect();
    console.log('✅ Conectado!\n');

    // Ler o schema SQL
    const schemaPath = resolve(process.cwd(), 'supabase/schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');

    console.log('📋 Executando schema SQL...\n');

    // Dividir o SQL em comandos individuais
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const command of commands) {
      if (command.trim().length === 0) continue;
      
      try {
        await client.query(command);
        successCount++;
        
        // Extrair nome da tabela para log
        const tableMatch = command.match(/CREATE TABLE.*?(\w+)/i);
        if (tableMatch) {
          console.log(`  ✅ Tabela criada/verificada: ${tableMatch[1]}`);
        } else if (command.match(/CREATE INDEX/i)) {
          const indexMatch = command.match(/CREATE INDEX.*?(\w+)/i);
          if (indexMatch) {
            console.log(`  ✅ Índice criado/verificado: ${indexMatch[1]}`);
          }
        } else if (command.match(/CREATE POLICY/i)) {
          const policyMatch = command.match(/CREATE POLICY.*?"([^"]+)"/i);
          if (policyMatch) {
            console.log(`  ✅ Política criada/verificada: ${policyMatch[1]}`);
          }
        } else if (command.match(/ALTER TABLE.*?ENABLE ROW LEVEL SECURITY/i)) {
          const tableMatch = command.match(/ALTER TABLE.*?(\w+)/i);
          if (tableMatch) {
            console.log(`  ✅ RLS habilitado: ${tableMatch[1]}`);
          }
        }
      } catch (err: any) {
        // Ignorar erros de "já existe"
        if (err.message?.includes('already exists') || 
            err.message?.includes('duplicate') ||
            err.code === '42P07' || // duplicate_table
            err.code === '42710') { // duplicate_object
          successCount++;
          // Não logar erros de "já existe" como erro
        } else {
          errorCount++;
          console.error(`  ❌ Erro: ${err.message.substring(0, 100)}`);
          console.error(`     Comando: ${command.substring(0, 80)}...`);
        }
      }
    }

    await client.end();

    console.log(`\n✅ Processo concluído!`);
    console.log(`   Sucessos: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   Erros: ${errorCount}`);
    }

    // Verificar tabelas criadas
    console.log('\n🔍 Verificando tabelas criadas...\n');
    const verifyClient = new Client({
      connectionString: connectionString,
    });
    await verifyClient.connect();
    
    const result = await verifyClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('congregacoes', 'users', 'movimentacoes', 'saldos_anteriores')
      ORDER BY table_name;
    `);
    
    await verifyClient.end();

    if (result.rows.length === 4) {
      console.log('✅ Todas as 4 tabelas foram criadas com sucesso!\n');
      result.rows.forEach((row: any) => {
        console.log(`   ✅ ${row.table_name}`);
      });
      console.log('\n🎉 Banco de dados configurado! Agora execute: npm run seed\n');
    } else {
      console.log(`⚠️  Apenas ${result.rows.length} de 4 tabelas encontradas:\n`);
      result.rows.forEach((row: any) => {
        console.log(`   ✅ ${row.table_name}`);
      });
      console.log('\n⚠️  Verifique os erros acima e tente novamente.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Erro ao configurar banco de dados:', error.message);
    if (error.message?.includes('ECONNREFUSED')) {
      console.error('\n💡 Verifique se a URL de conexão está correta no .env.local');
    }
    process.exit(1);
  }
}

setupDatabase();

