import { useState, type FormEvent } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  Spinner,
  Textarea,
} from "@heroui/react";
import type { Comment as CommentType, Post as PostType } from "../types/post";
import { useAuth } from "../context/useAuth";
import { postsApi } from "../services/api";
import Comment from "./Comment";
import axios from "axios";
import { Link } from "react-router-dom";

interface PostProps {
  post: PostType;
  onPostDeleted?: (postId: string) => void;
}

export default function Post({ post, onPostDeleted }: PostProps) {
  const { user } = useAuth();
  const [postBody, setPostBody] = useState(post.body || "");
  const [comments, setComments] = useState<CommentType[]>(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Edit post state
  const [isEditing, setIsEditing] = useState(false);
  const [editBodyText, setEditBodyText] = useState(post.body || "");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Image modal state
  const [isImageOpen, setIsImageOpen] = useState(false);

  // Share link state
  const [isCopied, setIsCopied] = useState(false);

  const isAuthor = user?._id && post.user?._id && user._id === post.user._id;

  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const response = await postsApi.getComments(post._id);
        const fetched = response.comments || response.data?.comments || [];
        setComments(fetched);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeletingPost(true);
    try {
      await postsApi.deletePost(post._id);
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editBodyText.trim()) return;

    setIsSavingEdit(true);
    try {
      const response = await postsApi.updatePost(post._id, editBodyText.trim());
      const updatedPost = response.post || response.data?.post;
      setPostBody(updatedPost?.body || editBodyText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update post:", err);
      alert("Failed to update post. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await postsApi.addComment(newComment.trim(), post._id);
      const updatedComments = response.comments || response.data?.comments;
      if (Array.isArray(updatedComments)) {
        setComments(updatedComments);
      } else {
        const optimisticComment: CommentType = {
          _id: Date.now().toString(),
          content: newComment.trim(),
          commentCreator: {
            _id: user?._id || "",
            name: user?.name || "You",
            photo: user?.photo,
          },
          post: post._id,
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [...prev, optimisticComment]);
      }
      setNewComment("");
      if (!showComments) setShowComments(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        alert(err.response.data.message || "Failed to add comment");
      } else {
        alert("Failed to post comment");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      <Card className="border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden transition-shadow hover:shadow-md">
        {/* Post Header */}
        <CardBody className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/users/${post.user?._id || ""}`} className="flex-shrink-0">
                <Avatar
                  isBordered
                  color="secondary"
                  src={post.user?.photo || undefined}
                  name={post.user?.name || "User"}
                  size="md"
                  className="hover:scale-105 transition-transform"
                />
              </Link>
              <div>
                <Link
                  to={`/users/${post.user?._id || ""}`}
                  className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
                >
                  {post.user?.name || "User"}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <Link
                    to={`/posts/${post._id}`}
                    className="hover:underline text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Dropdown Menu */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  className="text-gray-400 hover:text-gray-700 min-w-8 h-8 rounded-full"
                  aria-label="Post options"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Post Options">
                <DropdownItem
                  key="copy-link"
                  onPress={handleCopyLink}
                  startContent={
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  {isCopied ? "Link Copied! ✓" : "Copy Post Link"}
                </DropdownItem>

                {isAuthor ? (
                  <DropdownItem
                    key="edit-post"
                    onPress={() => {
                      setEditBodyText(postBody);
                      setIsEditing(true);
                    }}
                    startContent={
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                  >
                    Edit Post
                  </DropdownItem>
                ) : null}

                {isAuthor ? (
                  <DropdownItem
                    key="delete-post"
                    color="danger"
                    className="text-danger"
                    onPress={handleDeletePost}
                    startContent={
                      isDeletingPost ? (
                        <Spinner size="sm" color="danger" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )
                    }
                  >
                    {isDeletingPost ? "Deleting..." : "Delete Post"}
                  </DropdownItem>
                ) : null}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Post Text Body or Inline Edit Form */}
          {isEditing ? (
            <div className="mt-3 space-y-2">
              <Textarea
                value={editBodyText}
                onChange={(e) => setEditBodyText(e.target.value)}
                minRows={2}
                maxRows={6}
                variant="bordered"
                className="w-full text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  isLoading={isSavingEdit}
                  onPress={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            postBody && (
              <p className="text-gray-800 dark:text-gray-200 text-sm mt-3 whitespace-pre-wrap leading-relaxed break-words">
                {postBody}
              </p>
            )
          )}
        </CardBody>

        {/* Post Image (Clickable for Lightbox) */}
        {post.image && (
          <div
            onClick={() => setIsImageOpen(true)}
            className="bg-gray-50 dark:bg-slate-950/60 max-h-[500px] overflow-hidden flex items-center justify-center border-y border-gray-100 dark:border-slate-800 cursor-pointer group"
          >
            <img
              src={post.image}
              alt="Post attachment"
              className="w-full max-h-[500px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Actions Bar */}
        <CardFooter className="px-4 py-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between w-full text-xs text-gray-500 dark:text-gray-400">
            <span>{likesCount} {likesCount === 1 ? "like" : "likes"}</span>
            <button
              onClick={toggleComments}
              className="hover:underline text-gray-500 dark:text-gray-400 cursor-pointer"
            >
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-1 border-t border-gray-100/80 dark:border-slate-800/80">
            <Button
              size="sm"
              variant="light"
              color={isLiked ? "danger" : "default"}
              onPress={handleLike}
              className={`font-semibold flex items-center justify-center gap-1.5 ${
                isLiked ? "text-danger" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <svg
                className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{isLiked ? "Liked" : "Like"}</span>
            </Button>

            <Button
              size="sm"
              variant="light"
              color="default"
              onPress={toggleComments}
              className="font-semibold text-gray-600 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Comment</span>
            </Button>

            <Button
              size="sm"
              variant="light"
              color="default"
              onPress={handleCopyLink}
              className="font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{isCopied ? "Copied!" : "Share"}</span>
            </Button>
          </div>

          {/* Collapsible Comments Section */}
          {showComments && (
            <div className="w-full pt-3 space-y-3 border-t border-gray-100 dark:border-slate-800">
              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <Avatar
                  size="sm"
                  color="secondary"
                  src={user?.photo || undefined}
                  name={user?.name || "User"}
                  className="flex-shrink-0"
                />
                <Input
                  size="sm"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="bordered"
                  className="flex-1"
                  classNames={{
                    inputWrapper: "h-9 bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700",
                  }}
                />
                <Button
                  size="sm"
                  type="submit"
                  color="primary"
                  variant="solid"
                  isLoading={isSubmittingComment}
                  isDisabled={!newComment.trim()}
                  className="min-w-16 h-9 font-medium"
                >
                  Send
                </Button>
              </form>

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" color="primary" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <Comment
                      key={comment._id}
                      comment={comment}
                      onCommentDeleted={handleCommentDeleted}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-gray-400 py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Lightbox Modal for Image */}
      {post.image && (
        <Modal
          isOpen={isImageOpen}
          onOpenChange={setIsImageOpen}
          size="4xl"
          placement="center"
          backdrop="blur"
        >
          <ModalContent className="bg-transparent shadow-none border-none max-w-4xl p-0">
            {() => (
              <ModalBody className="p-0 flex items-center justify-center">
                <img
                  src={post.image}
                  alt="Post expanded view"
                  className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              </ModalBody>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
