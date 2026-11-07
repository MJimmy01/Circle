import { useState } from "react";
import { Avatar, Button, Input } from "@heroui/react";
import type { Comment as CommentType } from "../types/post";
import { useAuth } from "../context/useAuth";
import { postsApi } from "../services/api";
import { Link } from "react-router-dom";

interface CommentProps {
  comment: CommentType;
  onCommentDeleted?: (commentId: string) => void;
  onCommentUpdated?: (commentId: string, newContent: string) => void;
}

export default function Comment({
  comment,
  onCommentDeleted,
  onCommentUpdated,
}: CommentProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(comment.content);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor =
    user?._id && comment.commentCreator?._id && user._id === comment.commentCreator._id;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    try {
      await postsApi.deleteComment(comment._id);
      if (onCommentDeleted) {
        onCommentDeleted(comment._id);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    setIsSaving(true);
    try {
      await postsApi.updateComment(comment._id, editContent.trim());
      setContent(editContent.trim());
      setIsEditing(false);
      if (onCommentUpdated) {
        onCommentUpdated(comment._id, editContent.trim());
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
      alert("Failed to update comment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const authorProfileLink = comment.commentCreator?._id
    ? `/users/${comment.commentCreator._id}`
    : "#";

  return (
    <div className="flex items-start gap-3 text-sm group">
      <Link to={authorProfileLink} className="flex-shrink-0 mt-0.5">
        <Avatar
          size="sm"
          color="secondary"
          src={comment.commentCreator?.photo || undefined}
          name={comment.commentCreator?.name || "User"}
          className="hover:scale-105 transition-transform"
        />
      </Link>
      <div className="flex-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl px-3.5 py-2 relative transition-colors">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={authorProfileLink}
            className="font-semibold text-xs text-gray-800 dark:text-gray-200 hover:text-blue-600 transition-colors"
          >
            {comment.commentCreator?.name || "Anonymous"}
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            {isAuthor && !isEditing && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  onPress={() => {
                    setEditContent(content);
                    setIsEditing(true);
                  }}
                  className="min-w-5 h-5 w-5 text-gray-400 hover:text-blue-600"
                  title="Edit comment"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Button>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  color="danger"
                  isLoading={isDeleting}
                  onPress={handleDelete}
                  className="min-w-5 h-5 w-5 text-gray-400 hover:text-danger"
                  title="Delete comment"
                >
                  {!isDeleting && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Input
              size="sm"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              variant="bordered"
              classNames={{
                inputWrapper: "h-8 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700",
              }}
            />
            <div className="flex justify-end gap-1.5">
              <Button
                size="sm"
                variant="light"
                className="h-7 text-xs px-2"
                onPress={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                color="primary"
                isLoading={isSaving}
                className="h-7 text-xs px-3 font-medium"
                onPress={handleSaveEdit}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 text-xs mt-1 whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
