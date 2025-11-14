import axios from "axios";

const USER_SERVICE = process.env.USER_SERVICE_URL;

export default {
  getMe: async (context: any) => {
    const cookieHeader = Object.entries(context.cookies || {})
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");

    const res = await axios.get(`${USER_SERVICE}/auth/me`, {
      headers: {
        Cookie: cookieHeader,
      },
      withCredentials: true,
    });

    return res.data;
  },
};
