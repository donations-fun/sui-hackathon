import { api } from "@/api/index";

export const fetchTokens = async () => {
  try {
    const { data } = await api.get("/tokens/all");
    return data;
  } catch (error) {
    throw error;
  }
};
