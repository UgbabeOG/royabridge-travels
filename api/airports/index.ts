import { Request, Response } from "express";
import { getAdminFirestore } from "../lib/serverless";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    let list: any[] = [];
    const dbAdmin = getAdminFirestore();
    if (dbAdmin) {
      try {
        const snap = await dbAdmin.collection("airports").get();
        if (!snap.empty) {
          snap.forEach((doc: any) => list.push(doc.data()));
        }
      } catch (e) {
        // Fallback
      }
    }

    res.status(200).json({
      success: true,
      source: "firebase_firestore_store",
      airports: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}