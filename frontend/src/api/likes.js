import api from './axios';

export const toggleLikeApi = (postId) => api.post(`/post/${postId}/like`);
export const getLikeCountApi = (postId) => api.get(`/post/${postId}/likes/count`);
export const checkLikedApi = (postId) => api.get(`/post/${postId}/liked`);
export const getMyLikedPostsApi = () => api.get('/post/liked/me');
