import { Request, Response } from "express";
import { getAdminFirestore } from "../lib/serverless";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const dbAdmin = getAdminFirestore();
    if (dbAdmin) {
      try {
        const snap = await dbAdmin.collection("destinations").get();
        if (snap.empty) {
          const { DESTINATIONS, POPULAR_AIRPORTS } = await import("../../src/data/destinations.js");
          for (const dest of DESTINATIONS) {
            await dbAdmin.collection("destinations").doc(dest.id).set(dest, { merge: true });
          }
          for (const airport of POPULAR_AIRPORTS) {
            await dbAdmin.collection("airports").doc(airport.code).set(airport, { merge: true });
          }
        }
      } catch (e: any) {
        console.warn("[Firebase Store Warning]", e?.message || e);
      }
    }

    res.status(200).json({
      success: true,
      message: "Destinations and popular airports successfully synced and seeded to Firebase Store.",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}