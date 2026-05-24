import api from './axios';

export const toggleBookmarkApi = (postId) => api.patch(`/post/${postId}/bookmark`);
export const getMyBookmarksApi = () => api.get('/post/bookmarks/me');
