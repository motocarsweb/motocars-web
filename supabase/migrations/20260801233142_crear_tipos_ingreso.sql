-- ===========================================================
-- MotoCars ERP
-- Catálogo: tipos_ingreso
-- Relación con: vehiculos.tipo_ingreso_id
-- ===========================================================

create table public.tipos_ingreso (
    id uuid primary key default gen_random_uuid(),

    nombre varchar(50) not null,
    slug varchar(50) not null,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint uq_tipos_ingreso_nombre unique (nombre),
    constraint uq_tipos_ingreso_slug unique (slug),
    constraint ck_tipos_ingreso_orden check (orden >= 0)
);

create index idx_tipos_ingreso_activo_orden
on public.tipos_ingreso (activo, orden);

create trigger trg_tipos_ingreso_updated_at
before update on public.tipos_ingreso
for each row
execute function public.set_updated_at();

insert into public.tipos_ingreso (nombre, slug, orden)
values
    ('Compra', 'compra', 1),
    ('Consignación', 'consignacion', 2),
    ('Permuta', 'permuta', 3);

alter table public.vehiculos
    add column tipo_ingreso_id uuid
        references public.tipos_ingreso (id)
        on update cascade
        on delete restrict;

create index idx_vehiculos_tipo_ingreso_id
on public.vehiculos (tipo_ingreso_id);