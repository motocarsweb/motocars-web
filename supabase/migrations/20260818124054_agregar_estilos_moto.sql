create table if not exists public.estilos_moto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  slug text not null unique,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.estilos_moto (
  nombre,
  slug,
  activo,
  orden
)
values
  ('Adventure', 'adventure', true, 1),
  ('Touring', 'touring', true, 2),
  ('Sport', 'sport', true, 3),
  ('Enduro', 'enduro', true, 4),
  ('Custom', 'custom', true, 5),
  ('Clásicas', 'clasicas', true, 6)
on conflict (slug) do nothing;

alter table public.vehiculos
add column if not exists estilo_moto_id uuid null;

alter table public.vehiculos
drop constraint if exists vehiculos_estilo_moto_id_fkey;

alter table public.vehiculos
add constraint vehiculos_estilo_moto_id_fkey
foreign key (estilo_moto_id)
references public.estilos_moto(id)
on update cascade
on delete set null;

create index if not exists idx_vehiculos_estilo_moto_id
on public.vehiculos(estilo_moto_id);