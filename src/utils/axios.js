import axios from "axios";

const instance = axios.create({
  baseURL: "/api", // gracias al proxy de vite esto irá a http://localhost:3000/api
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// opcional: interceptors para auth
instance.interceptors.response.use(
  res => res,
  err => {
    // manejo básico
    return Promise.reject(err);
  }
);

export default instance;
