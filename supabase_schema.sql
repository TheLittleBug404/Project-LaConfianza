-- ================================================================================
-- ESQUEMA COMPLETO Y NORMALIZADO (12 TABLAS) - CASA DE EMPEÑOS NELLY
-- Preparado para ejecución directa en Supabase (PostgreSQL)
-- ================================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================================
-- MÓDULO A: PERSONAL, SEGURIDAD Y ROLES
-- ================================================================================

-- 1. TABLA DE ROLES
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE EMPLEADOS
CREATE TABLE IF NOT EXISTS empleados (
    id VARCHAR(50) PRIMARY KEY,
    rol_id VARCHAR(50) REFERENCES roles(id) ON DELETE RESTRICT,
    nombre_completo VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(30) NOT NULL,
    salario NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    horario_trabajo TEXT NOT NULL,
    tareas_principales TEXT NOT NULL,
    observaciones TEXT,
    rol VARCHAR(20) DEFAULT 'EMPLEADO' CHECK (rol IN ('ADMIN', 'EMPLEADO')),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empleados_dni ON empleados(dni);
CREATE INDEX IF NOT EXISTS idx_empleados_rol_id ON empleados(rol_id);

-- ================================================================================
-- MÓDULO B: CLIENTES Y CALIFICACIÓN DE RIESGO
-- ================================================================================

-- 3. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(50) PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    direccion TEXT NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    categoria VARCHAR(20) DEFAULT 'NUEVO' CHECK (categoria IN ('NUEVO', 'ANTIGUO', 'VIP', 'MOROSO')),
    color_trafico VARCHAR(20) DEFAULT 'VERDE' CHECK (color_trafico IN ('VERDE', 'AMARILLO', 'ROJO')),
    puntuacion_credito INT DEFAULT 80 CHECK (puntuacion_credito BETWEEN 0 AND 100),
    total_prestamos INT DEFAULT 0,
    prestamos_activos INT DEFAULT 0,
    total_pagado NUMERIC(14,2) DEFAULT 0.00,
    total_prestado NUMERIC(14,2) DEFAULT 0.00,
    prestamos_default INT DEFAULT 0,
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
CREATE INDEX IF NOT EXISTS idx_clientes_color_trafico ON clientes(color_trafico);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre_completo);

-- ================================================================================
-- MÓDULO C: PRENDAS, CATEGORÍAS Y TASACIONES
-- ================================================================================

-- 4. TABLA DE CATEGORÍAS DE PRENDA
CREATE TABLE IF NOT EXISTS categorias_prenda (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    porcentaje_max_prestamo NUMERIC(5,2) DEFAULT 60.00,
    descripcion TEXT
);

