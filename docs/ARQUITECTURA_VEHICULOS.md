# MÓDULO VEHÍCULOS

## Objetivo

El módulo Vehículos será el núcleo del sistema MotoCars ERP.

Todos los demás módulos (Clientes, Presupuestos, Reservas, Ventas, CRM y Sitio Web) se relacionarán con los vehículos.

El diseño debe permitir administrar indistintamente:

- Autos
- Pickups
- SUVs
- Utilitarios
- Motos
- Cuatriciclos
- UTV
- Futuros tipos de vehículos

---

# Entidades principales

## vehiculos

Representa una unidad física del stock.

Cada registro corresponde a un único vehículo.

---

## marcas

Catálogo de marcas.

Ejemplos:

- Toyota
- Volkswagen
- Ford
- Honda
- Chevrolet
- Jeep
- RVM
- JAWA

---

## modelos

Cada modelo pertenece a una marca.

Ejemplo:

Marca Toyota

- Hilux
- Corolla
- Yaris

Marca RVM

- Tekken 300
- CZ 250

---

## versiones

Cada modelo puede tener distintas versiones.

Ejemplos:

Hilux

- SR
- SRV
- SRX

Tekken 300

- Adventure
- Rally

---

## vehiculos_imagenes

Permite asociar una cantidad ilimitada de imágenes a cada vehículo.

Cada imagen tendrá:

- orden
- principal
- descripción (opcional)

---

## equipamientos

Catálogo reutilizable.

Ejemplos:

- ABS
- ESP
- Airbags
- Climatizador
- Pantalla Multimedia
- Control Crucero

---

## vehiculos_equipamientos

Tabla intermedia que relaciona un vehículo con múltiples equipamientos.

---

# Principios de diseño

- No repetir información.
- Utilizar catálogos reutilizables.
- Evitar columnas duplicadas.
- Diseñar pensando en el crecimiento futuro.
- Mantener independencia entre datos comerciales y datos técnicos.

# Diseño de la tabla vehiculos

La tabla `vehiculos` representa cada unidad física ingresada al stock.

Dos vehículos del mismo modelo y versión deben registrarse por separado, porque pueden tener distinto kilometraje, color, precio, estado, número de chasis o situación comercial.

## Identificación

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único del vehículo |
| codigo_interno | Texto | Sí | Código único utilizado por MotoCars |
| tipo_vehiculo_id | UUID | Sí | Referencia al tipo de vehículo |
| marca_id | UUID | Sí | Referencia a la marca |
| modelo_id | UUID | Sí | Referencia al modelo |
| version_id | UUID | No | Referencia a la versión |
| anio | Número entero | Sí | Año o modelo del vehículo |

## Condición y estado

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| condicion | Catálogo | Sí | Nuevo, usado o consignación |
| estado_stock | Catálogo | Sí | Disponible, reservado, vendido, en preparación o fuera de stock |
| kilometraje | Número entero | No | Kilometraje actual |
| fecha_ingreso | Fecha | Sí | Fecha de ingreso al stock |
| fecha_egreso | Fecha | No | Fecha de salida definitiva del stock |

## Identificación registral

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| dominio | Texto | No | Patente del vehículo |
| vin | Texto | No | Número VIN |
| numero_chasis | Texto | No | Número de chasis |
| numero_motor | Texto | No | Número de motor |

Los campos registrales serán opcionales porque algunos vehículos nuevos pueden ingresar sin dominio asignado.

## Características técnicas

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| combustible_id | UUID | No | Referencia al tipo de combustible |
| transmision_id | UUID | No | Referencia al tipo de transmisión |
| traccion_id | UUID | No | Referencia al tipo de tracción |
| color_id | UUID | No | Referencia al color exterior |
| color_interior | Texto | No | Descripción del color interior |
| cilindrada_cc | Número entero | No | Cilindrada en centímetros cúbicos |
| potencia_cv | Número decimal | No | Potencia expresada en CV |
| puertas | Número entero | No | Cantidad de puertas |
| pasajeros | Número entero | No | Capacidad de pasajeros |

## Información comercial

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| moneda | Catálogo | Sí | ARS o USD |
| precio_venta | Número decimal | No | Precio público de venta |
| precio_costo | Número decimal | No | Costo de adquisición |
| precio_financiado | Número decimal | No | Precio de referencia financiado |
| acepta_permuta | Booleano | Sí | Indica si acepta vehículo en parte de pago |
| financiable | Booleano | Sí | Indica si admite financiación |
| porcentaje_comision | Número decimal | No | Comisión comercial aplicable |

Los precios deben almacenarse como valores numéricos, sin símbolos de moneda ni separadores de miles.

