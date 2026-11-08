/**
 * Clase constante para centralizar todos los títulos, subtítulos
 * y textos de cabecera de la aplicación web.
 */
export class AppTitles {
  // Configuración general y marca
  public static readonly BRAND = {
    TITLE: 'La Confianza',
    SHORT_TITLE: 'La Confianza',
    SUBTITLE: 'Préstamos de Dinero con Garantía Prendaria',
    SLOGAN: 'Préstamos de Dinero "La Confianza"',
  } as const;

  // Barra de navegación
  public static readonly NAVBAR = {
    DASHBOARD: 'Panel Principal',
    LOANS: 'Préstamos',
    CUSTOMERS: 'Clientes',
    VAULT: 'Bóveda / Stock',
    CASHIER: 'Caja & Flujo',
    RESET_DEMO_TITLE: 'Restablecer base de datos demo',
    QUICK_LOAN_BUTTON: 'Nuevo Empeño',
    QUICK_CUSTOMER_BUTTON: 'Nuevo Cliente',
  } as const;

  // Panel Principal (Dashboard)
  public static readonly DASHBOARD = {
    TITLE: 'Panel de Control Operativo',
    SUBTITLE: 'Gestión inteligente de empeños, contratos activos y cartera de clientes',
    METRICS: {
      ACTIVE_LOANS_TITLE: 'Cartera Activa Prestada',
      ACTIVE_LOANS_SUBTITLE: 'Capital vigente en calle',
      INTEREST_EARNED_TITLE: 'Intereses Cobrados (Total)',
      INTEREST_EARNED_SUBTITLE: 'Ganancia bruta acumulada',
      VAULT_ITEMS_TITLE: 'Prendas en Custodia',
      VAULT_ITEMS_SUBTITLE: 'Artículos resguardados en bóveda',
      DEFAULT_RATE_TITLE: 'Tasa de Incumplimiento',
      DEFAULT_RATE_SUBTITLE: 'Porcentaje en estado vencido',
    },
    SECTIONS: {
      ALERTS_TITLE: 'Alertas y Próximos Vencimientos',
      ALERTS_SUBTITLE: 'Contratos con pagos urgentes o en período de gracia',
      DISTRIBUTION_TITLE: 'Distribución de Cartera por Tipo de Prenda',
      DISTRIBUTION_SUBTITLE: 'Concentración de riesgo por categoría colateral',
    },
  } as const;

  // Módulo de Préstamos / Empeños
  public static readonly LOANS = {
    TITLE: 'Gestión de Préstamos y Empeños',
    SUBTITLE: 'Seguimiento de contratos, cobranzas, amortizaciones y liquidaciones',
    EMPTY_TITLE: 'No hay préstamos con este criterio',
    EMPTY_SUBTITLE: 'Intente cambiando los filtros o el término de búsqueda',
    MODAL_NEW_TITLE: 'Nuevo Contrato de Empeño',
    MODAL_NEW_SUBTITLE: 'Registre los datos del cliente, prenda y condiciones financieras',
    MODAL_DETAIL_TITLE: 'Detalle del Contrato',
    MODAL_DETAIL_SUBTITLE: 'Historial de pagos, estado de la prenda y opciones de cobranza',
  } as const;

  // Módulo de Clientes
  public static readonly CUSTOMERS = {
    TITLE: 'Directorio de Clientes & Perfiles de Riesgo',
    SUBTITLE: 'Historial de cumplimiento, scoring crediticio e información de contacto',
    EMPTY_TITLE: 'No se encontraron clientes',
    EMPTY_SUBTITLE: 'Pruebe con otro nombre, documento o agregue un nuevo cliente',
    MODAL_CREATE_TITLE: 'Registrar Nuevo Cliente',
    MODAL_EDIT_TITLE: 'Editar Información del Cliente',
    MODAL_VIEW_TITLE: 'Perfil y Scoring del Cliente',
    RISK_LEVELS: {
      VIP_TITLE: 'Cliente VIP',
      VIP_SUBTITLE: 'Excelente historial de pago y bajo riesgo',
      RECURRENT_TITLE: 'Cliente Antiguo / Recurrente',
      RECURRENT_SUBTITLE: 'Historial confiable y operaciones constantes',
      NEW_TITLE: 'Cliente Nuevo',
      NEW_SUBTITLE: 'Primera operación, requiere monitoreo estándar',
      OVERDUE_TITLE: 'Cliente en Mora / Alto Riesgo',
      OVERDUE_SUBTITLE: 'Registra atrasos o incumplimientos previos',
    },
  } as const;

  // Módulo de Almacén e Inventario
  public static readonly VAULT = {
    TITLE: 'Almacén & Inventario de Prendas',
    SUBTITLE: 'Control físico de prendas empeñadas, ubicación en garajes de vehículos, estanterías y avalúos',
    EMPTY_TITLE: 'No hay prendas en este filtro',
    EMPTY_SUBTITLE: 'No se encontraron artículos resguardados bajo los criterios seleccionados',
  } as const;

  // Módulo de Caja y Flujo
  public static readonly CASHIER = {
    TITLE: 'Control de Caja y Flujo Diario',
    SUBTITLE: 'Registro de ingresos por pagos/liquidaciones y egresos por desembolsos',
    METRICS: {
      INCOME_TITLE: 'Total Entradas (Cobranzas)',
      INCOME_SUBTITLE: 'Ingresos por intereses y liquidaciones',
      EXPENSE_TITLE: 'Total Salidas (Desembolsos)',
      EXPENSE_SUBTITLE: 'Capital entregado en nuevos préstamos',
      NET_BALANCE_TITLE: 'Balance Neto de Operaciones',
      NET_BALANCE_SUBTITLE: 'Flujo de caja efectivo en período',
    },
    EMPTY_TITLE: 'No hay transacciones registradas',
    EMPTY_SUBTITLE: 'Las operaciones de préstamo y pago aparecerán registradas aquí automáticamente',
  } as const;

  // Módulo de Autenticación / Login
  public static readonly AUTH = {
    TITLE: 'Iniciar Sesión',
    SUBTITLE: 'Ingrese sus credenciales para acceder al sistema operativo',
    USERNAME_LABEL: 'Usuario',
    USERNAME_PLACEHOLDER: 'Ingrese usuario (ej. usuario)',
    PASSWORD_LABEL: 'Contraseña',
    PASSWORD_PLACEHOLDER: '••••••••',
    SUBMIT_BUTTON: 'Acceder al Sistema',
    ERROR_INVALID: 'Credenciales inválidas. Compruebe usuario y contraseña.',
    DEMO_HINT: 'Credenciales de acceso: usuario / 1234',
  } as const;

  // Comprobante / Ticket
  public static readonly TICKET = {
    TITLE: 'Comprobante Oficial de Empeño',
    SUBTITLE: 'Documento legal de custodia, términos prendarios y recibo',
  } as const;
}

// Exportación por defecto para conveniencia
export default AppTitles;

