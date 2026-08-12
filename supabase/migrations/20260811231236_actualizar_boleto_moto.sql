-- ===========================================================
-- MotoCars ERP
-- Actualizar documento de motos
-- RVM Patagonia + JAWA Patagonia
-- ===========================================================

alter table public.documentos_operacion
drop constraint documentos_operacion_tipo_documento_check;

alter table public.documentos_operacion
add constraint documentos_operacion_tipo_documento_check
check (
  tipo_documento = any (
    array[
      'presupuesto'::text,
      'boleto_0km'::text,
      'boleto_0km_permuta'::text,
      'boleto_usado'::text,
      'boleto_usado_permuta'::text,
      'contrato_consignacion'::text,
      'constancia_gestoria'::text,
      'responsabilidad_civil'::text,
      'boleto_moto'::text,
      'detalle_pago'::text,
      'recibo_senia'::text,
      'recibo_pago'::text,
      'acta_entrega'::text
    ]
  )
);