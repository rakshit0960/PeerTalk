import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const MAX_NAME_LENGTH = 50;
const MAX_BIO_LENGTH = 150;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FormData {
  name: string;
  bio: string;
  profilePicture: File | string;
}

export default function Settings() {
  const { name, token, bio, profilePicture } = useStore((state) => ({
    name: state.name,
    bio: state.bio || "",
    profilePicture: state.profilePicture || "",
    token: state.token,
  }));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      name: name,
      bio: bio,
      profilePicture: profilePicture,
    }
  });

  const navigate = useNavigate();
  const formValues = watch();

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 5MB",
      });
      return;
    }

    setValue('profilePicture', file, { shouldDirty: true });
  }, [setValue]);

  const removeImage = useCallback(() => {
    setValue('profilePicture', profilePicture, { shouldDirty: true });
  }, [profilePicture, setValue]);

  const handleBioUpdate = useCallback(async (bio: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile/bio`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio }),
    });

    if (!response.ok) throw new Error("Failed to update bio");
    const data = await response.json();
    useStore.getState().setToken(data.token);
  }, [token]);

  const handleNameUpdate = useCallback(async (name: string) => {
    if (name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile/name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) throw new Error("Failed to update name");
    const data = await response.json();
    useStore.getState().setToken(data.token);
  }, [token]);

  const handleProfilePictureUpdate = useCallback(async (profilePicture: File) => {
    const pictureData = new FormData();
    pictureData.append('profilePicture', profilePicture);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile/picture`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: pictureData,
    });

    if (!response.ok) throw new Error("Failed to update profile picture");
    const data = await response.json();
    useStore.getState().setToken(data.token);
  }, [token]);

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      if (data.name !== name) {
        await handleNameUpdate(data.name);
      }
      if (data.bio !== bio) {
        await handleBioUpdate(data.bio);
      }
      if (data.profilePicture instanceof File) {
        await handleProfilePictureUpdate(data.profilePicture);
      }

      useStore.setState({
        name: data.name,
        bio: data.bio,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    }
  }, [name, bio, handleNameUpdate, handleBioUpdate, handleProfilePictureUpdate]);

  // Memoize the profile picture URL to prevent unnecessary re-renders
  const profilePictureUrl = useMemo(() => {
    if (formValues.profilePicture instanceof File) {
      return URL.createObjectURL(formValues.profilePicture);
    }
    return formValues.profilePicture;
  }, [formValues.profilePicture]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold">Profile Settings</h1>
            </div>
            <p className="text-muted-foreground pl-11">
              Customize your profile information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Picture */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-start gap-6">
              <div className="relative group">
                {
                  formValues.profilePicture instanceof File ? (
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profilePictureUrl} />
                      <AvatarFallback className="bg-primary/10 text-2xl">
                        {name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserAvatar
                      className="w-24 h-24"
                      profilePicture={profilePictureUrl}
                      fallbackClassName="bg-primary/10 text-2xl"
                    />
                  )
                }
                {formValues.profilePicture instanceof File && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-muted cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Upload New Picture
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP (max. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <div className="relative max-w-md">
              <Input
                id="name"
                {...register('name')}
                maxLength={MAX_NAME_LENGTH}
                placeholder="Your display name"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {formValues.name?.length || 0}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <div className="relative max-w-md">
              <Textarea
                id="bio"
                {...register('bio')}
                maxLength={MAX_BIO_LENGTH}
                placeholder="Write a short bio about yourself"
                className="resize-none pr-16"
                rows={4}
              />
              <span
                className={cn(
                  "absolute right-3 bottom-3 text-xs",
                  (formValues.bio?.length || 0) >= MAX_BIO_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {formValues.bio?.length || 0}/{MAX_BIO_LENGTH}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full max-w-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}