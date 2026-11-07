import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Spinner,
  Tab,
  Tabs,
} from "@heroui/react";
import { Link } from "react-router-dom";
import Post from "../components/Post";
import { authApi, postsApi } from "../services/api";
import type { Post as PostType } from "../types/post";
import axios from "axios";

export default function Profile() {
  const { user, logout, refreshUser, setUser } = useAuth();
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Change password state
  const [passwordData, setPasswordData] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    let isSubscribed = true;

    postsApi
      .getUserPosts(user._id)
      .then((response) => {
        if (!isSubscribed) return;
        const posts = response.posts || response.data?.posts || [];
        setUserPosts(posts);
      })
      .catch((err) => {
        console.error("Failed to load user posts:", err);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingPosts(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [user?._id]);

  const handlePostDeleted = (deletedId: string) => {
    setUserPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setPhotoError("Please select an image file");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoError(null);
      setPhotoSuccess(null);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) return;

    setIsUploadingPhoto(true);
    setPhotoError(null);
    setPhotoSuccess(null);

    try {
      const formData = new FormData();
      formData.append("photo", photoFile);

      const response = await authApi.uploadProfilePhoto(formData);
      const updatedUser = response.user || response.data?.user;

      if (updatedUser) {
        setUser(updatedUser);
      } else {
        await refreshUser();
      }

      setPhotoSuccess("Profile picture updated successfully!");
      setPhotoFile(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setPhotoError(err.response.data.message || "Failed to update profile photo");
      } else {
        setPhotoError("Failed to upload profile picture");
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordData.password || !passwordData.newPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        password: passwordData.password,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess("Password changed successfully!");
      setPasswordData({ password: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setPasswordError(err.response.data.message || "Failed to change password");
      } else {
        setPasswordError("An unexpected error occurred while changing password");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-colors">
        <div className="h-44 bg-blue-600 relative rounded-t-2xl" />

        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 mb-4 gap-4">
            <div className="relative group z-10">
              <Avatar
                isBordered
                className="w-28 h-28 text-3xl border-4 border-white dark:border-slate-900 shadow-xl"
                color="secondary"
                src={photoPreview || user?.photo || undefined}
                name={user?.name || "User"}
              />
            </div>
            <div className="flex items-center gap-2 z-10">
              <Button
                as={Link}
                to="/"
                variant="flat"
                color="default"
                size="sm"
                className="font-medium"
              >
                Back to Feed
              </Button>
              <Button
                color="danger"
                variant="flat"
                size="sm"
                className="font-medium"
                onPress={logout}
              >
                Log Out
              </Button>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h1>
              {user?.gender && (
                <Chip size="sm" color="secondary" variant="flat" className="capitalize">
                  {user.gender}
                </Chip>
              )}
            </div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              @{user?.username || user?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-center">
            <div>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{userPosts.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{user?.followersCount ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{user?.followingCount ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs for Navigation */}
      <Tabs aria-label="Profile Sections" color="primary" variant="underlined" className="w-full justify-center">
        {/* Tab 1: My Posts */}
        <Tab key="posts" title={`My Posts (${userPosts.length})`}>
          <div className="space-y-4 pt-3">
            {isLoadingPosts ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" color="primary" label="Loading posts..." />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t published any posts yet.</p>
                <Button
                  as={Link}
                  to="/"
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="mt-3 font-medium"
                >
                  Create a Post
                </Button>
              </div>
            ) : (
              userPosts.map((post) => (
                <Post key={post._id} post={post} onPostDeleted={handlePostDeleted} />
              ))
            )}
          </div>
        </Tab>

        {/* Tab 2: Change Profile Photo */}
        <Tab key="photo" title="Profile Photo">
          <Card className="border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mt-3 p-6 transition-colors">
            <CardBody className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Update Profile Picture</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload a clear photo to personalize your profile across Circle.
              </p>

              {photoSuccess && (
                <Alert color="success" variant="faded" title={photoSuccess} />
              )}
              {photoError && (
                <Alert color="danger" variant="faded" title={photoError} />
              )}

              <form onSubmit={handleUploadPhoto} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    isBordered
                    color="secondary"
                    src={photoPreview || user?.photo || undefined}
                    name={user?.name || "User"}
                    className="w-20 h-20 text-xl"
                  />
                  <div>
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                      id="profile-photo-upload"
                    />
                    <Button
                      as="label"
                      htmlFor="profile-photo-upload"
                      variant="flat"
                      color="primary"
                      size="sm"
                      className="cursor-pointer font-medium"
                    >
                      Choose New Image
                    </Button>
                  </div>
                </div>

                {photoFile && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={isUploadingPhoto}
                      size="sm"
                      className="font-medium shadow-sm"
                    >
                      Save Picture
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      onPress={() => {
                        setPhotoFile(null);
                        if (photoPreview) URL.revokeObjectURL(photoPreview);
                        setPhotoPreview(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>
        </Tab>

        {/* Tab 3: Security & Password */}
        <Tab key="security" title="Change Password">
          <Card className="border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mt-3 p-6 transition-colors">
            <CardBody className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Security & Password</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ensure your account is protected with a strong, secure password.
              </p>

              {passwordSuccess && (
                <Alert color="success" variant="faded" title={passwordSuccess} />
              )}
              {passwordError && (
                <Alert color="danger" variant="faded" title={passwordError} />
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                <Input
                  type="password"
                  label="Current Password"
                  variant="bordered"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  isRequired
                />
                <Input
                  type="password"
                  label="New Password"
                  variant="bordered"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  isRequired
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  variant="bordered"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  isRequired
                />

                <Button
                  type="submit"
                  color="primary"
                  isLoading={isChangingPassword}
                  className="font-medium shadow-sm mt-2"
                >
                  Update Password
                </Button>
              </form>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