-- 5. TABLA DE PRENDAS EN CUSTODIA / BÓVEDA
CREATE TABLE IF NOT EXISTS prendas (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    categoria_id VARCHAR(50) REFERENCES categorias_prenda(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    numero_serie VARCHAR(100),
    condicion VARCHAR(30) NOT NULL CHECK (condicion IN ('EXCELENTE', 'BUENO', 'REGULAR', 'DESGASTE_NORMAL')),
    valor_tasacion NUMERIC(12,2) NOT NULL,
    ubicacion_almacen VARCHAR(100),
    estado_prenda VARCHAR(30) DEFAULT 'EN_CUSTODIA' CHECK (estado_prenda IN ('EN_CUSTODIA', 'DEVUELTA', 'EN_REMATE', 'VENDIDA')),
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prendas_categoria_id ON prendas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_prendas_estado ON prendas(estado_prenda);

-- 6. TABLA DE HISTORIAL DE TASACIONES
CREATE TABLE IF NOT EXISTS tasaciones_historial (
    id VARCHAR(50) PRIMARY KEY,
    prenda_id VARCHAR(50) REFERENCES prendas(id) ON DELETE CASCADE,
    empleado_tasador_id VARCHAR(50) REFERENCES empleados(id) ON DELETE SET NULL,
    valor_comercial NUMERIC(12,2) NOT NULL,
    prestamo_sugerido NUMERIC(12,2) NOT NULL,
    fecha_tasacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasaciones_prenda_id ON tasaciones_historial(prenda_id);

-- ================================================================================
-- MÓDULO D: CONTRATOS DE PRÉSTAMO Y CRONOGRAMA DE CUOTAS
-- ================================================================================

-- 7. TABLA DE PRÉSTAMOS
CREATE TABLE IF NOT EXISTS prestamos (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    codigo_recibo VARCHAR(30) NOT NULL,
    cliente_id VARCHAR(50) REFERENCES clientes(id) ON DELETE RESTRICT,
    prenda_id VARCHAR(50) REFERENCES prendas(id) ON DELETE RESTRICT,
    empleado_id VARCHAR(50) REFERENCES empleados(id) ON DELETE SET NULL,
    nombre_cliente VARCHAR(150) NOT NULL,
    dni_cliente VARCHAR(20) NOT NULL,
    direccion_cliente TEXT,
    telefono_cliente VARCHAR(30),

    -- Campos directos de prenda para compatibilidad rápida con vistas existentes
    categoria_prenda VARCHAR(30) NOT NULL,
    nombre_prenda VARCHAR(150) NOT NULL,
    descripcion_prenda TEXT,
    numero_serie VARCHAR(100),
    condicion_prenda VARCHAR(30) NOT NULL,
    valor_tasacion NUMERIC(12,2) NOT NULL,
    ubicacion_almacen VARCHAR(100),
    estado_prenda VARCHAR(30) DEFAULT 'EN_CUSTODIA',

    -- Condiciones Financieras
    monto_prestamo NUMERIC(12,2) NOT NULL,
    capital_restante NUMERIC(12,2) NOT NULL,
    tasa_interes_mensual NUMERIC(5,2) DEFAULT 3.00,
    tasa_gastos_admin NUMERIC(5,2) DEFAULT 12.00,
    gastos_admin NUMERIC(12,2) DEFAULT 0.00,
    dias_plazo INT DEFAULT 30 CHECK (dias_plazo IN (30, 60, 90, 120, 150, 180)),
    meses_plazo INT DEFAULT 1,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE NOT NULL,
    dias_gracia INT DEFAULT 5,
    estado VARCHAR(20) DEFAULT 'VIGENTE' CHECK (estado IN ('VIGENTE', 'POR_VENCER', 'EN_MORA', 'PAGADO', 'REMATADO')),
    total_intereses_pagados NUMERIC(12,2) DEFAULT 0.00,
    total_capital_pagado NUMERIC(12,2) DEFAULT 0.00,
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_prestamos_cliente_id ON prestamos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_prenda_id ON prestamos(prenda_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_empleado_id ON prestamos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_codigo_recibo ON prestamos(codigo_recibo);
CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado);

-- 8. TABLA DE PLAN DE PAGOS (CUOTAS / REFRENDOS)
CREATE TABLE IF NOT EXISTS plan_pagos (
    id VARCHAR(50) PRIMARY KEY,
    prestamo_id VARCHAR(50) REFERENCES prestamos(id) ON DELETE CASCADE,
    numero_periodo INT NOT NULL,
    fecha_limite_pago TIMESTAMP WITH TIME ZONE NOT NULL,
    monto_interes NUMERIC(12,2) NOT NULL,
    estado_cuota VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado_cuota IN ('PENDIENTE', 'PAGADO', 'MORA')),
    pagado_el TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_plan_pagos_prestamo_id ON plan_pagos(prestamo_id);

-- ================================================================================
-- MÓDULO E: FLUJO DE CAJA, ARQUEO Y TRANSACCIONES
-- ================================================================================

-- 9. TABLA DE SESIONES DE CAJA (APERTURA Y CIERRE DIARIO)
CREATE TABLE IF NOT EXISTS caja_sesiones (
    id VARCHAR(50) PRIMARY KEY,
    empleado_id VARCHAR(50) REFERENCES empleados(id) ON DELETE RESTRICT,
    fecha_operacion DATE DEFAULT CURRENT_DATE,
    saldo_apertura NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_ingresos NUMERIC(12,2) DEFAULT 0.00,
    total_egresos NUMERIC(12,2) DEFAULT 0.00,
    saldo_cierre_teorico NUMERIC(12,2) DEFAULT 0.00,
    saldo_cierre_real NUMERIC(12,2),
    diferencia_cuadre NUMERIC(12,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA', 'CERRADA')),
    abierto_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cerrado_el TIMESTAMP WITH TIME ZONE,
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_caja_sesiones_fecha ON caja_sesiones(fecha_operacion);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_empleado_id ON caja_sesiones(empleado_id);

-- 10. TABLA DE PAGOS Y MOVIMIENTOS
CREATE TABLE IF NOT EXISTS pagos (
    id VARCHAR(50) PRIMARY KEY,
    sesion_caja_id VARCHAR(50) REFERENCES caja_sesiones(id) ON DELETE SET NULL,
    prestamo_id VARCHAR(50) REFERENCES prestamos(id) ON DELETE SET NULL,
    cliente_id VARCHAR(50) REFERENCES clientes(id) ON DELETE SET NULL,
    empleado_id VARCHAR(50) REFERENCES empleados(id) ON DELETE SET NULL,
    codigo_prestamo VARCHAR(30) NOT NULL,
    nombre_cliente VARCHAR(150) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('DESEMBOLSO_INICIAL', 'PAGO_INTERES_REFRENDO', 'ABONO_CAPITAL', 'LIQUIDACION_TOTAL')),
    monto NUMERIC(12,2) NOT NULL,
    porcion_capital NUMERIC(12,2) DEFAULT 0.00,
    porcion_interes NUMERIC(12,2) DEFAULT 0.00,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metodo_pago VARCHAR(20) DEFAULT 'EFECTIVO' CHECK (metodo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'QR')),
    codigo_recibo VARCHAR(30) NOT NULL,
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_pagos_prestamo_id ON pagos(prestamo_id);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente_id ON pagos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_empleado_id ON pagos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha);

-- ================================================================================
-- MÓDULO F: REMATES Y CONFIGURACIÓN GLOBAL
-- ================================================================================

-- 11. TABLA DE REMATES (ARTÍCULOS DE MOROSOS VENDIDOS)
CREATE TABLE IF NOT EXISTS remates (
    id VARCHAR(50) PRIMARY KEY,
    prenda_id VARCHAR(50) REFERENCES prendas(id) ON DELETE RESTRICT UNIQUE,
    prestamo_origen_id VARCHAR(50) REFERENCES prestamos(id) ON DELETE SET NULL,
    capital_adeudado NUMERIC(12,2) NOT NULL,
    precio_base_subasta NUMERIC(12,2) NOT NULL,
    precio_venta_final NUMERIC(12,2),
    fecha_ingreso_remate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_venta TIMESTAMP WITH TIME ZONE,
    comprador_nombre VARCHAR(150),
    estado_remate VARCHAR(20) DEFAULT 'EN_VITRINA' CHECK (estado_remate IN ('EN_VITRINA', 'VENDIDO', 'FUNDICION')),
    observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_remates_prenda_id ON remates(prenda_id);

-- 12. TABLA DE CONFIGURACIÓN GLOBAL E HISTORIAL DE PRESUPUESTO
CREATE TABLE IF NOT EXISTS configuracion (
    clave VARCHAR(100) PRIMARY KEY,
    valor JSONB NOT NULL,
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================================
-- INSERCIÓN DE DATOS DE EJEMPLO (SEED DATA COMPATIBLE)
-- ================================================================================

-- Configuración Inicial
INSERT INTO configuracion (clave, valor) VALUES 
('monthly_budget', '50000'::jsonb),
('default_interest_rate', '3.00'::jsonb),
('default_admin_expense_rate', '12.00'::jsonb)
ON CONFLICT (clave) DO NOTHING;

-- Roles
INSERT INTO roles (id, nombre, descripcion) VALUES
('rol-admin', 'ADMINISTRADOR', 'Acceso total al sistema, reportes, configuración y empleados'),
('rol-empleado', 'EMPLEADO', 'Atención en ventanilla, empeños, cobro de refrendos y caja')
ON CONFLICT (id) DO NOTHING;

-- Empleados
INSERT INTO empleados (id, rol_id, nombre_completo, dni, telefono, salario, horario_trabajo, tareas_principales, observaciones, rol, estado)
VALUES 
('emp-1', 'rol-admin', 'Roberto Gómez Flores', '61829304', '71234567', 3200.00, 'Lunes a Viernes de 8:30 a 17:30, Sábados de 8:30 a 13:00', 'Atención en ventanilla, recepción y tasación de joyas, registro de clientes nuevos y emisión de boletas de empeño.', 'Encargado de apertura y custodia de caja menor.', 'ADMIN', 'ACTIVO'),
('emp-2', 'rol-empleado', 'Lucía Fernández Quispe', '59281043', '68921450', 2800.00, 'Lunes a Viernes de 9:00 a 18:00', 'Custodia y organización de prendas en bóveda, control de inventario físico, llamadas de cortesía por vencimientos próximos.', 'Turno tarde y archivo de pólizas.', 'EMPLEADO', 'ACTIVO')
ON CONFLICT (id) DO NOTHING;

-- Categorías de Prenda
INSERT INTO categorias_prenda (id, nombre, porcentaje_max_prestamo, descripcion) VALUES
('cat-joyeria-oro', 'JOYERIA_ORO', 65.00, 'Joyas de oro 14k, 18k y 24k'),
('cat-joyeria-plata', 'JOYERIA_PLATA', 50.00, 'Joyas y orfebrería en plata 925'),
('cat-electronica', 'ELECTRONICA', 45.00, 'Laptops, televisores, consolas y smartphones'),
('cat-herramientas', 'HERRAMIENTAS', 40.00, 'Maquinaria y herramientas eléctricas profesionales'),
('cat-vehiculos', 'VEHICULOS', 50.00, 'Automóviles y motocicletas con documentación en regla')
ON CONFLICT (id) DO NOTHING;

-- Clientes
INSERT INTO clientes (id, dni, nombre_completo, telefono, email, direccion, categoria, color_trafico, puntuacion_credito, total_prestamos, prestamos_activos, total_pagado, total_prestado, prestamos_default, observaciones)
VALUES 
('cust-1', '72384910', 'Carlos Mendoza Rivera', '71234567', 'carlos.mendoza@gmail.com', 'Calle Bolívar 120, Zona Central', 'VIP', 'VERDE', 98, 8, 1, 14500.00, 18000.00, 0, 'Cliente muy puntual. Siempre refrenda antes de fecha y cuida sus prendas.'),
('cust-2', '45192837', 'María Elena Vargas Solís', '76543210', 'maria.vargas@hotmail.com', 'Av. 6 de Agosto 430, Edif. Los Pinos', 'ANTIGUO', 'AMARILLO', 78, 4, 1, 5200.00, 6400.00, 0, 'Cliente regular. Suele pedir prórroga de 3 a 5 días pero cumple.'),
('cust-3', '78291044', 'Kevin Alexander Quispe', '68123456', 'kevin.quispe@outlook.com', 'Calle San Martín 880, Int. 4', 'NUEVO', 'VERDE', 82, 1, 1, 0.00, 1800.00, 0, 'Cliente nuevo. Empeñó laptop gaming en excelente estado.'),
('cust-4', '38291023', 'Jorge Luis Mamani Choque', '79812345', 'jorgeluis.mamani@gmail.com', 'Villa Victoria, Calle 3 Nº 412', 'MOROSO', 'ROJO', 25, 3, 1, 600.00, 3500.00, 1, 'Cliente moroso crítico. Retraso superior a 45 días sin pagar refrendo.')
ON CONFLICT (id) DO NOTHING;

-- Prendas
INSERT INTO prendas (id, codigo, categoria_id, nombre, descripcion, numero_serie, condicion, valor_tasacion, ubicacion_almacen, estado_prenda)
VALUES
('item-1', 'PRD-001201', 'cat-joyeria-oro', 'Anillo de Oro 18k con Diamante 0.25ct', 'Anillo solitario de compromiso, 4.2 gramos, grabado interior C&M.', NULL, 'EXCELENTE', 4200.00, 'Bóveda A - Casillero 04', 'EN_CUSTODIA'),
('item-2', 'PRD-001202', 'cat-electronica', 'Smart TV Samsung 55" QLED 4K', 'Modelo QN55Q60B con control remoto original y cable de poder.', 'SN-SAMS-99824', 'BUENO', 2400.00, 'Estante B2 - Almacén Electrónica', 'EN_CUSTODIA'),
('item-3', 'PRD-001203', 'cat-herramientas', 'Taladro Percutor Industrial Bosch 800W', 'Incluye maletín original y juego de 15 brocas para concreto.', 'BSH-IND-7712', 'REGULAR', 1800.00, 'Estante C1 - Taller', 'EN_CUSTODIA'),
('item-4', 'PRD-001204', 'cat-electronica', 'Laptop Lenovo Legion 5 Gaming 16GB RAM', 'Procesador AMD Ryzen 7, RTX 3060, cargador original de 230W.', 'PF-39A208B', 'EXCELENTE', 3200.00, 'Bóveda Principal - Casillero E2', 'EN_CUSTODIA')
ON CONFLICT (id) DO NOTHING;

-- Tasaciones Historial
INSERT INTO tasaciones_historial (id, prenda_id, empleado_tasador_id, valor_comercial, prestamo_sugerido, observaciones)
VALUES
('tas-1', 'item-1', 'emp-1', 4200.00, 2500.00, 'Oro verificado con ácido y densímetro.'),
('tas-2', 'item-2', 'emp-2', 2400.00, 1400.00, 'Pantalla sin rayones, puertos probados en ventanilla.'),
('tas-3', 'item-3', 'emp-1', 1800.00, 1100.00, 'Carbones en buen estado, encendido óptimo.'),
('tas-4', 'item-4', 'emp-2', 3200.00, 1800.00, 'Batería con 94% de vida útil, cargador original.')
ON CONFLICT (id) DO NOTHING;

-- Préstamos
INSERT INTO prestamos (
    id, codigo, codigo_recibo, cliente_id, prenda_id, empleado_id,
    nombre_cliente, dni_cliente, direccion_cliente, telefono_cliente,
    categoria_prenda, nombre_prenda, descripcion_prenda, numero_serie,
    condicion_prenda, valor_tasacion, ubicacion_almacen, estado_prenda,
    monto_prestamo, capital_restante, tasa_interes_mensual, tasa_gastos_admin,
    gastos_admin, dias_plazo, meses_plazo, fecha_inicio, fecha_vencimiento,
    dias_gracia, estado, total_intereses_pagados, total_capital_pagado, observaciones
) VALUES
('loan-1', 'A1', 'A1', 'cust-1', 'item-1', 'emp-1', 'Carlos Mendoza Rivera', '72384910', 'Calle Bolívar 120, Zona Central', '71234567', 'JOYERIA_ORO', 'Anillo de Oro 18k con Diamante 0.25ct', 'Anillo solitario de compromiso, 4.2 gramos, grabado interior C&M.', NULL, 'EXCELENTE', 4200.00, 'Bóveda A - Casillero 04', 'EN_CUSTODIA', 2500.00, 2500.00, 3.00, 12.00, 300.00, 30, 1, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 5, 'VIGENTE', 0.00, 0.00, 'Prenda resguardada con seguro en bóveda principal.'),
('loan-2', 'A2', 'A2', 'cust-2', 'item-2', 'emp-1', 'María Elena Vargas Solís', '45192837', 'Av. 6 de Agosto 430, Edif. Los Pinos', '76543210', 'ELECTRONICA', 'Smart TV Samsung 55" QLED 4K', 'Modelo QN55Q60B con control remoto original y cable de poder.', 'SN-SAMS-99824', 'BUENO', 2400.00, 'Estante B2 - Almacén Electrónica', 'EN_CUSTODIA', 1400.00, 1400.00, 3.00, 12.00, 168.00, 60, 2, NOW() - INTERVAL '58 days', NOW() + INTERVAL '2 days', 5, 'POR_VENCER', 42.00, 0.00, 'Vence en 2 días. Cliente fue contactada para refrendo.'),
('loan-3', 'A3', 'A3', 'cust-4', 'item-3', 'emp-1', 'Jorge Luis Mamani Choque', '38291023', 'Villa Victoria, Calle 3 Nº 412', '79812345', 'HERRAMIENTAS', 'Taladro Percutor Industrial Bosch 800W', 'Incluye maletín original y juego de 15 brocas para concreto.', 'BSH-IND-7712', 'REGULAR', 1800.00, 'Estante C1 - Taller', 'EN_CUSTODIA', 1100.00, 1100.00, 3.00, 12.00, 132.00, 30, 1, NOW() - INTERVAL '48 days', NOW() - INTERVAL '18 days', 5, 'EN_MORA', 0.00, 0.00, '18 días de mora. Se enviará a remate si no liquida.'),
('loan-4', 'A4', 'A4', 'cust-3', 'item-4', 'emp-2', 'Kevin Alexander Quispe', '78291044', 'Calle San Martín 880, Int. 4', '68123456', 'ELECTRONICA', 'Laptop Lenovo Legion 5 Gaming 16GB RAM', 'Procesador AMD Ryzen 7, RTX 3060, cargador original de 230W.', 'PF-39A208B', 'EXCELENTE', 3200.00, 'Bóveda Principal - Casillero E2', 'EN_CUSTODIA', 1800.00, 1800.00, 3.00, 12.00, 216.00, 30, 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 5, 'VIGENTE', 0.00, 0.00, 'Nuevo empeño de cliente Kevin Alexander.')
ON CONFLICT (id) DO NOTHING;

-- Plan de Pagos de Ejemplo
INSERT INTO plan_pagos (id, prestamo_id, numero_periodo, fecha_limite_pago, monto_interes, estado_cuota) VALUES
('plan-1', 'loan-1', 1, NOW() + INTERVAL '20 days', 75.00, 'PENDIENTE'),
('plan-2', 'loan-2', 1, NOW() - INTERVAL '28 days', 42.00, 'PAGADO'),
('plan-3', 'loan-2', 2, NOW() + INTERVAL '2 days', 42.00, 'PENDIENTE')
ON CONFLICT (id) DO NOTHING;

-- Sesión de Caja Activa
INSERT INTO caja_sesiones (id, empleado_id, fecha_operacion, saldo_apertura, total_ingresos, total_egresos, saldo_cierre_teorico, estado)
VALUES
('ses-hoy', 'emp-1', CURRENT_DATE, 5000.00, 42.00, 1800.00, 3242.00, 'ABIERTA')
ON CONFLICT (id) DO NOTHING;

-- Pagos
INSERT INTO pagos (id, sesion_caja_id, prestamo_id, cliente_id, empleado_id, codigo_prestamo, nombre_cliente, tipo, monto, capital_portion, interest_portion, fecha, metodo_pago, codigo_recibo, observaciones)
VALUES
('pay-1', 'ses-hoy', 'loan-1', 'cust-1', 'emp-1', 'A1', 'Carlos Mendoza Rivera', 'DESEMBOLSO_INICIAL', 2500.00, 2500.00, 0.00, NOW() - INTERVAL '10 days', 'EFECTIVO', 'A1', 'Desembolso inicial por empeño de anillo de oro.'),
('pay-2', 'ses-hoy', 'loan-2', 'cust-2', 'emp-1', 'A2', 'María Elena Vargas Solís', 'PAGO_INTERES_REFRENDO', 42.00, 0.00, 42.00, NOW() - INTERVAL '28 days', 'EFECTIVO', 'REC-0982', 'Pago de interés para prórroga de Smart TV.'),
('pay-3', 'ses-hoy', 'loan-4', 'cust-3', 'emp-2', 'A4', 'Kevin Alexander Quispe', 'DESEMBOLSO_INICIAL', 1800.00, 1800.00, 0.00, NOW() - INTERVAL '5 days', 'EFECTIVO', 'A4', 'Desembolso inicial por empeño de laptop gaming.')
ON CONFLICT (id) DO NOTHING;

-- Remate de Ejemplo (Préstamo en mora)
INSERT INTO remates (id, prenda_id, prestamo_origen_id, capital_adeudado, precio_base_subasta, estado_remate, observaciones)
VALUES
('rem-1', 'item-3', 'loan-3', 1100.00, 1300.00, 'EN_VITRINA', 'Prenda en remate por morosidad mayor a 45 días del cliente Jorge Mamani.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================================
-- ELIMINACION DE TABLAS EN SUPABASE
-- ================================================================================

DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS prestamos CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;
-- y si quieres borrar también las inglesas:
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
