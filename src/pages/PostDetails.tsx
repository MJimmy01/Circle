import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { postsApi } from "../services/api";
import type { Post as PostType } from "../types/post";
import Post from "../components/Post";

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isSubscribed = true;

    postsApi
      .getPostById(id)
      .then((response) => {
        if (!isSubscribed) return;
        const fetched = response.post || response.data?.post;
        if (fetched) {
          setPost(fetched);
        } else {
          setError("Post not found");
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error("Failed to fetch post:", err);
        setError("Failed to load post details");
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [id]);

  const handlePostDeleted = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button
          as={Link}
          to="/"
          variant="flat"
          color="default"
          size="sm"
          className="font-medium"
        >
          ← Back to Feed
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-center">
          <Spinner size="lg" color="primary" label="Loading post..." />
        </Card>
      ) : error || !post ? (
        <Card className="p-8 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 shadow-sm text-center">
          <CardBody className="space-y-3">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Post Unavailable</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error || "This post could not be found."}</p>
            <div>
              <Button as={Link} to="/" color="primary" variant="flat" size="sm">
                Return to Feed
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Post post={post} onPostDeleted={handlePostDeleted} />
      )}
    </div>
  );
}
