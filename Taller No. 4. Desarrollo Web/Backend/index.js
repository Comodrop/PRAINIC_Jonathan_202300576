import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Cargar variables de entorno desde el archivo .env
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Jlpz.10107076',
  database: process.env.DB_NAME || 'califica_catedratico',
    waitForConnections: true,
    connectionLimit: 10
}).promise();

// Enpoint para la base de datos
// ---------------- USUARIOS ----------------
// Registro Usuario 
app.post("/usuarios/register", async (req, res) => {
    try {
        const { registro_academico, nombres, apellidos, correo, contrasena } = req.body;
        const hashed = await bcrypt.hash(contrasena, 10);

        await pool.query(
            "INSERT INTO usuarios (registro_academico, nombres, apellidos, correo, contrasena) VALUES (?, ?, ?, ?, ?)",
            [registro_academico, nombres, apellidos, correo, hashed]
        );

        res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar Usuario
app.put('/usuarios/updateUser/:id', async (req, res) => {
    try {
        const { nombres, apellidos, correo } = req.body;
        await pool.query(
            "UPDATE usuarios SET nombres = ?, apellidos = ?, correo = ? WHERE id_usuario = ?",
            [ nombres, apellidos, correo, req.params.id]
        );

        res.json({ message: "Usuario actualizado exitosamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Recuperar usuario
app.post('/usuarios/recuperar', async (req, res) => {
    try {
        const { registro_academico, correo, nuevaContrasena } = req.body;
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE registro_academico = ? AND correo = ?', [registro_academico, correo]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Datos incorrectos' });
        }

        const hashed = await bcrypt.hash(nuevaContrasena, 10);
        await pool.query('UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?', [hashed, rows[0].id_usuario]);

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Iniciar sesión
app.post('/usuarios/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        const usuario = rows[0];
        const match = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!match) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        res.json({ message: 'Login exitoso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Ver Perfil de Usuario
app.get('/verPerfil/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_usuario, registro_academico, nombres, apellidos, correo FROM usuarios WHERE id_usuario = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------- Profesores ----------------
// Obtener todos los profesores
app.get('/profesores/obtenerProfesores', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id_profesor, nombres, apellidos
            FROM profesores
            ORDER BY nombres ASC;
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener profesor por ID
app.get('/profesores/:id_profesor', async (req, res) => {
    try {
        const { id_profesor } = req.params;
        const [rows] = await pool.query(
            "SELECT id_profesor, nombres, apellidos FROM profesores WHERE id_profesor = ?",
            [id_profesor]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Profesor no encontrado" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener cursos impartidos por un profesor
app.get('/profesores/:id_profesor/cursos', async (req, res) => {
    try {
        const { id_profesor } = req.params;
        const [rows] = await pool.query(
            `SELECT c.id_curso, c.nombre_curso, p.nombres AS nombre_profesor, p.apellidos AS apellido_profesor
             FROM cursos c
             JOIN profesores p ON c.id_profesor = p.id_profesor
             WHERE c.id_profesor = ?`,
            [id_profesor]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Este profesor no tiene cursos asignados o no existe" });
        }

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ---------------- Publicaciones ----------------
// Crear Publicación
app.post('/publicaciones/crearPublicacion', async (req, res) => {
    try {
        const { id_usuario, id_publicacion, id_profesor, mensaje } = req.body;

        if (!id_usuario || !mensaje) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }


        await pool.query(
            "INSERT INTO publicaciones (id_usuario, id_publicacion, id_profesor, mensaje) VALUES (?, ?, ?, ?)",
            [id_usuario, id_publicacion || null, id_profesor || null, mensaje]
        );

        res.status(201).json({ message: "Publicación creada exitosamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todas las publicaciones
app.get('/publicaciones/obtenerPublicaciones', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id_publicacion, p.mensaje, p.fecha_creacion,
		    u.nombres as estudiante, c.nombre_curso, pr.nombres AS profesor
            from publicaciones p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN cursos c ON p.id_publicacion = c.id_curso
            LEFT JOIN profesores pr ON p.id_profesor = pr.id_profesor
            ORDER BY p.fecha_creacion DESC; `, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener una publicación por curso
app.get('/publicaciones/curso/:id_publicacion', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id_publicacion, p.mensaje, p.fecha_creacion,
		        u.nombres as estudiante, c.nombre_curso, pr.nombres AS profesor
		        from publicaciones p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN cursos c ON p.id_publicacion = c.id_curso
            LEFT JOIN profesores pr ON p.id_profesor = pr.id_profesor
		        WHERE p.id_publicacion = ?
            ORDER BY p.fecha_creacion DESC; `, [req.params.id_publicacion]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener una publicación por profesor
app.get('/publicaciones/profesor/:id_profesor', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id_publicacion, p.mensaje, p.fecha_creacion,
		        u.nombres as estudiante, c.nombre_curso, pr.nombres AS profesor
		        from publicaciones p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN cursos c ON p.id_publicacion = c.id_curso
            LEFT JOIN profesores pr ON p.id_profesor = pr.id_profesor
		        WHERE p.id_profesor = ?
            ORDER BY p.fecha_creacion DESC; `, [req.params.id_profesor]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Obtener una publicación por id de usuario
app.get('/publicaciones/usuario/:id_usuario', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id_publicacion, p.mensaje, p.fecha_creacion,
		        u.nombres as estudiante, c.nombre_curso, pr.nombres AS profesor
		        from publicaciones p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN cursos c ON p.id_publicacion = c.id_curso
            LEFT JOIN profesores pr ON p.id_profesor = pr.id_profesor
		        WHERE p.id_usuario = ?
            ORDER BY p.fecha_creacion DESC; `, [req.params.id_usuario]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------- Comentarios ----------------
// Crear Comentario
app.post('/comentarios/crearComentario', async (req, res) => {
    try {
        const { id_usuario, id_publicacion, mensaje } = req.body;

        if (!id_usuario || !id_publicacion || !mensaje) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        await pool.query(
            "INSERT INTO comentarios (id_usuario, id_publicacion, mensaje) VALUES (?, ?, ?)",
            [id_usuario, id_publicacion, mensaje]
        );

        res.status(201).json({ message: "Comentario creado exitosamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todos los comentarios
app.get('/comentarios/obtenerComentarios', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id_comentario, c.mensaje, c.fecha_creacion,
		    u.nombres as estudiante, p.mensaje as publicacion
            from comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN publicaciones p ON c.id_publicacion = p.id_publicacion
            ORDER BY c.fecha_creacion DESC; `, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener un comentario por id
app.get('/comentarios/:id_comentario', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id_comentario, c.mensaje, c.fecha_creacion,
		        u.nombres as estudiante, p.mensaje as publicacion
		        from comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN publicaciones p ON c.id_publicacion = p.id_publicacion
		        WHERE c.id_comentario = ?
            ORDER BY c.fecha_creacion DESC; `, [req.params.id_comentario]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todos los comentarios de una publicación
app.get('/comentarios/publicacion/:id_publicacion', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id_comentario, c.mensaje, c.fecha_creacion,
		        u.nombres as estudiante, p.mensaje as publicacion
		        from comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN publicaciones p ON c.id_publicacion = p.id_publicacion
		        WHERE c.id_publicacion = ?
            ORDER BY c.fecha_creacion DESC; `, [req.params.id_publicacion]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------- Cursos aprobados ----------------
// Agregar curso aprobado a un usuario
app.post('/usuarios/:id_usuario/cursos_aprobados', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { id_curso } = req.body;

        if (!id_curso) {
            return res.status(400).json({ error: "Debe enviar el id_curso" });
        }

        // Insertar relación en la tabla intermedia
        await pool.query(
            "INSERT INTO cursos_aprobador (id_usuario, id_curso) VALUES (?, ?)",
            [id_usuario, id_curso]
        );

        res.status(201).json({ message: "Curso aprobado agregado exitosamente" });
    } catch (err) {
        // Evitar error duplicado de PK (usuario ya tiene ese curso aprobado)
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Este curso ya fue aprobado por el usuario" });
        }
        res.status(500).json({ error: err.message });
    }
});

// Obtener todos los cursos aprobados de un usuario
app.get('/usuarios/:id_usuario/cursos_aprobados', async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const [rows] = await pool.query(
            `SELECT c.id_curso, c.nombre_curso, c.id_profesor
             FROM cursos_aprobador ca
             INNER JOIN cursos c ON ca.id_curso = c.id_curso
             WHERE ca.id_usuario = ?`,
            [id_usuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Este usuario no tiene cursos aprobados" });
        }

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un curso aprobado de un usuario
app.delete('/usuarios/:id_usuario/cursos_aprobados/:id_curso', async (req, res) => {
    try {
        const { id_usuario, id_curso } = req.params;

        const [result] = await pool.query(
            "DELETE FROM cursos_aprobador WHERE id_usuario = ? AND id_curso = ?",
            [id_usuario, id_curso]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No se encontró el curso aprobado para este usuario" });
        }

        res.json({ message: "Curso aprobado eliminado exitosamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// ---------------- INICIO DEL SERVIDOR ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});