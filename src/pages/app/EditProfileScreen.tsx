import { useState } from "react";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRef } from "react";

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setName(profile.name || "");
    setPhone(profile.phone || "");
    setPhotoUrl(profile.profile_photo || "");
    setInitialized(true);
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl + "?t=" + Date.now());
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        name: name.trim() || null,
        phone: phone.trim() || null,
        profile_photo: photoUrl || null,
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated!");
      navigate(-1);
    },
    onError: (err: any) => toast.error(err.message || "Failed to save"),
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 py-6">
          {/* Photo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-secondary border-4 border-primary/20">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-blue flex items-center justify-center">
                    <span className="text-primary-foreground text-2xl font-bold">{name?.charAt(0)?.toUpperCase() || "U"}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-card"
              >
                {uploading ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-primary-foreground" />
                )}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <input className={inputClass} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input className={inputClass} value={user.email || ""} disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
              <input className={inputClass} placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full gradient-blue text-primary-foreground border-0 font-semibold gap-2"
            >
              <Save className="h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileScreen;
