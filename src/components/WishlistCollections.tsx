import { useState } from "react";
import { FolderHeart, Plus, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WishlistCollection {
  id: string;
  name: string;
  propertyIds: string[];
}

const STORAGE_KEY = "urbanstay-collections";

const getCollections = (): WishlistCollection[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [
    { id: "default", name: "Favorites", propertyIds: [] },
  ];
};

const saveCollections = (cols: WishlistCollection[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
};

interface WishlistCollectionsProps {
  propertyId?: string;
  onAddToCollection?: (collectionName: string) => void;
}

const WishlistCollections = ({ propertyId, onAddToCollection }: WishlistCollectionsProps) => {
  const [collections, setCollections] = useState<WishlistCollection[]>(getCollections());
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  const createCollection = () => {
    if (!newName.trim()) return;
    const updated = [...collections, { id: Date.now().toString(), name: newName.trim(), propertyIds: [] }];
    setCollections(updated);
    saveCollections(updated);
    setNewName("");
    setShowNew(false);
    toast.success(`Collection "${newName.trim()}" created`);
  };

  const addToCollection = (colId: string) => {
    if (!propertyId) return;
    const updated = collections.map((c) =>
      c.id === colId && !c.propertyIds.includes(propertyId)
        ? { ...c, propertyIds: [...c.propertyIds, propertyId] }
        : c
    );
    setCollections(updated);
    saveCollections(updated);
    const col = collections.find((c) => c.id === colId);
    toast.success(`Added to "${col?.name}"`);
    onAddToCollection?.(col?.name || "");
  };

  const removeCollection = (colId: string) => {
    if (colId === "default") return;
    const updated = collections.filter((c) => c.id !== colId);
    setCollections(updated);
    saveCollections(updated);
    toast.success("Collection removed");
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <FolderHeart className="h-4 w-4 text-primary" />
          Collections
        </h3>
        <button onClick={() => setShowNew(!showNew)} className="text-xs font-semibold text-primary flex items-center gap-0.5">
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>

      {showNew && (
        <div className="flex gap-2 mb-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => e.key === "Enter" && createCollection()}
          />
          <Button onClick={createCollection} size="sm" className="gradient-blue text-primary-foreground border-0">
            Add
          </Button>
        </div>
      )}

      <div className="space-y-1.5">
        {collections.map((col) => (
          <div
            key={col.id}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors group"
          >
            <FolderHeart className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{col.name}</p>
              <p className="text-[10px] text-muted-foreground">{col.propertyIds.length} properties</p>
            </div>
            {propertyId && (
              <button
                onClick={() => addToCollection(col.id)}
                className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                + Add
              </button>
            )}
            {col.id !== "default" && (
              <button
                onClick={() => removeCollection(col.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistCollections;
