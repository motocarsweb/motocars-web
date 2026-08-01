-- ===========================================================
-- MotoCars ERP
-- Evolución inicial de la tabla vehiculos
-- ===========================================================

-- Se mantienen temporalmente las columnas de texto actuales
-- para no interrumpir la web ni el panel administrativo.

alter table public.vehiculos
    add column if not exists marca_id uuid
        references public.marcas (id)
        on update cascade
        on delete restrict,

    add column if not exists modelo_id uuid
        references public.modelos (id)
        on update cascade
        on delete restrict,

    add column if not exists tipo_vehiculo_id uuid
        references public.tipos_vehiculo (id)
        on update cascade
        on delete restrict,

    add column if not exists combustible_id uuid
        references public.combustibles (id)
        on update cascade
        on delete restrict,

    add column if not exists transmision_id uuid
        references public.transmisiones (id)
        on update cascade
        on delete restrict,

    add column if not exists traccion_id uuid
        references public.tracciones (id)
        on update cascade
        on delete restrict,

    add column if not exists condicion varchar(20),

    add column if not exists publicado boolean
        not null default true,

    add column if not exists precio_compra numeric(14, 2),

    add column if not exists dominio varchar(20),

    add column if not exists numero_chasis varchar(100),

    add column if not exists numero_motor varchar(100),

    add column if not exists observaciones_internas text;


alter table public.vehiculos
    drop constraint if exists ck_vehiculos_condicion;

alter table public.vehiculos
    add constraint ck_vehiculos_condicion
    check (
        condicion is null
        or condicion in ('0km', 'usado', 'consignacion')
    );


alter table public.vehiculos
    drop constraint if exists ck_vehiculos_precio_compra_no_negativo;

alter table public.vehiculos
    add constraint ck_vehiculos_precio_compra_no_negativo
    check (
        precio_compra is null
        or precio_compra >= 0
    );


create index if not exists idx_vehiculos_marca_id
on public.vehiculos (marca_id);

create index if not exists idx_vehiculos_modelo_id
on public.vehiculos (modelo_id);

create index if not exists idx_vehiculos_tipo_vehiculo_id
on public.vehiculos (tipo_vehiculo_id);

create index if not exists idx_vehiculos_publicado
on public.vehiculos (publicado);


drop trigger if exists trg_vehiculos_updated_at
on public.vehiculos;

create trigger trg_vehiculos_updated_at
before update on public.vehiculos
for each row
execute function public.set_updated_at();