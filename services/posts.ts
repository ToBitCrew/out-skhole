import type {
  PaginatedData,
  PostListItem,
  PostDetail,
  Comment,
  TagSuggestion,
  PostAsset,
} from "@/types/api";
import api from "./api";

export async function getPosts(params?: {
  page?: number;
  limit?: number;
  post_type?: number;
  sub_cat_cd?: number;
  school_cd?: string;
}) {
  const { data } = await api.get<{
    success: true;
    data: PaginatedData<PostListItem>;
  }>("/posts", { params });
  return data.data;
}

export async function searchPosts(params: {
  q: string;
  page?: number;
  limit?: number;
  post_type?: number;
  major_cat_cd?: string;
  mid_cat_cd?: number;
}) {
  const { data } = await api.get<{
    success: true;
    data: PaginatedData<PostListItem>;
  }>("/posts/search", { params });
  return data.data;
}

export async function autocompleteTags(params: {
  q: string;
  limit?: number;
}) {
  const { data } = await api.get<{
    success: true;
    data: { items: TagSuggestion[] };
  }>("/posts/tags/autocomplete", { params });
  return data.data.items;
}

export async function getPost(postId: number) {
  const { data } = await api.get<{ success: true; data: PostDetail }>(
    `/posts/${postId}`
  );
  return data.data;
}

export async function createPost(body: {
  post_title: string;
  post_content: string;
  post_type: number;
  post_status: number;
  sub_cat_cd?: number[];
  tags?: string[];
  question?: { pii_mask: boolean };
  sale?: {
    item_nm: string;
    item_type: number;
    item_status: number;
    price: number;
  };
}) {
  const { data } = await api.post<{
    success: true;
    data: { post_id: number };
  }>("/posts", body);
  return data.data;
}

export async function updatePost(
  postId: number,
  body: {
    post_title?: string;
    post_content?: string;
    post_status?: number;
    tags?: string[];
    sale?: Partial<{
      sold: boolean;
      item_status: number;
      price: number;
    }>;
  }
) {
  await api.patch(`/posts/${postId}`, body);
}

export async function deletePost(postId: number) {
  await api.delete(`/posts/${postId}`);
}

export async function likePost(postId: number) {
  const { data } = await api.post<{
    success: true;
    data: { like_cnt: number };
  }>(`/posts/${postId}/like`);
  return data.data;
}

export async function unlikePost(postId: number) {
  const { data } = await api.delete<{
    success: true;
    data: { like_cnt: number };
  }>(`/posts/${postId}/like`);
  return data.data;
}

export async function bookmarkPost(postId: number) {
  await api.post(`/posts/${postId}/bookmark`);
}

export async function unbookmarkPost(postId: number) {
  await api.delete(`/posts/${postId}/bookmark`);
}

export async function getComments(
  postId: number,
  params?: { page?: number; limit?: number }
) {
  const { data } = await api.get<{
    success: true;
    data: PaginatedData<Comment>;
  }>(`/posts/${postId}/comments`, { params });
  return data.data;
}

export async function createComment(
  postId: number,
  body: { post_content: string; parent_post_id?: number }
) {
  const { data } = await api.post<{
    success: true;
    data: { post_id: number };
  }>(`/posts/${postId}/comments`, body);
  return data.data;
}

export async function deleteComment(postId: number, commentId: number) {
  await api.delete(`/posts/${postId}/comments/${commentId}`);
}

export async function uploadAssets(postId: number, files: FormData) {
  const { data } = await api.post<{ success: true; data: PostAsset[] }>(
    `/posts/${postId}/assets`,
    files,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}
