-- ===========================================================
-- MotoCars ERP
-- Tabla: versiones
-- Relación con: modelos
-- Relación futura con: vehiculos.version_id
-- ===========================================================

create table public.versiones (
    id uuid primary key default gen_random_uuid(),

    modelo_id uuid not null,
    nombre varchar(100) not null,
    slug varchar(120) not null,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint fk_versiones_modelo
        foreign key (modelo_id)
        references public.modelos (id)
        on update cascade
        on delete restrict,

    constraint uq_versiones_modelo_nombre
        unique (modelo_id, nombre),

    constraint uq_versiones_modelo_slug
        unique (modelo_id, slug),

    constraint ck_versiones_orden_no_negativo
        check (orden >= 0)
);

create index idx_versiones_modelo_activo_orden
on public.versiones (modelo_id, activo, orden);

create trigger trg_versiones_updated_at
before update on public.versiones
for each row
execute function public.set_updated_at();

alter table public.vehiculos
    add column version_id uuid
        references public.versiones (id)
        on update cascade
        on delete restrict;

create index idx_vehiculos_version_id
on public.vehiculos (version_id);