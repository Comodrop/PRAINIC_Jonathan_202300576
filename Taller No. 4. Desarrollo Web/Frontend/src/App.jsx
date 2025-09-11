import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import CrearUsuario from "./pages/CrearUsuario";
import RecuperarContrasena from "./pages/RecuperarContrasena";
import Principal from "./pages/Principal";
import CrearPublicacion from "./pages/CrearPublicacion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/crear" element={<CrearUsuario />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/principal" element={<Principal />} />
        <Route path="/crear-publicacion" element={<CrearPublicacion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

