# Sistema de Gestão Financeira - Assembleia de Deus

Sistema completo de gestão financeira para congregações da Assembleia de Deus Ministério de Madureira - Campo do Barroso II.

## 🎯 Funcionalidades

- ✅ Controle de movimentação de caixa mensal
- ✅ Registro de entradas (Dízimo, Ofertas, Outros)
- ✅ Registro de saídas (Despesas)
- ✅ Cálculo automático de saldo
- ✅ Relatórios por congregação e período
- ✅ Gráficos e visualizações
- ✅ Múltiplos perfis de acesso:
  - **Admin**: Acesso total ao sistema
  - **Pastor**: Visualização de relatórios
  - **Tesoureiro do Campo**: Gestão de todas as congregações
  - **Tesoureiro da Congregação**: Gestão da congregação específica
  - **Líder de Congregação**: Visualização de relatórios da congregação

## 🛠️ Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3) - Banco de dados local
- bcryptjs - Criptografia de senhas
- Recharts (Gráficos)
- Lucide React (Ícones)

## 📦 Instalação

1. Clone o repositório ou extraia os arquivos
2. Instale as dependências:

```bash
npm install
```

3. **Inicialização automática**: O sistema inicializa automaticamente na primeira execução!

## 🚀 Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 🔐 Acesso ao Sistema

O sistema inicializa automaticamente! Você terá os seguintes usuários:

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@adbarroso.com | admin123 | Admin |
| prjunior@adbarroso.com | pr123 | Pastor |
| tesoureiro@adbarroso.com | tes123 | Tesoureiro do Campo |
| tespici@adbarroso.com | tes123 | Tesoureiro da Congregação |
| lider@adbarroso.com | lider123 | Líder de Congregação |

Veja o arquivo [INSTALACAO.md](./INSTALACAO.md) para mais detalhes.

## 📊 Estrutura do Projeto

```
├── app/                    # Páginas e rotas
│   ├── login/             # Página de login
│   ├── dashboard/         # Dashboard principal
│   ├── movimentacao/      # Gestão de movimentações
│   ├── relatorios/        # Relatórios e gráficos
│   ├── congregacoes/      # Gestão de congregações
│   ├── usuarios/          # Gestão de usuários (Admin)
│   └── configuracoes/     # Configurações do usuário
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI
│   ├── layout/           # Componentes de layout
│   └── auth/             # Componentes de autenticação
├── lib/                  # Utilitários e dados
├── types/                # Definições TypeScript
└── public/               # Arquivos estáticos
```

## 🎨 Design

O sistema possui um design moderno e profissional com:
- Cores da Assembleia de Deus (Azul e Dourado)
- Interface responsiva
- Navegação intuitiva
- Tabelas formatadas similar à planilha original

## 📝 Notas Importantes

- ✅ **Sem Python necessário**: Sistema funciona sem necessidade de Python ou compilação nativa
- ✅ **Armazenamento em memória**: Dados salvos no localStorage do navegador
- ✅ **Autenticação real**: Sistema de login com verificação de senha (bcrypt)
- ✅ **Inicialização automática**: Dados de exemplo criados automaticamente na primeira execução
- ✅ **Pronto para Vercel**: Pode ser facilmente migrado para banco remoto (PostgreSQL/MySQL)
- 🔄 **Migração futura**: Para produção, migre para Supabase, PlanetScale ou similar

## 🔄 Build para Produção

```bash
npm run build
npm start
```

## 📄 Licença

Este projeto foi desenvolvido para uso interno da Assembleia de Deus Ministério de Madureira - Campo do Barroso II.

