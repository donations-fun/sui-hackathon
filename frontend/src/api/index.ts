import axios from "axios";
import { ENV } from '@/utils/env.ts';

export const api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 30_000,
});
