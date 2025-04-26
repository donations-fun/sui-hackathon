import { api } from "@/api/index";

export const fetchLeaderboard = async (chain: string) => {
  try {
    const { data } = await api.get("/leaderboard" + (chain ? `/${chain}` : ""));
    return data;
  } catch (error) {
    throw error;
  }
};
