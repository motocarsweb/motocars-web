-- ===========================================================
-- MotoCars ERP
-- Moneda de la operación
-- ARS = Pesos argentinos
-- USD = Dólares estadounidenses
-- ===========================================================

alter table public.operaciones
add column moneda text not null default 'ARS';

alter table public.operaciones
add constraint operaciones_moneda_check
check (
  moneda in (
    'ARS',
    'USD'
  )
);