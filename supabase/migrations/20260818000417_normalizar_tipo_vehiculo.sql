alter table public.vehiculos
drop constraint if exists vehiculos_tipo_check;

alter table public.vehiculos
add constraint vehiculos_tipo_check
check (
  tipo in (
    'Auto',
    'Hatchback',
    'Pickup',
    'SUV',
    'Utilitario',
    'Moto'
  )
);

alter table public.vehiculos
alter column tipo set not null;