export interface PostAuthor {
  _id: string;
  name: string;
  photo?: string;
  username?: string;
}

export interface CommentAuthor {
  _id: string;
  name: string;
  photo?: string;
}

export interface Comment {
  _id: string;
  content: string;
  commentCreator: CommentAuthor;
  post: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  body?: string;
  image?: string;
  user: PostAuthor;
  createdAt: string;
  comments?: Comment[];
  likesCount?: number;
}

export interface PaginationInfo {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  total?: number;
}

export interface PostsResponse {
  message: string;
  paginationInfo?: PaginationInfo;
  posts: Post[];
  data?: {
    posts?: Post[];
    paginationInfo?: PaginationInfo;
  };
}

export interface SinglePostResponse {
  message: string;
  post: Post;
  data?: {
    post?: Post;
  };
}

export interface PostCommentsResponse {
  message: string;
  comments: Comment[];
  data?: {
    comments?: Comment[];
  };
}

