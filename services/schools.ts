import type { School, Department } from "@/types/api";
import api from "./api";

export async function searchSchools(params?: {
  q?: string;
  region?: string;
  univ_type?: string;
}) {
  const { data } = await api.get<{
    success: true;
    data: { items: School[] };
  }>("/schools", { params });
  return data.data.items;
}

export async function getDepartments(
  schoolCd: string,
  params?: { q?: string; is_active?: boolean }
) {
  const { data } = await api.get<{
    success: true;
    data: { items: Department[] };
  }>(`/schools/${schoolCd}/departments`, { params });
  return data.data.items;
}
