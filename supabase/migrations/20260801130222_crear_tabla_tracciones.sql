-- ===========================================================
-- MotoCars ERP
-- Tabla: tracciones
-- ===========================================================

create table public.tracciones (
    id uuid primary key default gen_random_uuid(),

    nombre varchar(50) not null,
    slug varchar(50) not null,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint uq_tracciones_nombre unique (nombre),
    constraint uq_tracciones_slug unique (slug),
    constraint ck_tracciones_orden check (orden >= 0)
);

create index idx_tracciones_activo_orden
on public.tracciones (activo, orden);

create trigger trg_tracciones_updated_at
before update on public.tracciones
for each row
execute function public.set_updated_at();

insert into public.tracciones (nombre, slug, orden)
values
    ('Delantera', 'delantera', 1),
    ('Trasera', 'trasera', 2),
    ('4x2', '4x2', 3),
    ('4x4', '4x4', 4),
    ('Integral / AWD', 'awd', 5);