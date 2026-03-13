

## Plano: Sistema de Vouchers

### 1. Migração SQL

Uma migração com:

- **Sequência** `voucher_protocol_seq`
- **Tabela `vouchers`** conforme especificado (com CHECK constraint para status)
- **RLS**: users SELECT own, admins SELECT all, admins UPDATE all, sem INSERT público
- **Função `redeem_reward_voucher(_reward_id uuid)`** — SECURITY DEFINER, SET search_path = public:
  1. Busca `points_cost` da reward ativa
  2. Dedução atômica: `UPDATE profiles SET total_points = total_points - _cost WHERE user_id = auth.uid() AND total_points >= _cost RETURNING total_points` — aborta se nenhuma row
  3. Insere em `redemptions` (user_id, reward_id, points_spent, coupon_code)
  4. Gera `voucher_code`: `'TVG-' || upper(substr(md5(random()::text),1,5))`
  5. Gera `protocol_number`: `'PROTO-' || to_char(now(),'YYYY') || '-' || lpad(nextval('voucher_protocol_seq')::text,4,'0')`
  6. Insere em `vouchers` com redemption_id
  7. Retorna jsonb com voucher_code, protocol_number, remaining_points
- **Função `get_voucher_export()`** — SECURITY DEFINER: join vouchers + profiles + rewards + auth.users, ORDER BY created_at DESC

### 2. Frontend

| Arquivo | Ação | O quê |
|---|---|---|
| `src/components/VoucherModal.tsx` | **Criar** | Dialog com design de cupom digital: código grande, protocolo, botão "Copiar código", QR Code via `qrcode.react` |
| `src/pages/RewardsTab.tsx` | **Modificar** | Chamar `redeem_reward_voucher` (passando só `_reward_id`); após sucesso abrir VoucherModal; remover chamada antiga `redeem_reward` |
| `src/pages/PerfilTab.tsx` | **Modificar** | Adicionar seção "Meus Vouchers" após stats — buscar vouchers do usuário com join em rewards; exibir código, protocolo, status badge (Ativo/Utilizado/Expirado/Cancelado), data |
| `src/pages/AdminVouchers.tsx` | **Criar** | Tabela com Protocolo, Voucher, Usuário, Recompensa, Pontos, Status, Data; ações: Marcar como Utilizado (update status='redeemed', redeemed_at=now(), redeemed_by=admin uid), Cancelar; botão exportar CSV via `get_voucher_export()` |
| `src/pages/AdminDashboard.tsx` | **Modificar** | Adicionar item `{ icon: Ticket, label: 'Vouchers', desc: 'Gestão de vouchers', path: '/admin/vouchers' }` na seção CONTEÚDO |
| `src/App.tsx` | **Modificar** | Adicionar lazy import `AdminVouchers` e rota `/admin/vouchers` com AdminLayout + Suspense |

### 3. Dependência npm

- Instalar `qrcode.react` para QR Code no VoucherModal

