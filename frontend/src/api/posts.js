import api from './axios';

export const getAllPostsApi = (params) => api.get('/post/', { params });
export const getPostByIdApi = (id) => api.get(`/post/${id}`);
export const createPostApi = (data) => api.post('/post/create', data);
export const updatePostApi = (id, data) => api.put(`/post/${id}`, data);
export const deletePostApi = (id) => api.delete(`/post/${id}`);
export const getMyPostsApi = () => api.get('/post/me/post');
export const togglePublishApi = (id) => api.patch(`/post/publish/${id}`);
export const uploadCoverImageApi = (id, formData) =>
  api.patch(`/post/${id}/cover-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateCoverImageApi = (id, formData) =>
  api.patch(`/post/${id}/newcover-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
