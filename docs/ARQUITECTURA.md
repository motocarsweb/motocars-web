# MotoCars ERP

## Documento de arquitectura

**Proyecto:** Sistema de Gestión MotoCars  
**Versión del documento:** 1.0  
**Estado:** En desarrollo  
**Tecnología principal:** Next.js + Supabase  

---

## 1. Objetivo del proyecto

MotoCars ERP es un sistema de gestión comercial desarrollado específicamente para una concesionaria de vehículos.

El sistema deberá permitir administrar de manera centralizada:

- vehículos;
- clientes;
- presupuestos;
- reservas;
- toma de vehículos usados;
- ventas;
- vendedores;
- cuentas bancarias;
- documentación;
- configuración de la empresa;
- reportes comerciales.

El proyecto también incluye el sitio público de MotoCars, donde se publican los vehículos disponibles.

El panel administrativo y el sitio público utilizarán la misma base de datos.

---

## 2. Principios del sistema

### 2.1. Configuración editable

Los datos comerciales no deben quedar escritos directamente dentro del código.

Desde el panel administrativo se deberá poder modificar:

- nombre comercial;
- razón social;
- CUIT;
- dirección;
- teléfonos;
- WhatsApp;
- correo electrónico;
- sitio web;
- redes sociales;
- logotipo;
- eslogan;
- colores;
- textos legales;
- condiciones de presupuestos;
- datos bancarios;
- información de vendedores.

---

### 2.2. Información centralizada

Cada dato debe almacenarse en un único lugar siempre que sea posible.

Por ejemplo:

- un cliente tendrá una sola ficha;
- un vehículo tendrá un solo registro;
- un vendedor tendrá un solo perfil;
- una cuenta bancaria tendrá un solo registro.

Los documentos comerciales podrán conservar una copia histórica de los datos utilizados al momento de su emisión.

---

### 2.3. Historial comercial

Las operaciones deberán conservar su trazabilidad.

Un presupuesto podrá evolucionar por diferentes estados:

- borrador;
- emitido;
- aceptado;
- rechazado;
- vencido;
- convertido en reserva;
- convertido en venta.

El sistema deberá registrar fechas, usuarios y cambios importantes.

---

### 2.4. Crecimiento modular

El sistema se desarrollará por módulos independientes.

Cada módulo tendrá:

- páginas;
- componentes;
- tipos de datos;
- servicios;
- validaciones;
- tablas de base de datos relacionadas.

Esto permitirá ampliar el sistema sin mezclar toda la lógica en un único archivo.

---

### 2.5. Interfaz consistente

Las pantallas administrativas deberán mantener una estructura visual común:

- título;
- descripción;
- acción principal;
- tarjetas informativas;
- buscador;
- filtros;
- tabla o listado;
- acciones por registro;
- estados visuales;
- confirmaciones de acciones sensibles.

---

## 3. Tecnologías

### Aplicación

- Next.js
- React
- TypeScript
- App Router

### Interfaz

- Tailwind CSS
- Lucide React

### Base de datos y almacenamiento

- Supabase
- PostgreSQL
- Supabase Storage

### Servicios previstos

- autenticación;
- base de datos;
- almacenamiento de imágenes;
- generación de documentos;
- impresión en PDF;
- códigos QR.

---

## 4. Estructura general del proyecto

```text
MotoCars-Web/
│
├── app/
│   ├── admin/
│   ├── vehiculos/
│   ├── layout.tsx
│   └── page.tsx
│
├── componentes/
│   ├── admin/
│   ├── configuracion/
│   ├── home/
│   ├── layout/
│   ├── presupuestos/
│   └── vehiculos/
│
├── lib/
│   ├── supabase/
│   ├── utilidades/
│   └── validaciones/
│
├── services/
│   ├── clientes.ts
│   ├── configuracion.ts
│   ├── presupuestos.ts
│   ├── usuarios.ts
│   └── vehiculos.ts
│
├── types/
│   ├── cliente.ts
│   ├── configuracion.ts
│   ├── presupuesto.ts
│   ├── usuario.ts
│   └── vehiculo.ts
│
├── public/
│   └── images/
│
├── docs/
│   └── ARQUITECTURA.md
│
└── package.json