-- ===========================================================
-- MotoCars ERP
-- Alta transaccional de operaciones de COMPRA
--
-- Crea en una única transacción:
--   1. Vehículo
--   2. Operación
--   3. Ingreso usado, cuando corresponde
--   4. Pagos de compra
--
-- Si cualquier paso falla, PostgreSQL revierte TODO.
-- ===========================================================

create or replace function public.crear_compra_transaccional(
  p_cliente_id bigint,
  p_vehiculo jsonb,
  p_operacion jsonb,
  p_ingreso jsonb,
  p_pagos jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vehiculo_id bigint;
  v_operacion_id bigint;
  v_ingreso_id bigint;

  v_tipo_ingreso_id uuid;

  v_precio_compra numeric(14,2);
  v_total_pagos numeric(14,2);

  v_condicion text;

  v_pago jsonb;

  v_numero_operacion text;
begin

  -- =========================================================
  -- 1. VALIDACIONES GENERALES
  -- =========================================================

  if p_cliente_id is null
     or p_cliente_id <= 0
  then
    raise exception
      'El cliente / proveedor de la compra no es válido.';
  end if;


  if not exists (
    select 1
    from public.clientes
    where id = p_cliente_id
  ) then
    raise exception
      'No existe el cliente / proveedor indicado.';
  end if;


  if p_vehiculo is null then
    raise exception
      'Faltan los datos del vehículo.';
  end if;


  if p_operacion is null then
    raise exception
      'Faltan los datos de la operación.';
  end if;


  if nullif(
    trim(
      p_vehiculo ->> 'marca'
    ),
    ''
  ) is null then
    raise exception
      'La marca del vehículo es obligatoria.';
  end if;


  if nullif(
    trim(
      p_vehiculo ->> 'modelo'
    ),
    ''
  ) is null then
    raise exception
      'El modelo del vehículo es obligatorio.';
  end if;


  if p_pagos is null
     or jsonb_typeof(p_pagos) <> 'array'
     or jsonb_array_length(p_pagos) = 0
  then
    raise exception
      'La compra debe tener al menos un pago.';
  end if;


  v_condicion =
    nullif(
      trim(
        p_vehiculo ->> 'condicion'
      ),
      ''
    );


  if v_condicion not in (
    '0km',
    'usado'
  ) then
    raise exception
      'La condición del vehículo debe ser 0km o usado.';
  end if;


  v_precio_compra =
    coalesce(
      nullif(
        p_vehiculo ->> 'precio_compra',
        ''
      )::numeric,
      0
    );


  if v_precio_compra <= 0 then
    raise exception
      'El valor de compra debe ser mayor a cero.';
  end if;


  -- =========================================================
  -- 2. VALIDAR TOTAL DE PAGOS
  -- =========================================================

  select
    coalesce(
      sum(
        coalesce(
          nullif(
            pago ->> 'importe',
            ''
          )::numeric,
          0
        )
      ),
      0
    )
  into
    v_total_pagos
  from jsonb_array_elements(
    p_pagos
  ) as pago;


  if abs(
    v_total_pagos -
    v_precio_compra
  ) > 0.01 then
    raise exception
      'El total de los pagos (%) debe coincidir con el valor de compra (%).',
      v_total_pagos,
      v_precio_compra;
  end if;


  -- =========================================================
  -- 3. OBTENER TIPO DE INGRESO COMPRA
  -- =========================================================

  select
    id
  into
    v_tipo_ingreso_id
  from public.tipos_ingreso
  where slug = 'compra'
    and activo = true
  order by orden
  limit 1;


  if v_tipo_ingreso_id is null then
    raise exception
      'No existe un tipo de ingreso activo con slug compra.';
  end if;


  -- =========================================================
  -- 4. CREAR VEHÍCULO
  -- =========================================================

  insert into public.vehiculos (
    marca,
    modelo,
    version,

    anio,
    kilometros,

    color,

    dominio,
    numero_chasis,
    numero_motor,

    precio,
    precio_compra,

    tipo_ingreso_id,

    condicion,
    estado,

    destacado,
    publicado,

    descripcion,
    observaciones_internas,

    imagen_principal,
    imagenes
  )
  values (
    trim(
      p_vehiculo ->> 'marca'
    ),

    trim(
      p_vehiculo ->> 'modelo'
    ),

    nullif(
      trim(
        p_vehiculo ->> 'version'
      ),
      ''
    ),

    nullif(
      p_vehiculo ->> 'anio',
      ''
    )::integer,

    case
      when v_condicion = '0km'
        then 0
      else
        coalesce(
          nullif(
            p_vehiculo ->> 'kilometros',
            ''
          )::integer,
          0
        )
    end,

    nullif(
      trim(
        p_vehiculo ->> 'color'
      ),
      ''
    ),

    case
      when v_condicion = '0km'
        then null
      else
        nullif(
          upper(
            trim(
              p_vehiculo ->> 'dominio'
            )
          ),
          ''
        )
    end,

    nullif(
      trim(
        p_vehiculo ->> 'numero_chasis'
      ),
      ''
    ),

    nullif(
      trim(
        p_vehiculo ->> 'numero_motor'
      ),
      ''
    ),

    nullif(
      p_vehiculo ->> 'precio',
      ''
    )::numeric,

    v_precio_compra,

    v_tipo_ingreso_id,

    v_condicion,

    'disponible',

    false,
    false,

    nullif(
      trim(
        p_vehiculo ->> 'descripcion'
      ),
      ''
    ),

    nullif(
      trim(
        p_vehiculo ->> 'observaciones_internas'
      ),
      ''
    ),

    null,

    array[]::text[]
  )
  returning
    id
  into
    v_vehiculo_id;


  -- =========================================================
  -- 5. CREAR OPERACIÓN
  -- =========================================================

  insert into public.operaciones (
    tipo_operacion,

    cliente_id,
    vehiculo_id,

    precio_vehiculo,
    bonificacion,
    gastos,

    asesor_comercial,

    forma_pago,
    detalle_pago,

    gastos_gestoria,

    fecha_entrega,
    hora_entrega,

    entrega_sin_patentar,

    observaciones,
    observaciones_internas
  )
  values (
    'compra',

    p_cliente_id,
    v_vehiculo_id,

    coalesce(
      nullif(
        p_operacion ->> 'precio_vehiculo',
        ''
      )::numeric,
      0
    ),

    0,
    0,

    nullif(
      trim(
        p_operacion ->> 'asesor_comercial'
      ),
      ''
    ),

    nullif(
      trim(
        p_operacion ->> 'forma_pago'
      ),
      ''
    ),

    nullif(
      trim(
        p_operacion ->> 'detalle_pago'
      ),
      ''
    ),

    coalesce(
      nullif(
        p_operacion ->> 'gastos_gestoria',
        ''
      )::numeric,
      0
    ),

    nullif(
      p_operacion ->> 'fecha_entrega',
      ''
    )::date,

    nullif(
      p_operacion ->> 'hora_entrega',
      ''
    )::time,

    coalesce(
      nullif(
        p_operacion ->> 'entrega_sin_patentar',
        ''
      )::boolean,
      false
    ),

    nullif(
      trim(
        p_operacion ->> 'observaciones'
      ),
      ''
    ),

    nullif(
      trim(
        p_operacion ->> 'observaciones_internas'
      ),
      ''
    )
  )
  returning
    id,
    numero
  into
    v_operacion_id,
    v_numero_operacion;


  -- =========================================================
  -- 6. CREAR INGRESO USADO
  -- =========================================================
  --
  -- Para Compra de usado se registra ingresos_usados.
  -- En Compra de 0 km no es necesario ese registro.
  -- =========================================================

  if v_condicion = 'usado' then

    if p_ingreso is null then
      raise exception
        'Faltan los datos de ingreso del vehículo usado.';
    end if;


    insert into public.ingresos_usados (
      vehiculo_id,
      titular_cliente_id,
      operacion_id,

      tipo_ingreso,

      valor_ingreso,

      precio_base_consignacion,
      plazo_consignacion_dias,

      fecha_ingreso,

      observaciones
    )
    values (
      v_vehiculo_id,
      p_cliente_id,
      v_operacion_id,

      'compra',

      v_precio_compra,

      coalesce(
        nullif(
          p_ingreso ->> 'precio_base_consignacion',
          ''
        )::numeric,
        0
      ),

      greatest(
        1,
        coalesce(
          nullif(
            p_ingreso ->> 'plazo_consignacion_dias',
            ''
          )::integer,
          90
        )
      ),

      coalesce(
        nullif(
          p_ingreso ->> 'fecha_ingreso',
          ''
        )::date,
        current_date
      ),

      nullif(
        trim(
          p_ingreso ->> 'observaciones'
        ),
        ''
      )
    )
    returning
      id
    into
      v_ingreso_id;

  end if;


  -- =========================================================
  -- 7. CREAR PAGOS
  -- =========================================================

  for v_pago in
    select
      value
    from jsonb_array_elements(
      p_pagos
    )
  loop

    if (
      v_pago ->> 'medio_pago'
    ) not in (
      'efectivo',
      'transferencia',
      'cheque',
      'otro'
    ) then
      raise exception
        'Medio de pago no válido: %.',
        v_pago ->> 'medio_pago';
    end if;


    if coalesce(
      nullif(
        v_pago ->> 'importe',
        ''
      )::numeric,
      0
    ) <= 0 then
      raise exception
        'Todos los pagos deben tener un importe mayor a cero.';
    end if;


    if
      v_pago ->> 'medio_pago' = 'transferencia'
      and nullif(
        trim(
          v_pago ->> 'titular'
        ),
        ''
      ) is null
    then
      raise exception
        'La transferencia debe indicar el titular.';
    end if;


    if
      v_pago ->> 'medio_pago' = 'transferencia'
      and nullif(
        trim(
          v_pago ->> 'cbu_cvu'
        ),
        ''
      ) is null
      and nullif(
        trim(
          v_pago ->> 'alias'
        ),
        ''
      ) is null
    then
      raise exception
        'La transferencia debe tener CBU/CVU o alias.';
    end if;


    if
      v_pago ->> 'medio_pago' = 'cheque'
      and nullif(
        trim(
          v_pago ->> 'detalle'
        ),
        ''
      ) is null
    then
      raise exception
        'El cheque debe tener un detalle.';
    end if;


    if
      v_pago ->> 'medio_pago' = 'otro'
      and nullif(
        trim(
          v_pago ->> 'detalle'
        ),
        ''
      ) is null
    then
      raise exception
        'La forma de pago Otro debe tener un detalle.';
    end if;


    insert into public.pagos_compra (
      operacion_id,

      medio_pago,
      importe,

      banco,
      titular,
      cuil_cuit,
      tipo_cuenta,
      numero_cuenta,
      alias,
      cbu_cvu,

      detalle
    )
    values (
      v_operacion_id,

      v_pago ->> 'medio_pago',

      (
        v_pago ->> 'importe'
      )::numeric,

      nullif(
        trim(
          v_pago ->> 'banco'
        ),
        ''
      ),

      nullif(
        trim(
          v_pago ->> 'titular'
        ),
        ''
      ),

      nullif(
        trim(
          v_pago ->> 'cuil_cuit'
        ),
        ''
      ),

      nullif(
        trim(
          v_pago ->> 'tipo_cuenta'
        ),
        ''
      ),

      nullif(
        trim(
          v_pago ->> 'numero_cuenta'
        ),
        ''
      ),

      nullif(
        trim(
          v_pago ->> 'alias'
        ),
        ''
      ),

      nullif(
        trim(
          v_pago ->> 'cbu_cvu'
        ),
        ''
      ),

      nullif(
        trim(
          v_pago ->> 'detalle'
        ),
        ''
      )
    );

  end loop;


  -- =========================================================
  -- 8. RESPUESTA
  -- =========================================================

  return jsonb_build_object(
    'operacion_id',
      v_operacion_id,

    'numero',
      v_numero_operacion,

    'vehiculo_id',
      v_vehiculo_id,

    'ingreso_usado_id',
      v_ingreso_id
  );

end;
$$;