import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario"); // borramos sesión
    navigate("/"); // redirige al login
  };

  return (
    <header className="header">
      <nav className="nav-links">
        <Link to="/principal">Inicio</Link>
        <Link to="/crear-publicacion">Crear Publicación</Link>
        <button onClick={handleLogout} className="logout-button">Log out</button>
      </nav>
    </header>
  );
}
