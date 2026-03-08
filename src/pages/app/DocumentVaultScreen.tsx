import { useState } from "react";
import { ArrowLeft, Upload, FileText, Trash2, Eye, Lock, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Document {
  name: string;
  id: string;
  created_at: string;
  metadata: { size?: number; mimetype?: string };
}

const docCategories = [
  { key: "agreements", label: "Lease Agreements", icon: FileText },
  { key: "ids", label: "ID Documents", icon: Lock },
  { key: "receipts", label: "Rent Receipts", icon: FolderOpen },
];

const DocumentVaultScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("agreements");
  const [uploading, setUploading] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["vault-docs", user?.id, activeCategory],
    queryFn: async () => {
      const path = `${user!.id}/${activeCategory}`;
      const { data, error } = await supabase.storage
        .from("document-vault")
        .list(path, { limit: 50, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder") as Document[];
    },
    enabled: !!user,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploading(true);
    const path = `${user.id}/${activeCategory}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("document-vault").upload(path, file);
    setUploading(false);

    if (error) {
      toast.error("Upload failed: " + error.message);
      return;
    }
    toast.success("Document uploaded securely!");
    queryClient.invalidateQueries({ queryKey: ["vault-docs", user.id, activeCategory] });
    e.target.value = "";
  };

  const handleDelete = async (name: string) => {
    if (!user) return;
    const path = `${user.id}/${activeCategory}/${name}`;
    const { error } = await supabase.storage.from("document-vault").remove([path]);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Document deleted");
    queryClient.invalidateQueries({ queryKey: ["vault-docs", user.id, activeCategory] });
  };

  const handleView = async (name: string) => {
    if (!user) return;
    const path = `${user.id}/${activeCategory}/${name}`;
    const { data } = await supabase.storage.from("document-vault").createSignedUrl(path, 300);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatName = (name: string) => {
    // Remove timestamp prefix
    const parts = name.split("_");
    return parts.length > 1 ? parts.slice(1).join("_") : name;
  };

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Lock className="h-12 w-12 text-primary mb-4" />
        <h3 className="font-bold text-foreground mb-2">Secure Document Vault</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center">Sign in to securely store your lease agreements, IDs, and receipts.</p>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> Document Vault
        </h2>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-3">
        {docCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
              activeCategory === cat.key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            }`}
          >
            <cat.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Upload button */}
      <div className="px-4 mb-4">
        <label className="w-full">
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
          <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary font-semibold text-sm cursor-pointer hover:bg-primary/10 transition-colors">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Document"}
          </div>
        </label>
        <p className="text-[10px] text-muted-foreground mt-1 text-center">PDF, JPG, PNG, DOC — Max 10MB</p>
      </div>

      {/* Documents list */}
      <div className="px-4 space-y-2 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !documents?.length ? (
          <div className="text-center py-10 text-muted-foreground">
            <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents yet</p>
            <p className="text-xs mt-1">Upload your first document above</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id || doc.name} className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{formatName(doc.name)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatSize(doc.metadata?.size)} · {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => handleView(doc.name)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <Eye className="h-3.5 w-3.5 text-foreground" />
              </button>
              <button onClick={() => handleDelete(doc.name)} className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentVaultScreen;
