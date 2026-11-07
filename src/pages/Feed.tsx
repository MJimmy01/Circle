import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { Avatar, Button, Card, CardBody, Input, Skeleton } from "@heroui/react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import { postsApi } from "../services/api";
import type { Post as PostType } from "../types/post";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isSubscribed = true;

    postsApi
      .getPosts(1, 20)
      .then((response) => {
        if (!isSubscribed) return;
        const fetchedPosts = response.posts || response.data?.posts || [];
        setPosts(fetchedPosts);

        const totalPages =
          response.paginationInfo?.numberOfPages ||
          response.data?.paginationInfo?.numberOfPages;

        if (totalPages) {
          setHasMore(1 < totalPages);
        } else {
          setHasMore(fetchedPosts.length === 20);
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error("Failed to load posts:", err);
        setError("Unable to load posts at the moment. Please try again.");
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const refreshPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postsApi.getPosts(1, 20);
      const fetchedPosts = response.posts || response.data?.posts || [];
      setPosts(fetchedPosts);
      setPage(1);

      const totalPages =
        response.paginationInfo?.numberOfPages ||
        response.data?.paginationInfo?.numberOfPages;

      if (totalPages) {
        setHasMore(1 < totalPages);
      } else {
        setHasMore(fetchedPosts.length === 20);
      }
    } catch {
      setError("Unable to load posts at the moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = (newPost: PostType) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await postsApi.getPosts(nextPage, 20);
      const fetchedPosts = response.posts || response.data?.posts || [];
      setPosts((prev) => [...prev, ...fetchedPosts]);
      setPage(nextPage);

      const totalPages =
        response.paginationInfo?.numberOfPages ||
        response.data?.paginationInfo?.numberOfPages;

      if (totalPages) {
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(fetchedPosts.length === 20);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const bodyMatch = post.body?.toLowerCase().includes(q);
    const authorMatch = post.user?.name?.toLowerCase().includes(q);
    return bodyMatch || authorMatch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Main Feed Column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Welcome banner */}
        <Card className="border border-blue-100 dark:border-blue-900/40 shadow-sm bg-gradient-to-r from-blue-50 via-white to-cyan-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-cyan-950/40">
          <CardBody className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <Avatar
                isBordered
                color="secondary"
                src={user?.photo || undefined}
                name={user?.name || "User"}
                className="w-14 h-14 text-lg flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  Welcome back, {user?.name || "Friend"}! 👋
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Share what&apos;s new, connect with friends, and discover stories.
                </p>
              </div>
              <Button
                as={Link}
                to="/profile"
                color="primary"
                variant="flat"
                size="sm"
                className="font-medium text-xs"
              >
                My Profile
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Create Post Component */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Search bar */}
        <div className="relative">
          <Input
            placeholder="Search posts or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="bordered"
            size="sm"
            isClearable
            onClear={() => setSearchQuery("")}
            startContent={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            className="w-full"
            classNames={{
              inputWrapper: "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800",
            }}
          />
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="p-4 space-y-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded-lg" />
                    <Skeleton className="h-3 w-20 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </Card>
            ))
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-red-100 dark:border-red-900/30 shadow-sm text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                ⚠️
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{error}</p>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                className="mt-4 font-medium"
                onPress={refreshPosts}
              >
                Try Again
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {searchQuery ? "🔍" : "✍️"}
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                {searchQuery ? "No matching posts found" : "No posts yet"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                {searchQuery
                  ? `No posts matched "${searchQuery}". Try a different keyword.`
                  : "Be the first to share an update with your community! Use the box above to write your first post."}
              </p>
              {searchQuery && (
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="mt-3 font-medium"
                  onPress={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Post post={post} onPostDeleted={handlePostDeleted} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Load More Button */}
          {!isLoading && posts.length > 0 && hasMore && !searchQuery && (
            <div className="flex justify-center pt-2 pb-6">
              <Button
                variant="flat"
                color="primary"
                isLoading={isLoadingMore}
                onPress={handleLoadMore}
                className="font-medium shadow-sm"
              >
                {isLoadingMore ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Column (Sticky on Desktop) */}
      <div className="hidden lg:block space-y-5 sticky top-20">
        {/* User Mini Card */}
        <Card className="border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-20 bg-blue-600 rounded-t-2xl" />
          <div className="p-4 pt-0 text-center relative -mt-10">
            <Avatar
              isBordered
              color="secondary"
              src={user?.photo || undefined}
              name={user?.name || "User"}
              className="w-16 h-16 mx-auto border-3 border-white dark:border-slate-900 shadow-md mb-2 relative z-10"
            />
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">
              {user?.name || "User"}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              @{user?.username || user?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
            </p>
            <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  {user?.followersCount ?? 0}
                </p>
                <p className="text-gray-400 text-[11px]">Followers</p>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  {user?.followingCount ?? 0}
                </p>
                <p className="text-gray-400 text-[11px]">Following</p>
              </div>
            </div>

            <Button
              as={Link}
              to="/profile"
              variant="flat"
              color="primary"
              size="sm"
              className="w-full mt-4 font-medium text-xs"
            >
              View Full Profile
            </Button>
          </div>
        </Card>

        {/* Trending Tags */}
        <Card className="border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
            Trending in Community
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between group cursor-pointer">
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                #React19
              </span>
              <span className="text-gray-400 text-[11px]">2.4k posts</span>
            </div>
            <div className="flex items-center justify-between group cursor-pointer">
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                #RouteAcademy
              </span>
              <span className="text-gray-400 text-[11px]">1.8k posts</span>
            </div>
            <div className="flex items-center justify-between group cursor-pointer">
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                #FrontendDev
              </span>
              <span className="text-gray-400 text-[11px]">980 posts</span>
            </div>
            <div className="flex items-center justify-between group cursor-pointer">
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                #HeroUI
              </span>
              <span className="text-gray-400 text-[11px]">750 posts</span>
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-[11px] text-gray-400 px-2 space-y-1">
          <p>© 2026 Circle Social Network. Built for Route Academy.</p>
        </div>
      </div>
    </div>
  );
}
