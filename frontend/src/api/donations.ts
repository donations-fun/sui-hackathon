import { api } from "@/api/index.ts";

export const fetchLatestDonations = async (chain: string) => {
  try {
    const { data } = await api.get("/donations/latest" + (chain ? `/${chain}` : ""));
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchMyDonations = async (chain: string, jwt: string) => {
  try {
    const { data } = await api.get("/donations/my-account" + (chain ? `/${chain}` : ""), {
      headers: { authorization: `Bearer ${jwt}` },
    });
    return data;
  } catch (error) {
    throw error;
  }
};
