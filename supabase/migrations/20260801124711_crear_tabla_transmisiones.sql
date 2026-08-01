-- ===========================================================
-- MotoCars ERP
-- Tabla: transmisiones
-- ===========================================================

create table public.transmisiones (
    id uuid primary key default gen_random_uuid(),

    nombre varchar(50) not null,
    slug varchar(50) not null,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint uq_transmisiones_nombre unique (nombre),
    constraint uq_transmisiones_slug unique (slug),
    constraint ck_transmisiones_orden check (orden >= 0)
);

create index idx_transmisiones_activo_orden
on public.transmisiones (activo, orden);

create trigger trg_transmisiones_updated_at
before update on public.transmisiones
for each row
execute function public.set_updated_at();

insert into public.transmisiones (nombre, slug, orden)
values
    ('Manual', 'manual', 1),
    ('Automática', 'automatica', 2),
    ('CVT', 'cvt', 3),
    ('Automatizada', 'automatizada', 4);