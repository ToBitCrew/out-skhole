import { useEffect, useState } from "react";
import type { MajorCategory } from "@/types/api";
import { getCategories } from "@/services/categories";

export function useCategories() {
  const [categories, setCategories] = useState<MajorCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
