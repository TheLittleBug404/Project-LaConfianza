# Sistema de Casa de Empeños - Nelly

Sistema web de gestión para casa de empeños diseñado especialmente con interfaz simple, accesible y de alta legibilidad para personas de la tercera edad.

---

## Características Principales

- **Roles de Usuario**:
  - `ADMIN` (Administrador): Control total, configuración de presupuesto mensual, gestión de personal (sueldos, horarios, tareas) y reportes financieros.
  - `EMPLEADO` (Operador): Registro de clientes, emisión de empeños y cobro de cuotas/intereses en caja.
- **Semaforización Automática de Clientes**:
  - **Verde (Cliente Excelente)**: Historial impecable, pago puntual, habilitado para ampliaciones de crédito.
  - **Amarillo (Cliente Regular)**: Presenta retrasos leves pero cumple.
  - **Rojo (Cliente Malo)**: Moroso crítico, bloqueado o con advertencia estricta para nuevos préstamos.
- **Gestión de Préstamos y Empeños**:
  - Tasa de interés mensual configurable (por defecto al 3%).
  - Plazos estructurados en bloques de 30 días (30, 60, 90, 120 días).
  - Correlativo de recibos automático: `A1...A1000`, `B1...B1000`, etc.
  - Alerta de tope de presupuesto mensual.
- **Caja Diaria y Cierre**:
  - Control de ingresos por refrendos o amortizaciones y egresos por préstamos.
  - Generación de boletas/tickets en pantalla.
  - Resumen de cierre diario con totales de efectivo y balance neto.
- **Persistencia Híbrida**:
  - Base de datos local en el navegador mediante `IndexedDB`.
  - Script SQL en español listo para sincronizar con `Supabase` (PostgreSQL).

---

## Requisitos Previos

- **Node.js**: Versión 18 o superior.
- **npm**: Gestor de paquetes incluido con Node.js.

---

## Instalación

1. Clonar el repositorio o ingresar a la carpeta del proyecto:
```bash
cd project-nelly
```

2. Instalar las dependencias necesarias:
```bash
npm install
```

---

## Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga rápida (HMR). |
| `npm run build` | Compila y optimiza la aplicación para producción en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente la compilación de producción. |
| `npm run lint` | Ejecuta el análisis estático de código con ESLint. |

---

## Ejecución en Modo Desarrollo

Para iniciar la aplicación en tu entorno local:

```bash
npm run dev
```

Abre en tu navegador la dirección indicada en la terminal:
```text
http://localhost:5173
```

---

## Configuración de Base de Datos en Supabase

Si deseas migrar los datos locales a la nube con Supabase:

1. Ingresa a tu panel de **Supabase**.
2. Abre la sección **SQL Editor**.
3. Copia y pega el contenido completo del archivo:
```text
supabase_schema.sql
```
4. Haz clic en **Run** para crear las tablas (`clientes`, `empleados`, `prestamos`, `pagos`, `configuracion`), claves foráneas, índices y datos iniciales de prueba.

---

## Estructura del Proyecto

```text
project-nelly/
├── src/
│   ├── components/
│   │   ├── Auth/           # Vista de inicio de sesión y validación de roles
│   │   ├── Cashier/        # Caja diaria, arqueo y cierre de operaciones
│   │   ├── Common/         # Modales y componentes visuales reutilizables (Ticket)
│   │   ├── Customers/      # Directorio de clientes y semáforo de riesgo
│   │   ├── Dashboard/      # Tablero principal con métricas resumidas
│   │   ├── Employees/      # Administración de empleados, salarios y horarios
│   │   ├── Inventory/      # Control de prendas en bóveda/almacén
│   │   └── Loans/          # Registro de empeños, emisión de boletas y detalles
│   ├── context/            # Estado global con React Context (PawnContext)
│   ├── database/           # Configuración de base de datos local (IndexedDB y datos semilla)
│   ├── services/           # Servicios de almacenamiento y respaldo JSON
│   ├── types/              # Definiciones e interfaces de TypeScript
│   └── utils/              # Funciones auxiliares (cálculo de calificación y correlativos)
├── supabase_schema.sql     # Esquema DDL para base de datos PostgreSQL en Supabase
├── index.html              # Punto de entrada HTML
├── vite.config.ts          # Configuración del empaquetador Vite
└── package.json            # Dependencias y scripts del proyecto
```
