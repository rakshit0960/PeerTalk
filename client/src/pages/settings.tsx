import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { motion } from "framer-motion";
import { Camera, Loader2, X, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_NAME_LENGTH = 50;
const MAX_BIO_LENGTH = 150;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// TODO: implement the settings page in backend
export default function Settings() {
  const { name, token } = useStore((state) => ({
    name: state.name,
    // bio: state.bio || "",
    // avatar: state.avatar,
    token: state.token,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: name,
    bio: "",
    avatar: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>("avatar");
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hasFormChanges =
      formData.name !== name ||
      formData.bio !== "bio" ||
      formData.avatar !== "avatar";
    setHasChanges(hasFormChanges);
  }, [formData, name]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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


    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    if (formData.name.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Name cannot be empty",
      });
      return;
    }


    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      useStore.setState({
        name: formData.name,
        // bio: formData.bio,
        // avatar: formData.avatar,
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
    } finally {
      setIsLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-start gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={imagePreview || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {formData.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {imagePreview && (
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
                  ref={fileInputRef}
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
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                maxLength={MAX_NAME_LENGTH}
                placeholder="Your display name"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {formData.name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <div className="relative max-w-md">
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                maxLength={MAX_BIO_LENGTH}
                placeholder="Write a short bio about yourself"
                className="resize-none pr-16"
                rows={4}
              />
              <span
                className={cn(
                  "absolute right-3 bottom-3 text-xs",
                  formData.bio.length >= MAX_BIO_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {formData.bio.length}/{MAX_BIO_LENGTH}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
            className="w-full max-w-md"
          >
            {isLoading ? (
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