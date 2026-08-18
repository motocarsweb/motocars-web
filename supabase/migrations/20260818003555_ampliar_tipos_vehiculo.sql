alter table public.vehiculos
drop constraint if exists vehiculos_tipo_check;

alter table public.vehiculos
add constraint vehiculos_tipo_check
check (
  tipo in (
    'Auto',
    'SUV',
    'Pickup',
    'Utilitario',
    'Moto',
    'Cuatriciclo',
    'UTV',
    'Rodante',
    'Transporte',
    'Maquinaria'
  )
);