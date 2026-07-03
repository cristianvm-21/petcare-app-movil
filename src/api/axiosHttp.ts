import axios from "axios";

const SPRING_BOOT_API_URL = "https://petcare-backend-appmovil.onrender.com/api";

/* 1) Se crea una instancia para la API */
/* Crear una instancia separada por servicio evita repetir la URL base en cada llamada */
export const springbootApi = axios.create({
    baseURL: SPRING_BOOT_API_URL,
    headers:{
        "Content-Type" :"application/json",
    }
}) 

// Interceptores Aislados
/* => funciones que se ejecutan automáticamente antes de que se envíe una 
solicitud (request interceptor) o después de que se recibe una respuesta (response interceptor)*/

springbootApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`;
        }
        return config;
    },

    (error) =>{
        return Promise.reject(error);
    }
);

springbootApi.interceptors.response.use(
    (response) =>{
        console.log('✅ Respuesta recibida:', response.config.url)
        return response;
    }
)
