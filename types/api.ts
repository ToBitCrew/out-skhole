export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

// Auth
export interface AuthUser {
  uid: number;
  nick_nm: string;
  handle_nm: string;
  profile_img: string | null;
  permission: number;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  uid: number;
  handle_nm: string;
  nick_nm: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface OtpVerifyResponse {
  verifyToken: string;
}

// Posts
export interface PostAuthor {
  uid: number;
  nick_nm: string;
  profile_img: string | null;
}

export interface PostListItem {
  post_id: number;
  post_type: number;
  post_status: number;
  post_title: string;
  write_dt: string;
  like_cnt: number;
  bookmark_cnt: number;
  comment_cnt: number;
  author: PostAuthor;
  tags: string[];
}

export interface PostAsset {
  post_asset_id: number;
  post_asset_url: string;
}

export interface PostQuestion {
  archive: boolean;
  pii_mask: boolean;
}

export interface PostSale {
  item_nm: string;
  item_type: number;
  item_status: number;
  price: number;
  sold: boolean;
}

export interface PostDetail {
  post_id: number;
  post_ver: number;
  post_type: number;
  post_status: number;
  post_title: string;
  post_content: string;
  write_dt: string;
  edit_dt: string | null;
  like_cnt: number;
  bookmark_cnt: number;
  author: PostAuthor;
  assets: PostAsset[];
  tags: string[];
  question: PostQuestion | null;
  sale: PostSale | null;
}

export interface Comment {
  post_id: number;
  post_id_top: number;
  post_content: string;
  post_status: number;
  write_dt: string;
  author: PostAuthor;
}

export interface TagSuggestion {
  tag_name: string;
  use_cnt: number;
}

// Chat
export interface ChatPartner {
  uid: number;
  nick_nm: string;
  profile_img: string | null;
}

export interface ChatRoom {
  chat_room_id: number;
  last_message: string;
  last_message_dt: string;
  unread_cnt: number;
  conversation_active: boolean;
  partner: ChatPartner;
}

export interface ChatFile {
  chat_block_media_id: number;
  chat_file_url: string;
  chat_file_type: number;
  chat_file_name: string;
  chat_file_size: number;
  chat_file_mime_type: string;
}

export interface ChatMessage {
  chat_block_id: number;
  sender_id: number;
  chat_content: string;
  chat_message_type: number;
  sent_dt: string;
  is_read: boolean;
  del_by_sender: boolean;
  del_by_receiver: boolean;
  files: ChatFile[];
}

export interface ChatMessagesResponse {
  items: ChatMessage[];
  has_prev: boolean;
  next_cursor: number | null;
}

// Schools
export interface School {
  school_cd: string;
  school_nm: string;
  univ_type: string;
  campus_type: string;
  region: string;
}

export interface Department {
  dept_cd: string;
  dept_nm: string;
  college_nm: string;
  college_cd: string;
  dept_type: string;
  degree_type: string;
  day_night: number;
  degree_term: string;
  is_active: number;
}

// Categories
export interface SubCategory {
  sub_cat_cd: number;
  sub_cat_nm: string;
}

export interface MajorCategory {
  major_cat_cd: string;
  cat_major_nm: string;
  children: SubCategory[];
}
