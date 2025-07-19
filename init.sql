-- ============================
-- BASE DE DATOS: TransLogiTrack
-- ============================

-- ENUMS
CREATE TYPE rol_usuario AS ENUM ('Administrador', 'Operador', 'Cliente');
CREATE TYPE estado_pedido AS ENUM ('Pendiente', 'En tránsito', 'Entregado', 'Cancelado');
CREATE TYPE estado_operativo_camion AS ENUM ('Disponible', 'En mantenimiento', 'Asignado');
CREATE TYPE tipo_evento_historial AS ENUM ('sanción', 'premio', 'incidente');
CREATE TYPE tipo_mantenimiento AS ENUM ('preventivo', 'correctivo');

-- USUARIOS
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    correo_electronico TEXT UNIQUE NOT NULL,
    contrasena_hash TEXT NOT NULL,
    rol rol_usuario NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- CONDUCTORES
CREATE TABLE Conductor (
    id_conductor SERIAL PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    numero_licencia TEXT UNIQUE NOT NULL,
    fecha_vencimiento_licencia DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- HISTORIAL DE CONDUCTORES
CREATE TABLE HistorialConductor (
    id_historial SERIAL PRIMARY KEY,
    id_conductor INTEGER REFERENCES Conductor(id_conductor) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    tipo_evento tipo_evento_historial NOT NULL,
    fecha_evento DATE NOT NULL
);

-- CAMIONES
CREATE TABLE Camion (
    id_camion SERIAL PRIMARY KEY,
    placa TEXT UNIQUE NOT NULL,
    capacidad_kg INTEGER NOT NULL,
    estado_operativo estado_operativo_camion NOT NULL DEFAULT 'Disponible',
    ubicacion_actual JSONB,
    activo BOOLEAN DEFAULT TRUE,
    km_actual NUMERIC(10,2) DEFAULT 0
);

-- MANTENIMIENTO DE CAMIONES
CREATE TABLE MantenimientoCamion (
    id_mantenimiento SERIAL PRIMARY KEY,
    id_camion INTEGER REFERENCES Camion(id_camion) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    descripcion TEXT NOT NULL,
    tipo tipo_mantenimiento NOT NULL,
    km NUMERIC(10,2) DEFAULT 0
);

-- RUTAS
CREATE TABLE Ruta (
    id_ruta SERIAL PRIMARY KEY,
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    nombre_destino TEXT, -- campo adicional según el diagrama
    distancia_km NUMERIC(10,2) NOT NULL,
    tiempo_estimado_min INTEGER,
    precio NUMERIC(10,2)
);

-- PEDIDOS
CREATE TABLE Pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    id_ruta INTEGER REFERENCES Ruta(id_ruta),
    id_camion INTEGER REFERENCES Camion(id_camion),
    id_conductor INTEGER REFERENCES Conductor(id_conductor),
    estado estado_pedido NOT NULL DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega_estimada TIMESTAMP,
    fecha_entrega_real TIMESTAMP,
    observaciones TEXT,
    precio NUMERIC(10,2),
    nro_guia TEXT
);

-- SEGUIMIENTO DE PEDIDOS
CREATE TABLE SeguimientoPedido (
    id_seguimiento SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES Pedido(id_pedido) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ubicacion JSONB,
    estado estado_pedido NOT NULL
);