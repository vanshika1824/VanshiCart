import api from "./api";
export const getWishlist = () => api.get("/wishlist");
export const createWishlist = () => api.post("/wishlist");
export const addWishlistItem = (data) => api.post("/wishlist/items", data);
export const removeWishlistItem = (id) => api.delete(`/wishlist/items/${id}`);