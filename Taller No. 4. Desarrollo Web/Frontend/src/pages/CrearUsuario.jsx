import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CrearUsuario.css";

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [registro, setRegistro] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:3000/usuarios/register", {
        registro_academico: registro,
        nombres,
        apellidos,
        correo,
        contrasena,
      });

      if (res.data.message) {
        setSuccess(res.data.message);
        setTimeout(() => navigate("/"), 1500); // regresar al login
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al crear usuario");
    }
  };

  return (
    <div className="crear-container">
      <h1 className="crear-title">Crear usuario</h1>
      <form className="crear-form" onSubmit={handleCrearUsuario}>
        <input
          type="text"
          placeholder="Registro académico"
          value={registro}
          onChange={(e) => setRegistro(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nombres"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <button type="submit" className="crear-button">
          Crear
        </button>
      </form>
      <Link to="/" className="crear-regresar">Regresar</Link>
    </div>
  );
}
