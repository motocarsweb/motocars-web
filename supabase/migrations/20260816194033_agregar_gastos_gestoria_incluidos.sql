-- ===========================================================
-- MotoCars ERP
-- Indicar si los gastos de gestoría están incluidos
-- en el valor total de la operación
-- ===========================================================

alter table public.operaciones
add column gastos_gestoria_incluidos boolean not null default false;