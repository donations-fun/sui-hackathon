import { api } from "@/api/index.ts";

export const fetchTwitterVerification = async (address: string) => {
  try {
    const { data } = await api.get(`/twitter/verification/${address}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchTwitterUrl = async (address: string) => {
  try {
    const { data } = await api.get(`/twitter/url/${address}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchTwitterOauth = async (
  address: string,
  state: string | null,
  code: string | null,
  signature: string,
) => {
  try {
    if (!state || !code) {
      return undefined;
    }
    const { data } = await api.post(`/twitter/oauth`, { state, code, address, signature });
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchReAuth = async (address: string, timestamp: number, signature: string) => {
  try {
    const { data } = await api.post(`/re-auth`, { timestamp, address, signature });
    return data;
  } catch (error) {
    throw error;
  }
};
