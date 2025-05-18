import { api } from "@/api/index.ts";
import { DonationExtended } from "@/hooks/entities/donation.extended";
import { ITEMS_PER_PAGE } from "@/utils/constants";

export const fetchLatestDonations = async (chain: string): Promise<DonationExtended[]> => {
  try {
    const { data } = await api.get("/donations/latest" + (chain ? `/${chain}` : ""));
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchMyDonations = async (chain: string, jwt: string, currentPage: number) => {
  try {
    const { data } = await api.get(
      "/donations/my-account" + (chain ? `/${chain}` : "") + `?offset=${currentPage * ITEMS_PER_PAGE}`,
      {
        headers: { authorization: `Bearer ${jwt}` },
      },
    );
    return data;
  } catch (error) {
    throw error;
  }
};
