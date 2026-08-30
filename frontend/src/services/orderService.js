import api from "./api";
export const checkout = (data) => api.post("/checkout", data);
export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);