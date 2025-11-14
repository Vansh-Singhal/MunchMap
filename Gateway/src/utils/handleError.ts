import axios from 'axios';

export const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    // Axios error handling
    console.error(`Axios error: ${error.message}`);
    if (error.response) {
      return { success: false, message: error.response.data.message || "Something went wrong" };
    }
  } else {
    // General error handling
    console.error(`Unknown error: ${error.message || error}`);
  }
  return { success: false, message: "Internal server error" };
};