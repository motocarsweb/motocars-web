-- ===========================================================
-- MotoCars ERP
-- Tabla: modelos
-- ===========================================================

create table public.modelos (
    id uuid primary key default gen_random_uuid(),

    marca_id uuid not null,
    nombre varchar(100) not null,
    slug varchar(120) not null,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint fk_modelos_marca
        foreign key (marca_id)
        references public.marcas (id)
        on update cascade
        on delete restrict,

    constraint uq_modelos_marca_nombre
        unique (marca_id, nombre),

    constraint uq_modelos_marca_slug
        unique (marca_id, slug),

    constraint ck_modelos_orden_no_negativo
        check (orden >= 0)
);

create index idx_modelos_marca_activo_orden
on public.modelos (marca_id, activo, orden);

create trigger trg_modelos_updated_at
before update on public.modelos
for each row
execute function public.set_updated_at();