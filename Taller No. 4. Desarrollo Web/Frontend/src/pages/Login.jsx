import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/usuarios/login", {
        correo,
        contrasena,
      });

      if (res.data?.message === "Login exitoso") {
        localStorage.setItem("usuario", JSON.stringify({ correo }));
        navigate("/principal");
      } else {
        setError("Credenciales incorrectas.");
      }
    } catch (err) {
      console.error(err);
      setError("Error en el servidor o credenciales incorrectas.");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Iniciar sesión Ingeniería USAC</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          className="login-input"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="login-input"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="login-button">
          Ingresar
        </button>
      </form>
      <div className="login-links">
        <Link to="/crear">Crear usuario</Link>
        <Link to="/recuperar">Recuperar contraseña</Link>
      </div>
    </div>
  );
}
