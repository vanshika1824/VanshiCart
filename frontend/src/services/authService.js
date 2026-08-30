import api from "./api";
export const register = (data) => api.post("/users/register", data);
export const login = (data) => api.post("/users/login", data);
export const me = () => api.get("/users/me");
export const users = () => api.get("/users");