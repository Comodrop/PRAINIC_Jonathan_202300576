import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/RecuperarContrasena.css";

export default function RecuperarContrasena() {
  const [registro, setRegistro] = useState("");
  const [correo, setCorreo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleActualizar = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/usuarios/recuperar", {
        registro_academico: registro,
        correo,
        nuevaContrasena,
      });

      if (res.data.message) {
        setMensaje(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar la contraseña");
    }
  };

  return (
    <div className="recuperar-container">
      <h1 className="recuperar-title">Recuperar contraseña</h1>
      <form className="recuperar-form" onSubmit={handleActualizar}>
        <input
          type="text"
          placeholder="Registro Académico"
          value={registro}
          onChange={(e) => setRegistro(e.target.value)}
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
          placeholder="Nueva contraseña"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}
        {mensaje && <p className="success-text">{mensaje}</p>}

        <button type="submit" className="recuperar-button">Actualizar</button>
      </form>
      <Link to="/" className="recuperar-regresar">Regresar</Link>
    </div>
  );
}
