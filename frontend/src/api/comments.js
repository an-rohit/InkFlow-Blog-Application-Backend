import api from './axios';

export const addCommentApi = (postId, data) => api.post(`/post/${postId}/comment`, data);
export const getCommentsApi = (postId, params) => api.get(`/post/${postId}/comment`, { params });
export const updateCommentApi = (commentId, data) => api.put(`/comment/${commentId}`, data);
export const deleteCommentApi = (commentId) => api.delete(`/comment/${commentId}`);
