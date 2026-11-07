import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Avatar, Button, Card, CardBody, Textarea } from "@heroui/react";
import { useAuth } from "../context/useAuth";
import { postsApi } from "../services/api";
import type { Post } from "../types/post";
import axios from "axios";

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!body.trim() && !imageFile) {
      setError("Please write something or attach an image");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (body.trim()) {
        formData.append("body", body.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await postsApi.createPost(formData);
      const newPost = response.post || response.data?.post;

      if (newPost) {
        onPostCreated(newPost);
        setBody("");
        handleRemoveImage();
      } else {
        setError("Failed to publish post. Please try again.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setError(err.response.data.message || "Failed to publish post");
      } else {
        setError("An unexpected error occurred while posting");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-visible transition-colors">
      <CardBody className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar
              isBordered
              color="secondary"
              src={user?.photo || undefined}
              name={user?.name || "User"}
              size="md"
              className="mt-1 flex-shrink-0"
            />
            <div className="flex-1">
              <Textarea
                placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "friend"}?`}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (error) setError(null);
                }}
                minRows={3}
                maxRows={6}
                variant="flat"
                className="w-full text-base"
                classNames={{
                  inputWrapper:
                    "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors",
                }}
              />
            </div>
          </div>

          {/* Image preview if uploaded */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 max-h-80 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full max-h-80 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors shadow-md"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs text-danger font-medium px-1">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                id="post-image-upload"
              />
              <Button
                as="label"
                htmlFor="post-image-upload"
                variant="light"
                color="secondary"
                size="sm"
                className="cursor-pointer font-medium flex items-center gap-1.5"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{imageFile ? "Change Image" : "Photo"}</span>
              </Button>
            </div>

            <Button
              type="submit"
              color="primary"
              variant="solid"
              size="sm"
              isLoading={isLoading}
              isDisabled={!body.trim() && !imageFile}
              className="font-semibold shadow-sm px-5"
            >
              Post
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
