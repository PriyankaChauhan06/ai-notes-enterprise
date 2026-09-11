import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured");

export const googleClient = new OAuth2Client(clientId);
