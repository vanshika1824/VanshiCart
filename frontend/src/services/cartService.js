import api from "./api";
export const getCart = () => api.get("/cart");
export const createCart = () => api.post("/cart");
export const addCartItem = (data) => api.post("/cart/items", data);
export const updateCartItem = (id, data) => api.put(`/cart/items/${id}`, data);
export const removeCartItem = (id) => api.delete(`/cart/items/${id}`);