-- ================================================================
-- 4HUNTERS — Schema do Banco de Dados (Supabase / PostgreSQL)
-- ================================================================
-- Execute este script no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New Query → Cole e Execute
-- ================================================================

-- Tabela principal de configurações por usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id       TEXT NOT NULL UNIQUE,       -- ID do usuário no Clerk
  provider            TEXT NOT NULL DEFAULT 'anthropic' CHECK (provider IN ('anthropic', 'gemini', 'openai')),
  api_key_encrypted   TEXT,                        -- Key criptografada (AES-256-GCM)
  has_api_key         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_user_settings_clerk_id ON user_settings(clerk_user_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
-- IMPORTANTE: Habilitamos RLS mas todas as operações reais
-- são feitas via service_role (supabaseAdmin) no servidor.
-- O cliente público não tem acesso direto a esta tabela.
-- ================================================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Nenhuma política pública — acesso apenas via service_role no backend
-- Isso garante que nenhum usuário consiga ler dados de outro

-- ================================================================
-- HISTÓRICO DE ANÁLISES (opcional — descomente para ativar)
-- ================================================================
-- CREATE TABLE IF NOT EXISTS analysis_history (
--   id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   clerk_user_id   TEXT NOT NULL,
--   tool            TEXT NOT NULL,               -- ex: 'viabilidade'
--   input_data      JSONB,                        -- dados do formulário
--   result_text     TEXT,                         -- resultado da IA
--   score           INTEGER,                      -- score numérico (se aplicável)
--   created_at      TIMESTAMPTZ DEFAULT now()
-- );
-- CREATE INDEX IF NOT EXISTS idx_history_user ON analysis_history(clerk_user_id);
-- ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- MIGRATION: Adicionar suporte a OpenAI como provider
-- Execute no SQL Editor se o banco já existia antes desta alteração
-- ================================================================
-- ALTER TABLE user_settings
--   DROP CONSTRAINT IF EXISTS user_settings_provider_check;
-- ALTER TABLE user_settings
--   ADD CONSTRAINT user_settings_provider_check
--   CHECK (provider IN ('anthropic', 'gemini', 'openai'));

-- ================================================================
-- TABELA DE LOGS DE USO (analytics de ferramentas)
-- ================================================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id   TEXT NOT NULL,
  tool            TEXT NOT NULL,   -- 'viabilidade' | 'analisar-perfil' | 'benchmarking' | 'booleana' | 'entrevista' | 'mensagem'
  provider        TEXT NOT NULL,   -- 'anthropic' | 'gemini' | 'openai'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Índices para queries de analytics
CREATE INDEX IF NOT EXISTS idx_usage_logs_created  ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tool      ON usage_logs(tool);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user      ON usage_logs(clerk_user_id);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
-- Acesso apenas via service_role — nenhum usuário lê dados de outro

-- ================================================================
-- MIGRATION: Criar tabela usage_logs (se o banco já existia)
-- Execute no SQL Editor do Supabase caso a tabela não exista ainda:
-- ================================================================
-- (copie e cole o bloco "CREATE TABLE IF NOT EXISTS usage_logs" acima)
