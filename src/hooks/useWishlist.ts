import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("property_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((w) => w.property_id);
    },
    enabled: !!user,
  });
};

export const useWishlistProperties = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist-properties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("property_id, properties(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((w: any) => w.properties).filter(Boolean);
    },
    enabled: !!user,
  });
};

export const useToggleWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data: existing } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (existing) {
        await supabase.from("wishlists").delete().eq("id", existing.id);
        return { added: false };
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, property_id: propertyId });
        return { added: true };
      }
    },
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist", user?.id] });
      const prev = queryClient.getQueryData<string[]>(["wishlist", user?.id]) || [];
      const isWishlisted = prev.includes(propertyId);
      queryClient.setQueryData(
        ["wishlist", user?.id],
        isWishlisted ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["wishlist", user?.id], context?.prev);
      toast.error("Failed to update wishlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-properties", user?.id] });
    },
    onSuccess: (result) => {
      toast.success(result.added ? "Added to wishlist ❤️" : "Removed from wishlist");
    },
  });
};
