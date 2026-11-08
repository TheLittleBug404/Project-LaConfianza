-- ==============================================================================
-- ESQUEMA OFICIAL SUPABASE (PostgreSQL) - CASA DE EMPEÑOS NELLY
-- Preparado para migración directa desde la Base de Datos Local (IndexedDB)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE CONFIGURACIÓN GLOBAL
CREATE TABLE IF NOT EXISTS app_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category VARCHAR(20) DEFAULT 'NUEVO' CHECK (category IN ('NUEVO', 'ANTIGUO', 'VIP', 'MOROSO')),
    traffic_color VARCHAR(20) DEFAULT 'VERDE' CHECK (traffic_color IN ('VERDE', 'AMARILLO', 'ROJO')),
    credit_score INT DEFAULT 80 CHECK (credit_score BETWEEN 0 AND 100),
    total_loans_count INT DEFAULT 0,
    active_loans_count INT DEFAULT 0,
    total_paid_amount NUMERIC(14, 2) DEFAULT 0.00,
    total_borrowed_amount NUMERIC(14, 2) DEFAULT 0.00,
    defaulted_loans_count INT DEFAULT 0,
    notes TEXT
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_customers_dni ON customers(dni);
CREATE INDEX IF NOT EXISTS idx_customers_traffic_color ON customers(traffic_color);
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON customers(full_name);

-- 4. TABLA DE EMPLEADOS
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    work_schedule TEXT NOT NULL,
    primary_duties TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVO' CHECK (status IN ('ACTIVO', 'INACTIVO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE PRÉSTAMOS Y EMPEÑOS (PAWN LOANS)
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) NOT NULL,
    receipt_code VARCHAR(30) NOT NULL,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(150) NOT NULL,
    customer_dni VARCHAR(20) NOT NULL,
    customer_address TEXT,
    customer_phone VARCHAR(30),
    
    -- Datos de la Prenda
    item_category VARCHAR(30) NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    item_description TEXT,
    item_serial_number VARCHAR(100),
    item_condition VARCHAR(30) NOT NULL,
    item_appraisal_value NUMERIC(12, 2) NOT NULL,
    item_storage_location VARCHAR(100),
    item_status VARCHAR(30) DEFAULT 'EN_CUSTODIA',

    -- Condiciones Financieras
    loan_amount NUMERIC(12, 2) NOT NULL,
    remaining_capital NUMERIC(12, 2) NOT NULL,
    monthly_interest_rate NUMERIC(5, 2) DEFAULT 3.00,
    admin_expenses_rate NUMERIC(5, 2) DEFAULT 12.00,
    admin_expenses_amount NUMERIC(12, 2) DEFAULT 0.00,
    term_days INT DEFAULT 30,
    term_months INT DEFAULT 1,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    grace_period_days INT DEFAULT 5,
    status VARCHAR(20) DEFAULT 'VIGENTE' CHECK (status IN ('VIGENTE', 'POR_VENCER', 'EN_MORA', 'PAGADO', 'REMATADO')),
    total_interest_paid NUMERIC(12, 2) DEFAULT 0.00,
    total_capital_paid NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_receipt_code ON loans(receipt_code);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- 6. TABLA DE MOVIMIENTOS Y CAJA (PAYMENTS)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    loan_id VARCHAR(50) REFERENCES loans(id) ON DELETE SET NULL,
    loan_code VARCHAR(30) NOT NULL,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('DESEMBOLSO_INICIAL', 'PAGO_INTERES_REFRENDO', 'ABONO_CAPITAL', 'LIQUIDACION_TOTAL')),
    amount NUMERIC(12, 2) NOT NULL,
    capital_portion NUMERIC(12, 2) DEFAULT 0.00,
    interest_portion NUMERIC(12, 2) DEFAULT 0.00,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_method VARCHAR(20) DEFAULT 'EFECTIVO' CHECK (payment_method IN ('EFECTIVO', 'TRANSFERENCIA', 'QR')),
    receipt_code VARCHAR(30) NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

-- ==============================================================================
-- INSERCIÓN DE DATOS DE EJEMPLO (SEED DATA)
-- ==============================================================================

-- Configuración de Fondo
INSERT INTO app_config (key, value) VALUES ('monthly_budget', '50000'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4 Clientes de Ejemplo
INSERT INTO customers (id, dni, full_name, phone, email, address, category, traffic_color, credit_score, total_loans_count, active_loans_count, total_paid_amount, total_borrowed_amount, defaulted_loans_count, notes)
VALUES 
('cust-1', '72384910', 'Carlos Mendoza Rivera', '71234567', 'carlos.mendoza@gmail.com', 'Calle Bolívar 120, Zona Central', 'VIP', 'VERDE', 98, 8, 1, 14500.00, 18000.00, 0, 'Cliente muy puntual. Siempre refrenda antes de fecha y cuida sus prendas.'),
('cust-2', '45192837', 'María Elena Vargas Solís', '76543210', 'maria.vargas@hotmail.com', 'Av. 6 de Agosto 430, Edif. Los Pinos', 'ANTIGUO', 'AMARILLO', 78, 4, 1, 5200.00, 6400.00, 0, 'Cliente regular. Suele pedir prórroga de 3 a 5 días pero cumple.'),
('cust-3', '78291044', 'Kevin Alexander Quispe', '68123456', 'kevin.quispe@outlook.com', 'Calle San Martín 880, Int. 4', 'NUEVO', 'VERDE', 82, 1, 1, 0.00, 1800.00, 0, 'Cliente nuevo. Empeñó laptop gaming en excelente estado.'),
('cust-4', '38291023', 'Jorge Luis Mamani Choque', '79812345', 'jorgeluis.mamani@gmail.com', 'Villa Victoria, Calle 3 Nº 412', 'MOROSO', 'ROJO', 25, 3, 1, 600.00, 3500.00, 1, 'Cliente moroso crítico. Retraso superior a 45 días sin pagar refrendo.')
ON CONFLICT (id) DO NOTHING;

-- 2 Empleados de Ejemplo
INSERT INTO employees (id, full_name, dni, phone, salary, work_schedule, primary_duties, notes, status)
VALUES 
('emp-1', 'Roberto Gómez Flores', '61829304', '71234567', 3200.00, 'Lunes a Viernes de 8:30 a 17:30, Sábados de 8:30 a 13:00', 'Atención en ventanilla, recepción y tasación de joyas, registro de clientes nuevos y emisión de boletas de empeño.', 'Encargado de apertura y custodia de caja menor.', 'ACTIVO'),
('emp-2', 'Lucía Fernández Quispe', '59281043', '68921450', 2800.00, 'Lunes a Viernes de 9:00 a 18:00', 'Custodia y organización de prendas en bóveda, control de inventario físico, llamadas de cortesía por vencimientos próximos.', 'Turno tarde y archivo de pólizas.', 'ACTIVO')
ON CONFLICT (id) DO NOTHING;

