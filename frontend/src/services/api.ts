import axios from 'axios';

// Instanta axios cu URL-ul de baza al serverului backend
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Interceptor pe request: ataseaza tokenul JWT la fiecare cerere catre server
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pe response: daca serverul raspunde 401 (neautorizat),
// sterge sesiunea din localStorage si redirectioneaza la pagina de login
api.interceptors.response.use(
  (raspuns) => raspuns,
  (eroare) => {
    if (eroare.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(eroare);
  }
);

export default api;
