-- MotoCars: eventos agregados por día y código de referido.
-- Ejecutar en Supabase SQL Editor antes de activar el registro desde la web.
-- No almacena IP, DNI, teléfono ni identificadores de visitantes.
create table if not exists public.referidos_metricas_diarias (
  fecha date not null,
  codigo_referido text not null
    check (codigo_referido in ('david','nazareno','alexander','cristian','jorge','german')),
  visitas bigint not null default 0 check (visitas >= 0),
  clics_whatsapp bigint not null default 0 check (clics_whatsapp >= 0),
  primary key (fecha, codigo_referido)
);

alter table public.referidos_metricas_diarias enable row level security;

revoke all on public.referidos_metricas_diarias from public, anon, authenticated;
grant all on public.referidos_metricas_diarias to service_role;

-- Incremento atómico: se ejecuta exclusivamente desde el backend con service_role.
create or replace function public.incrementar_metrica_referido(
  p_codigo text, p_tipo text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_codigo not in ('david','nazareno','alexander','cristian','jorge','german')
    or p_tipo not in ('visita','whatsapp') then
    raise exception 'Métrica inválida';
  end if;

  insert into public.referidos_metricas_diarias
    (fecha, codigo_referido, visitas, clics_whatsapp)
  values (
    (now() at time zone 'America/Argentina/Buenos_Aires')::date,
    p_codigo,
    case when p_tipo = 'visita' then 1 else 0 end,
    case when p_tipo = 'whatsapp' then 1 else 0 end
  )
  on conflict (fecha, codigo_referido)
  do update set
    visitas = public.referidos_metricas_diarias.visitas
      + excluded.visitas,
    clics_whatsapp = public.referidos_metricas_diarias.clics_whatsapp
      + excluded.clics_whatsapp;
end;
$$;

revoke all on function public.incrementar_metrica_referido(text,text)
  from public, anon, authenticated;
grant execute on function public.incrementar_metrica_referido(text,text)
  to service_role;