## Procedencia y propiedad

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| sucursal_id | UUID | No | Sucursal responsable del vehículo |
| ubicacion_id | UUID | No | Lugar físico donde se encuentra |
| proveedor_id | UUID | No | Proveedor o propietario de procedencia |
| propietario_actual | Texto | No | Titular actual cuando corresponda |
| es_consignacion | Booleano | Sí | Indica si pertenece a un tercero |

## Publicación web

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| publicado | Booleano | Sí | Define si aparece en el sitio público |
| destacado | Booleano | Sí | Define si aparece entre los destacados |
| slug | Texto | No | Dirección amigable utilizada en la web |
| titulo_publicacion | Texto | No | Título comercial visible |
| descripcion_publica | Texto largo | No | Descripción comercial |
| meta_descripcion | Texto | No | Descripción para buscadores |
| orden_publicacion | Número entero | No | Prioridad de aparición |

## Información interna

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| observaciones_internas | Texto largo | No | Información no visible públicamente |
| creado_por | UUID | No | Usuario que creó el registro |
| actualizado_por | UUID | No | Usuario que realizó la última modificación |
| created_at | Fecha y hora | Sí | Fecha de creación |
| updated_at | Fecha y hora | Sí | Fecha de última actualización |
| deleted_at | Fecha y hora | No | Fecha de eliminación lógica |

## Reglas iniciales

- `codigo_interno` debe ser único.
- `slug` debe ser único cuando el vehículo esté publicado.
- El kilometraje no puede ser negativo.
- Los precios no pueden ser negativos.
- Un vehículo vendido no debe aparecer como disponible.
- Un vehículo no debe publicarse sin marca, modelo, año y al menos una imagen.
- La eliminación será lógica mediante `deleted_at`.
- Los datos de costo y las observaciones internas nunca deben exponerse en el sitio público.

# Estándar de catálogos

Los catálogos del sistema deben seguir una estructura común para facilitar su administración, reutilización y mantenimiento.

Este estándar se aplicará, cuando corresponda, a:

- tipos de vehículo
- combustibles
- transmisiones
- tracciones
- colores
- condiciones del vehículo
- estados de stock
- equipamientos
- futuras clasificaciones reutilizables

## Estructura base

| Campo | Tipo conceptual | Obligatorio | Descripción |
|---|---|---:|---|
| id | UUID | Sí | Identificador único |
| nombre | Texto | Sí | Nombre visible |
| slug | Texto | Sí | Identificador amigable y estable |
| descripcion | Texto | No | Explicación o detalle adicional |
| activa | Booleano | Sí | Indica si puede utilizarse en nuevos registros |
| orden | Número entero | Sí | Orden de visualización |
| created_at | Fecha y hora | Sí | Fecha de creación |
| updated_at | Fecha y hora | Sí | Fecha de última actualización |

## Reglas generales

- `nombre` debe ser único dentro de cada catálogo.
- `slug` debe ser único dentro de cada catálogo.
- `orden` no puede ser negativo.
- Los registros utilizados por vehículos no deben eliminarse físicamente.
- Para dejar de utilizar una opción se debe establecer `activa = false`.
- Los registros inactivos deben conservarse en vehículos históricos.
- El panel debe mostrar primero los registros activos y luego los inactivos.
- Los selectores de alta y edición deben mostrar únicamente registros activos, salvo que el vehículo ya tenga asignado uno inactivo.
- Los nombres visibles pueden cambiar sin afectar las relaciones internas.
- El `slug` no debe modificarse sin una razón operativa concreta.

## Excepciones al estándar

Las tablas `marcas`, `modelos` y `versiones` comparten parte de esta estructura, pero tienen relaciones jerárquicas propias:

```text
marcas
  └── modelos
        └── versiones
```

La tabla `marcas` puede incluir además:

- `logo_url`

Las tablas `modelos` y `versiones` utilizan restricciones únicas compuestas porque sus nombres y slugs deben ser únicos dentro de su entidad superior.

Ejemplos:

```text
unique (marca_id, nombre)
unique (marca_id, slug)

unique (modelo_id, nombre)
unique (modelo_id, slug)
```

## Función compartida de actualización

Todas las tablas con el campo `updated_at` utilizarán una única función:

```sql
public.set_updated_at()
```

Cada tabla tendrá su propio trigger, pero no volverá a declarar la función.

## Eliminación y conservación histórica

Los catálogos no utilizarán eliminación física cuando tengan registros relacionados.

La estrategia general será:

```text
activa = false
```

Esto permite:

- conservar ventas y vehículos históricos;
- evitar referencias inválidas;
- impedir que una opción obsoleta aparezca en nuevos registros;
- mantener trazabilidad.