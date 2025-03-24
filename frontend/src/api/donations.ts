import { api } from "@/api/index.ts";

export const fetchLatestDonations = async (chain: string) => {
  try {
    const { data } = await api.get("/donations/latest" + (chain ? `/${chain}` : ""));
    return data;
  } catch (error) {
    throw error;
  }
};
