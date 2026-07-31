# MotoCars ERP
# Mapa General de Dependencias de Base de Datos

## Objetivo

Este documento define el orden de construcción de la base de datos y las dependencias entre todas las tablas del sistema.

Ninguna tabla deberá crearse sin conocer previamente de qué tablas depende y qué módulos la utilizarán.

---

# Catálogos Maestros

Estas tablas contienen información reutilizable en todo el sistema.

- marcas
- modelos
- versiones
- tipos_vehiculo
- combustibles
- transmisiones
- tracciones
- colores
- equipamientos
- sucursales
- ubicaciones

---

# Módulo Vehículos

marcas
└── modelos
    └── versiones
        └── vehiculos
            ├── vehiculos_imagenes
            ├── vehiculos_equipamientos
            ├── publicaciones_web
            └── movimientos_stock

---

# Módulo Clientes

clientes
├── domicilios
├── telefonos
├── emails
├── documentos
└── observaciones

---

# Módulo Presupuestos

presupuestos
├── presupuesto_items
├── presupuesto_descuentos
└── presupuesto_financiacion

Depende de:

- clientes
- vehiculos

---

# Módulo Reservas

reservas

Depende de:

- clientes
- vehiculos

---

# Módulo Ventas

ventas
├── venta_items
├── pagos
├── comprobantes

Depende de:

- clientes
- vehiculos
- reservas

---

# Módulo Compras

proveedores

compras

compra_items

Depende de:

- proveedores
- vehiculos

---

# Módulo CRM

seguimientos

tareas

recordatorios

interacciones

Depende de:

- clientes
- vendedores

---

# Módulo Usuarios

usuarios

roles

permisos

usuario_roles

---

# Módulo Caja

cajas

movimientos_caja

formas_pago

---

# Módulo Configuración

configuracion_empresa

configuracion_web

configuracion_notificaciones

---

# Integración Web

vehiculos
│
├── publicaciones_web
│
└── sitio público

---

# Orden recomendado de construcción

1. Configuración
2. Usuarios
3. Catálogos Maestros
4. Vehículos
5. Clientes
6. Presupuestos
7. Reservas
8. Ventas
9. Compras
10. Caja
11. CRM
12. Reportes
13. Automatizaciones
14. Integraciones externas

---

# Principios de arquitectura

- Las tablas transaccionales nunca deben duplicar información de los catálogos.
- Los módulos deben comunicarse mediante claves foráneas.
- No se utilizarán eliminaciones físicas cuando existan relaciones.
- Se priorizará la reutilización de catálogos comunes.
- Toda nueva tabla deberá incorporarse previamente a este documento antes de implementarse.