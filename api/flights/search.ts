import { Request, Response } from "express";
import { getGeminiClient, generateFallbackFlights, formatFlightResponse, estimateBasePrice } from "../lib/serverless";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const {
      origin = "JFK",
      destination = "LHR",
      departDate,
      returnDate,
      tripType = "round",
      segments = [],
      cabinClass = "Business",
      passengers = 1
    } = req.body;

    const gemini = getGeminiClient();
    let realTimeFlights: any[] | null = null;

    if (gemini) {
      try {
        let routeDescription = `from ${origin} to ${destination} departing on ${departDate}${tripType === "round" ? ` and returning on ${returnDate}` : ""}`;
        if (tripType === "multi" && Array.isArray(segments) && segments.length > 0) {
          const segStr = segments.map((s: any, i: number) => `Leg ${i + 1}: ${s.origin} to ${s.destination} on ${s.date}`).join(", ");
          routeDescription = `Multi-city flight itinerary with legs: [${segStr}]`;
        }

        const prompt = `Perform a real-time search for flight prices and actual flight options for ${routeDescription} for ${passengers} passenger(s) in ${cabinClass} class.

Provide output strictly in a valid JSON array format containing 4 to 6 flight option objects. Each object should have:
- flightNumber: string (e.g. "BA178", "EK202", "DL3")
- airline: string (e.g. "British Airways", "Emirates", "Delta Air Lines")
- airlineCode: string (2-letter code)
- origin: string (airport code)
- destination: string (airport code)
- departTime: string (e.g. "08:30 AM")
- arriveTime: string (e.g. "08:45 PM")
- duration: string (e.g. "14h 20m Total")
- stops: number (0 for nonstop, 1 for 1 stop)
- stopLocation: string or null
- retailPrice: number (estimated total retail price in USD)
- aircraft: string (e.g. "Boeing 787-9", "Airbus A350-1000")
- seatsRemaining: number (e.g. 3, 5, 8)
- cabinClass: string
- baggageIncluded: string (e.g. "2 x 32kg Checked Bags + Carry-on")

Only return JSON array, no markdown codeblocks or surrounding text if possible.`;

        const response = await gemini.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] }
        });

        const textResponse = response.text || "";
        const jsonMatch = textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          realTimeFlights = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiError) {
        // Fallback to generated flights
      }
    }

    if (!realTimeFlights || !Array.isArray(realTimeFlights) || realTimeFlights.length === 0) {
      realTimeFlights = generateFallbackFlights(origin, destination, cabinClass, passengers, tripType, segments);
    } else {
      realTimeFlights = realTimeFlights.map((f: any) => formatFlightResponse(f, origin, destination, cabinClass, passengers, tripType, segments));
    }

    res.status(200).json({
      success: true,
      searchQuery: { origin, destination, departDate, returnDate, tripType, segments, cabinClass, passengers },
      timestamp: new Date().toISOString(),
      flightsCount: realTimeFlights.length,
      currency: "USD",
      flights: realTimeFlights
    });
  } catch (err: any) {
    console.error("Flight Search API Error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to fetch real-time flights" });
  }
}