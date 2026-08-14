create or replace function public.eliminar_operacion_completa(
  p_operacion_id bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tipo_operacion text;
  v_vehiculo_principal_id bigint;
  v_vehiculo_ingresado_id bigint;
begin

  select
    tipo_operacion,
    vehiculo_id
  into
    v_tipo_operacion,
    v_vehiculo_principal_id
  from public.operaciones
  where id = p_operacion_id
  for update;

  if not found then
    raise exception
      'No existe la operación %.',
      p_operacion_id;
  end if;


  select
    vehiculo_id
  into
    v_vehiculo_ingresado_id
  from public.ingresos_usados
  where operacion_id = p_operacion_id
  order by id desc
  limit 1;


  delete from public.ingresos_usados
  where operacion_id = p_operacion_id;


  delete from public.operaciones
  where id = p_operacion_id;


  if v_tipo_operacion in (
    'compra',
    'consignacion'
  ) then

    delete from public.vehiculos
    where id = v_vehiculo_principal_id;

  end if;


  if
    v_tipo_operacion = 'venta'
    and v_vehiculo_ingresado_id is not null
    and v_vehiculo_ingresado_id <> v_vehiculo_principal_id
  then

    delete from public.vehiculos
    where id = v_vehiculo_ingresado_id;

  end if;

end;
$$;