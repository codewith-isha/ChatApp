import axiosInstance from "./url.service";

export const sendOtp = async (phoneNumber, phoneSuffix, email) => {
  try {
    // console.log("🛰️ sendOtp payload:", { phoneNumber, phoneSuffix, email });
    const response = await axiosInstance.post("/auth/send-otp", { 
      phoneNumber,
      phoneSuffix,
      email,
    });
    console.log(response, "---------------------------")
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const verifyOtp = async (phoneNumber, phoneSuffix, otp, email) => {
  try {
    const payload = email?{email,emailOtp:otp}
    :{phoneNumber,phoneSuffix,otp}
    const response = await axiosInstance.post("/auth/verify-otp", payload);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateUserProfile = async (updateData) => {
  try {
    const response = await axiosInstance.put("/auth/update-profile", updateData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const checkUserAuth = async () => {
  try {
    const response = await axiosInstance.get("/auth/check-auth");
    if (response.data.status === "success") {
      return { isAuthenticated: true, User: response?.data?.data };
    } else if (response.data.status === "error") {
      return { isAuthenticated: false };
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/auth/users");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
