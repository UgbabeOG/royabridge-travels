import { Request, Response } from "express";
import { getAdminAuth, adminClaimsStore } from "../lib/serverless";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { uid, admin: isAdminRole } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: "User UID is required" });
    }

    const shouldBeAdmin = Boolean(isAdminRole);
    adminClaimsStore.set(uid, shouldBeAdmin);

    let firebaseClaimSet = false;
    try {
      const authService = getAdminAuth();
      if (authService) {
        await authService.setCustomUserClaims(uid, { admin: shouldBeAdmin });
        firebaseClaimSet = true;
      }
    } catch (claimErr: any) {
      console.warn("[Firebase Admin Claim Warning]", claimErr.message);
    }

    res.status(200).json({
      success: true,
      uid,
      admin: shouldBeAdmin,
      firebaseClaimSet,
      message: `Admin custom claim successfully updated. admin = ${shouldBeAdmin}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}