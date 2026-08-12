-- ===========================================================
-- MotoCars ERP
-- Agregar tipo de operación
-- Venta / Compra / Consignación
-- ===========================================================

alter table public.operaciones
add column tipo_operacion text not null default 'venta';

alter table public.operaciones
add constraint operaciones_tipo_operacion_check
check (
  tipo_operacion in (
    'venta',
    'compra',
    'consignacion'
  )
);

alter table public.operaciones
alter column vehiculo_id drop not null;