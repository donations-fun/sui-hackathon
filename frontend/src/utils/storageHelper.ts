const twitterCancelKey = "socialfi-cancelled";
const jwtKey = "jwt";

export const storageHelper = {
  setTwitterCancelled() {
    const expirationTime = 24 * 60 * 60 * 1000; // 1 day

    localStorage.setItem(
      twitterCancelKey,
      JSON.stringify({
        timestamp: Date.now(),
        expirationTime,
      }),
    );
  },

  isTwitterCancelled() {
    const storedData = localStorage.getItem(twitterCancelKey);
    if (!storedData) {
      return false;
    }

    const { timestamp, expirationTime } = JSON.parse(storedData);
    if (Date.now() > timestamp + expirationTime) {
      localStorage.removeItem(twitterCancelKey);

      return false;
    }

    return true;
  },

  setJwt(response: { jwt: string; twitterUsername: string; address: string } | null) {
    if (!response) {
      localStorage.removeItem(jwtKey);

      return;
    }

    const expirationTime = 60 * 24 * 60 * 60 * 1000; // 60 days

    localStorage.setItem(
      jwtKey,
      JSON.stringify({
        response,
        timestamp: Date.now(),
        expirationTime,
      }),
    );
  },

  getJwt(): { jwt: string; twitterUsername: string; address: string } | null {
    const storedData = localStorage.getItem(jwtKey);
    if (!storedData) {
      return null;
    }

    const { response, timestamp, expirationTime } = JSON.parse(storedData);
    if (Date.now() > timestamp + expirationTime) {
      localStorage.removeItem(jwtKey);

      return null;
    }

    return response;
  },
};
