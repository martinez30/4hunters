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
  provider            TEXT NOT NULL DEFAULT 'anthropic' CHECK (provider IN ('anthropic', 'gemini')),
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
