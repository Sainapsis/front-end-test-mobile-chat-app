import { formatTimeTo2HourDigit } from "../formatTimeTo2HourDigit";

describe("formatTimeTo2HourDigit", () => {
  it("Should return the time in 2-digit format", () => {
    const timestamp = new Date("2023-03-25T14:05:00").getTime();
    const formattedTime = formatTimeTo2HourDigit(timestamp);

    expect(formattedTime).toBe("02:05 PM");
  });

  it("Should handle correctly midnight (00:00)", () => {
    const timestamp = new Date("2023-03-25T00:00:00").getTime();
    const formattedTime = formatTimeTo2HourDigit(timestamp);

    expect(formattedTime).toBe("12:00 AM");
  });

  it("Should handle correctly midday (12:00)", () => {
    const timestamp = new Date("2023-03-25T12:00:00").getTime();
    const formattedTime = formatTimeTo2HourDigit(timestamp);

    expect(formattedTime).toBe("12:00 PM");
  });
});
