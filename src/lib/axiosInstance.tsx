import axios from "axios";
import Cookies from "js-cookie";

// Crear la instancia de Axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.veryfrut.com/api", // URL base
  timeout: 10000, // Tiempo de espera en milisegundos
  headers: {
    "Content-Type": "application/json", // Tipo de contenido predeterminado
  },
});

// Interceptor de solicitudes para agregar el token de autorización
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // <-- AQUI
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Aquí puedes agregar lógica para manejar errores específicos
    if (error.response && error.response.status === 401) {
      // Token expirado o no autorizado, puedes redirigir al login
      window.location.href = "/login"; // O la ruta de tu login
    } else if (error.response && error.response.status === 500) {
      // Error interno del servidor
      alert("Hubo un error en el servidor. Intenta nuevamente más tarde.");
    }
    return Promise.reject(error);
  }
);
