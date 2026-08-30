import api from "./api";
export const createReview = (data) => api.post("/reviews", data);
export const getProductReviews = (id) => api.get(`/products/${id}/reviews`);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);