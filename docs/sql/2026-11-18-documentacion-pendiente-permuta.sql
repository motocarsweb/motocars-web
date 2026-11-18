-- Ejecutar una vez en Supabase SQL Editor antes de desplegar el boleto actualizado.
-- La documentación pendiente pertenece a la operación, no al inventario del usado.
ALTER TABLE public.documentacion_entrega_operacion
  ADD COLUMN IF NOT EXISTS documentacion_pendiente_permuta text NOT NULL DEFAULT '';

ALTER TABLE public.documentacion_entrega_operacion
  DROP CONSTRAINT IF EXISTS documentacion_pendiente_permuta_longitud_check;

ALTER TABLE public.documentacion_entrega_operacion
  ADD CONSTRAINT documentacion_pendiente_permuta_longitud_check
  CHECK (char_length(documentacion_pendiente_permuta) <= 2000);
