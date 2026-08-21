import apiError from "./apiError";

describe("apiError", () => {
  it("prefers the message the API sent", () => {
    const error = {
      response: {
        status: 409,
        data: { success: false, message: "Slot already booked" },
      },
    };
    expect(apiError(error)).toBe("Slot already booked");
  });

  it("falls back when the response carries no message", () => {
    expect(apiError({ response: { status: 500, data: {} } })).toBe(
      "Something went wrong"
    );
  });

  it("reports an unreachable server distinctly", () => {
    expect(apiError({ message: "Network Error" })).toBe(
      "Cannot reach the server"
    );
  });

  it("accepts a caller-supplied fallback", () => {
    expect(apiError(null, "Could not load doctors")).toBe(
      "Could not load doctors"
    );
  });
});
