import { Request, Response } from "express";
import { estimateBasePrice } from "../lib/serverless";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { origin = "JFK", destination = "LHR", cabinClass = "Business" } = req.body;
    const basePrice = estimateBasePrice(origin, destination, cabinClass);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const trendData = days.map((day, i) => {
      const varFactor = i === 1 || i === 2 ? 0.88 : (i === 4 || i === 6 ? 1.18 : 1.0);
      const retail = Math.round(basePrice * varFactor);
      return {
        day,
        retailPrice: retail,
        royaPrice: Math.round(retail * 0.70),
        isCheapest: i === 1
      };
    });

    res.status(200).json({
      success: true,
      origin,
      destination,
      cabinClass,
      cheapestDay: "Tuesday",
      priceAdvice: "Prices are expected to rise by 12% in the next 48 hours. We recommend placing a 24h free hold now.",
      trend: trendData
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}