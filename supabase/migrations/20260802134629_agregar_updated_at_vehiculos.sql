-- Agrega la columna requerida por el trigger de actualización
alter table public.vehiculos
    add column if not exists updated_at timestamptz
    not null default now();

-- Asegura que el trigger exista y use la función común
drop trigger if exists trg_vehiculos_updated_at
on public.vehiculos;

create trigger trg_vehiculos_updated_at
before update on public.vehiculos
for each row
execute function public.set_updated_at();