import { Request, Response } from "express";
import { getAdminFirestore } from "../lib/serverless";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { destinationId, passengers = 1, cabinClass = "Business" } = req.body;

    let dest: any = null;
    const dbAdmin = getAdminFirestore();
    if (dbAdmin && destinationId) {
      try {
        const docSnap = await dbAdmin.collection("destinations").doc(destinationId).get();
        if (docSnap.exists) {
          dest = docSnap.data();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!dest) {
      return res.status(404).json({ success: false, error: "Destination not found in Firebase Store database" });
    }

    let multiplier = 1;
    if (cabinClass === "Premium Economy") multiplier = 1.35;
    if (cabinClass === "Business") multiplier = 1.0;
    if (cabinClass === "First") multiplier = 2.2;
    if (cabinClass === "Economy") multiplier = 0.55;

    const serverRetailPrice = Math.round(dest.retailPrice * multiplier * passengers);
    const serverRoyaPrice = Math.round(dest.royaPrice * multiplier * passengers);
    const serverSavings = serverRetailPrice - serverRoyaPrice;
    const discountPercentage = Math.round((serverSavings / serverRetailPrice) * 100);

    res.status(200).json({
      success: true,
      verifiedByBackend: true,
      source: "firebase_firestore_store",
      destination: dest,
      pricing: {
        passengers,
        cabinClass,
        retailPrice: serverRetailPrice,
        royaPrice: serverRoyaPrice,
        savingsAmount: serverSavings,
        discountPercentage: `${discountPercentage}%`,
        currency: "USD",
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}