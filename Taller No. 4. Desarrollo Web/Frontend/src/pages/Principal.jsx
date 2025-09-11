import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "./Principal.css";

export default function Principal() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [filtro, setFiltro] = useState({ curso: "", profesor: "" });
  const [registroBuscar, setRegistroBuscar] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const fetchPublicaciones = async () => {
    try {
      const res = await axios.get("http://localhost:3000/publicaciones/obtenerPublicaciones");
      setPublicaciones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFiltro = async () => {
    try {
      const res = await axios.get("http://localhost:3000/publicaciones/obtenerPublicaciones", {
        params: filtro,
      });
      setPublicaciones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuscarUsuario = async () => {
    if (!registroBuscar) return;
    try {
      const res = await axios.get(`http://localhost:3000/verPerfil/${registroBuscar}`);
      // Si el usuario existe, lo mandamos a su perfil
      navigate(`/verperfil/${registroBuscar}`);
    } catch (err) {
      console.error(err);
      alert("Usuario no encontrado");
    }
  };

  return (
    <div>
      <Header />

      <div className="principal-container">
        <h1 className="titulo-principal">Publicaciones recientes</h1>

        {/* 🔹 Buscador de Registro Personal */}
        <div className="buscador-registro">
          <input
            type="text"
            placeholder="Buscar por Registro Personal"
            value={registroBuscar}
            onChange={(e) => setRegistroBuscar(e.target.value)}
          />
          <button onClick={handleBuscarUsuario}>Buscar</button>
        </div>

        {/* 🔹 Filtros */}
        <div className="filtros">
          <input
            type="text"
            placeholder="Filtrar por curso"
            value={filtro.curso}
            onChange={(e) => setFiltro({ ...filtro, curso: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filtrar por catedrático"
            value={filtro.profesor}
            onChange={(e) => setFiltro({ ...filtro, profesor: e.target.value })}
          />
          <button onClick={handleFiltro}>Aplicar Filtros</button>
        </div>

        {/* 🔹 Lista de publicaciones */}
        <div className="lista-publicaciones">
          {publicaciones.map((pub) => (
            <div key={pub.id_publicacion} className="publicacion-card">
              <p className="pub-usuario"><strong>Usuario:</strong> {pub.estudiante}</p>
              <p><strong>Curso:</strong> {pub.nombre_curso || "N/A"}</p>
              <p><strong>Catedrático:</strong> {pub.profesor || "N/A"}</p>
              <p className="pub-mensaje">{pub.mensaje}</p>
              <p className="fecha">{new Date(pub.fecha_creacion).toLocaleString()}</p>

              {/* 🔹 Comentarios */}
              {pub.comentarios && pub.comentarios.length > 0 && (
                <div className="comentarios-container">
                  <h4>Comentarios</h4>
                  {pub.comentarios.map((comentario) => (
                    <div key={comentario.id_comentario} className="comentario">
                      <p className="comentario-texto">
                        <strong>{comentario.usuario}</strong>: {comentario.mensaje}
                      </p>
                      <p className="comentario-fecha">
                        {new Date(comentario.fecha_creacion).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
