CREATE DATABASE califica_catedratico;  -- Creamos la base de datos
USE califica_catedratico;              -- Seleccionamos la base de datos

-- Creamos la tabla usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    registro_academico VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL
);

-- Creamos la tabla profesores
CREATE TABLE profesores (
    id_profesor INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL
);

-- Creamos la tabla cursos
CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_curso VARCHAR(100) NOT NULL,
    id_profesor INT NOT NULL,
    FOREIGN KEY (id_profesor) REFERENCES profesores(id_profesor)
);

-- Creamos la tabla calificaciones
CREATE TABLE publicaciones (
    id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_profesor INT NULL,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_profesor) REFERENCES profesores(id_profesor)
);

-- Creamos la tabla comentarios
CREATE TABLE comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_publicacion INT NOT NULL,
    id_usuario INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla intermedia para la relación muchos a muchos entre usuarios y cursos
CREATE TABLE cursos_aprobador (
    id_usuario INT NOT NULL,
    id_curso INT NOT NULL,
    PRIMARY KEY (id_usuario, id_curso),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

-- Tabla temporal para carga masiva de datos
CREATE TABLE carga_masiva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_curso VARCHAR(200),
    apellido_profesor VARCHAR(100),
    nombre_profesor VARCHAR(100)
);

SELECT * FROM carga_masiva;  -- Selecciona todo de la tabla carga_masiva

-- Insertar datos en la tabla profesores desde carga_masiva
INSERT INTO profesores 
(nombres, apellidos)
SELECT DISTINCT nombre_profesor, apellido_profesor
FROM carga_masiva;

-- Para seleccionar mas de un formulario se separan con ; ejemplo: carga_masiva; profesores
SELECT * FROM profesores;     -- Selecciona todo de la tabla profesores

-- Insertar datos en la tabla cursos desde carga_masiva y relacionar con profesores
INSERT INTO cursos
(nombre_curso, id_profesor)
SELECT
t.nombre_curso,
p.id_profesor
FROM carga_masiva t
JOIN profesores p
ON p.nombres = t.nombre_profesor
and p.apellidos = t.apellido_profesor;
;

SELECT * FROM cursos;   -- Selecciona todo de la tabla cursos
