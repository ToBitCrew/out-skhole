import type { MajorCategory } from "@/types/api";
import api from "./api";

export async function getCategories() {
  const { data } = await api.get<{
    success: true;
    data: MajorCategory[];
  }>("/categories");
  return data.data;
}
