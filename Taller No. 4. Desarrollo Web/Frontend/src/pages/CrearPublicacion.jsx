import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "./CrearPublicacion.css";

export default function CrearPublicacion() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [idCurso, setIdCurso] = useState("");
  const [idProfesor, setIdProfesor] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleCrear = async (e) => {
    e.preventDefault();

    const payload = {
      id_usuario: usuario.id_usuario,
      id_publicacion: idCurso,   // ID del curso
      id_profesor: idProfesor,   // ID del profesor
      mensaje,
    };

    try {
      await axios.post(
        "http://localhost:3000/publicaciones/crearPublicacion",
        payload
      );
      navigate("/principal"); // vuelve a principal al crear
    } catch (err) {
      console.error("Error al crear publicación:", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="crear-container">
        <h1>Crear Publicación</h1>
        <form onSubmit={handleCrear} className="crear-form">
          <input
            type="text"
            placeholder="ID del curso"
            value={idCurso}
            onChange={(e) => setIdCurso(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="ID del profesor"
            value={idProfesor}
            onChange={(e) => setIdProfesor(e.target.value)}
            required
          />

          <textarea
            placeholder="Escribe tu publicación..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
          ></textarea>

          <button type="submit">Publicar</button>
        </form>
      </div>
    </div>
  );
}
