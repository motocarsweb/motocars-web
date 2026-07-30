-- ============================================================
-- MOTOCARS ERP
-- Estructura inicial del módulo Configuración
-- Tabla: configuracion_empresa
-- ============================================================

-- 1. Crear la tabla principal de configuración de la empresa
create table if not exists public.configuracion_empresa (
  id uuid primary key default gen_random_uuid(),

  -- Identificación interna
  codigo text not null default 'principal',
  activo boolean not null default true,

  -- Identidad comercial
  nombre_comercial text not null default 'MotoCars',
  razon_social text,
  slogan text default 'Tu nueva historia comienza aquí',
  descripcion_empresa text,

  -- Identificación fiscal
  cuit text,
  ingresos_brutos text,
  condicion_iva text,

  -- Logotipos e imágenes
  logo_url text,
  logo_impresion_url text,
  favicon_url text,

  -- Colores institucionales
  color_primario text default '#111827',
  color_secundario text default '#DC2626',
  color_acento text default '#F59E0B',

  -- Domicilio
  direccion text,
  numero_direccion text,
  piso_departamento text,
  localidad text,
  provincia text,
  codigo_postal text,
  pais text not null default 'Argentina',

  -- Contacto
  telefono text,
  telefono_secundario text,
  whatsapp text,
  email text,
  email_administracion text,
  sitio_web text,

  -- Redes sociales
  instagram text,
  facebook text,
  tiktok text,
  youtube text,
  linkedin text,

  -- Configuración de documentos
  encabezado_documentos text,
  pie_documentos text,
  texto_legal_general text,
  observaciones_predeterminadas text,

  -- Configuración regional
  moneda text not null default 'ARS',
  idioma text not null default 'es-AR',
  zona_horaria text not null default 'America/Argentina/Buenos_Aires',

  -- Datos adicionales para futuras ampliaciones
  configuracion_adicional jsonb not null default '{}'::jsonb,

  -- Auditoría
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  constraint configuracion_empresa_codigo_unique unique (codigo)
);


-- 2. Función para actualizar automáticamente la fecha de modificación
create or replace function public.actualizar_fecha_modificacion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;


-- 3. Crear el trigger de actualización automática
drop trigger if exists trigger_configuracion_empresa_actualizado
on public.configuracion_empresa;

create trigger trigger_configuracion_empresa_actualizado
before update on public.configuracion_empresa
for each row
execute function public.actualizar_fecha_modificacion();


-- 4. Activar seguridad a nivel de filas
alter table public.configuracion_empresa enable row level security;


-- 5. Eliminar políticas anteriores si el script se vuelve a ejecutar
drop policy if exists "Configuracion visible publicamente"
on public.configuracion_empresa;

drop policy if exists "Usuarios autenticados pueden insertar configuracion"
on public.configuracion_empresa;

drop policy if exists "Usuarios autenticados pueden modificar configuracion"
on public.configuracion_empresa;

drop policy if exists "Usuarios autenticados pueden eliminar configuracion"
on public.configuracion_empresa;


-- 6. Permitir lectura pública
-- Necesario para mostrar logo, contacto y datos comerciales en el sitio web
create policy "Configuracion visible publicamente"
on public.configuracion_empresa
for select
to anon, authenticated
using (activo = true);


-- 7. Permitir administración solamente a usuarios autenticados
create policy "Usuarios autenticados pueden insertar configuracion"
on public.configuracion_empresa
for insert
to authenticated
with check (true);

create policy "Usuarios autenticados pueden modificar configuracion"
on public.configuracion_empresa
for update
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados pueden eliminar configuracion"
on public.configuracion_empresa
for delete
to authenticated
using (true);


-- 8. Crear la configuración inicial de MotoCars
insert into public.configuracion_empresa (
  codigo,
  nombre_comercial,
  slogan,
  direccion,
  localidad,
  provincia,
  pais,
  telefono,
  whatsapp,
  email,
  instagram,
  moneda,
  idioma,
  zona_horaria
)
values (
  'principal',
  'MotoCars',
  'Tu nueva historia comienza aquí',
  'Primeros Pobladores 1400',
  'Neuquén Capital',
  'Neuquén',
  'Argentina',
  '299 513 3023',
  '5492995133023',
  'motocars.concesionaria@gmail.com',
  '@motocars.concesionaria',
  'ARS',
  'es-AR',
  'America/Argentina/Buenos_Aires'
)
on conflict (codigo)
do update set
  nombre_comercial = excluded.nombre_comercial,
  slogan = excluded.slogan,
  direccion = excluded.direccion,
  localidad = excluded.localidad,
  provincia = excluded.provincia,
  pais = excluded.pais,
  telefono = excluded.telefono,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  instagram = excluded.instagram,
  moneda = excluded.moneda,
  idioma = excluded.idioma,
  zona_horaria = excluded.zona_horaria;


-- 9. Verificación final
select
  id,
  codigo,
  nombre_comercial,
  slogan,
  localidad,
  provincia,
  activo,
  creado_en
from public.configuracion_empresa;