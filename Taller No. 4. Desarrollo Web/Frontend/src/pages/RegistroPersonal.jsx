import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "./RegistroPersonal.css";

export default function RegistroPersonal() {
  const { id } = useParams(); // ID del usuario cuyo perfil se va a ver
  const [usuario, setUsuario] = useState({});
  const [cursos, setCursos] = useState([]);
  const [nuevoCurso, setNuevoCurso] = useState("");
  const usuarioLogeado = JSON.parse(localStorage.getItem("usuario"));
  const esMiPerfil = usuarioLogeado?.id_usuario === parseInt(id);

  useEffect(() => {
    fetchUsuario();
    fetchCursos();
  }, []);

  // Obtener información del usuario
  const fetchUsuario = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/verPerfil/${id}`);
      setUsuario(res.data);
    } catch (err) {
      console.error(err);
      alert("Usuario no encontrado");
    }
  };

  // Obtener cursos aprobados del usuario
  const fetchCursos = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/usuarios/${id}/cursos_aprobados`);
      setCursos(res.data);
    } catch (err) {
      setCursos([]);
    }
  };

  // Agregar curso (solo en mi perfil)
  const agregarCurso = async () => {
    if (!nuevoCurso) return;
    try {
      await axios.post(`http://localhost:3000/usuarios/${id}/cursos_aprobados`, {
        id_curso: nuevoCurso,
      });
      setNuevoCurso("");
      fetchCursos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al agregar curso");
    }
  };

  // Eliminar curso (solo en mi perfil)
  const eliminarCurso = async (id_curso) => {
    try {
      await axios.delete(`http://localhost:3000/usuarios/${id}/cursos_aprobados/${id_curso}`);
      fetchCursos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Header />
      <div className="perfil-container">
        <h1 className="titulo-perfil">Perfil Usuario</h1>

        <div className="usuario-info">
          <p><strong>Registro Académico:</strong> {usuario.registro_academico}</p>
          <p><strong>Nombres:</strong> {usuario.nombres}</p>
          <p><strong>Apellidos:</strong> {usuario.apellidos}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
        </div>

        {esMiPerfil && (
          <div className="agregar-curso">
            <input
              type="text"
              placeholder="ID del curso"
              value={nuevoCurso}
              onChange={(e) => setNuevoCurso(e.target.value)}
            />
            <button onClick={agregarCurso}>Agregar Curso</button>
          </div>
        )}

        <h2>Cursos Aprobados</h2>
        <div className="lista-cursos">
          {cursos.length > 0 ? cursos.map((curso) => (
            <div key={curso.id_curso} className="curso-card">
              <p>{curso.nombre_curso} (ID: {curso.id_curso})</p>
              {esMiPerfil && (
                <button className="eliminar-curso" onClick={() => eliminarCurso(curso.id_curso)}>
                  Eliminar
                </button>
              )}
            </div>
          )) : (
            <p>No hay cursos aprobados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
