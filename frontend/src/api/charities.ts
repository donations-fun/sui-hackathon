import { api } from "@/api/index";

export const fetchCharities = async () => {
  try {
    const { data } = await api.get("/charities/all");
    return data;
  } catch (error) {
    throw error;
  }
};
