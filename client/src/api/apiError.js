// the API sends { success, message } on failure; surface that instead of a
// generic "something went wrong" whenever it is there
const apiError = (error, fallback = "Something went wrong") => {
  if (error && error.response && error.response.data) {
    return error.response.data.message || fallback;
  }
  if (error && error.message === "Network Error") {
    return "Cannot reach the server";
  }
  return fallback;
};

export default apiError;
