import axios from "axios";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ProfileResponse,
  SignInPayload,
  SignUpPayload,
} from "../types/auth";
import type { PostCommentsResponse, PostsResponse, SinglePostResponse } from "../types/post";

export const API_BASE_URL = "https://route-posts.routemisr.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.token = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication and User API methods
export const authApi = {
  signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/users/signup", payload);
    return response.data;
  },

  signIn: async (payload: SignInPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/users/signin", payload);
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>("/users/profile-data");
    return response.data;
  },

  uploadProfilePhoto: async (formData: FormData): Promise<ProfileResponse> => {
    const response = await apiClient.put<ProfileResponse>("/users/upload-profile-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<AuthResponse> => {
    const response = await apiClient.patch<AuthResponse>("/users/change-password", payload);
    return response.data;
  },
};

// Posts and Comments API methods
export const postsApi = {
  getPosts: async (page = 1, limit = 20): Promise<PostsResponse> => {
    const response = await apiClient.get<PostsResponse>("/posts", {
      params: { page, limit, sort: "-createdAt" },
    });
    return response.data;
  },

  getPostById: async (postId: string): Promise<SinglePostResponse> => {
    const response = await apiClient.get<SinglePostResponse>(`/posts/${postId}`);
    return response.data;
  },

  getUserPosts: async (userId: string, page = 1, limit = 20): Promise<PostsResponse> => {
    const response = await apiClient.get<PostsResponse>(`/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },

  createPost: async (formData: FormData): Promise<SinglePostResponse> => {
    const response = await apiClient.post<SinglePostResponse>("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updatePost: async (postId: string, body: string): Promise<SinglePostResponse> => {
    const response = await apiClient.put<SinglePostResponse>(`/posts/${postId}`, { body });
    return response.data;
  },

  deletePost: async (postId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/posts/${postId}`);
    return response.data;
  },

  getComments: async (postId: string): Promise<PostCommentsResponse> => {
    const response = await apiClient.get<PostCommentsResponse>(`/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async (content: string, postId: string): Promise<PostCommentsResponse> => {
    const response = await apiClient.post<PostCommentsResponse>("/comments", {
      content,
      post: postId,
    });
    return response.data;
  },

  updateComment: async (commentId: string, content: string): Promise<PostCommentsResponse> => {
    const response = await apiClient.put<PostCommentsResponse>(`/comments/${commentId}`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/comments/${commentId}`);
    return response.data;
  },
};
