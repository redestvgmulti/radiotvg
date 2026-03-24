ALTER TABLE public.rewards
  ADD COLUMN IF NOT EXISTS descricao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instrucoes_resgate text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS observacoes text;
