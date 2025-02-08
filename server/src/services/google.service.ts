import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import db from "../config/prisma";
import { uploadProfilePictureToS3 } from "./s3.service";

export function getGoogleAuthURL() {
  try {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";


    const options = {
      redirect_uri: `${process.env.GOOGLE_REDIRECT_URI!}`,
      client_id: `${process.env.GOOGLE_CLIENT_ID!}`,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };
    const authUrl = `${rootUrl}?${new URLSearchParams(options).toString()}`;
    return authUrl;
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    throw new Error("Failed to generate Google auth URL");
  }
}


interface GoogleAccessTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

export async function getGoogleAccessToken(
  code: string
): Promise<GoogleAccessTokenResponse> {
  try {
    const url = "https://oauth2.googleapis.com/token";

    const options = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    };
    const body = new URLSearchParams(options).toString();
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting Google access token:", error);
    throw new Error("Failed to get Google access token");
  }
}


interface GoogleUserInfoResponse {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export async function getGoogleUserInfo(
  accessToken: string,
  id_token: string
): Promise<GoogleUserInfoResponse> {
  try {
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting Google user info:", error);
    throw new Error("Failed to get Google user info");
  }
}

async function downloadGoogleProfilePicture(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download profile picture');
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function upsertGoogleUser(userInfo: GoogleUserInfoResponse): Promise<User> {
  try {
    if (!userInfo.email_verified) {
      throw new Error("Google user email is not verified");
    }

    const user = await db.user.findUnique({
      where: {
        email: userInfo.email,
      },
    });

    // If user exists, update their profile picture if it has changed
    if (user) {
      return user;
    }

    // Generate a secure random password for Google OAuth users
    const randomPassword = Math.random().toString(36).slice(-10) +
      Math.random().toString(36).slice(-10) +
      Date.now().toString(36);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create temporary user to get an ID for the S3 key
    const tempUser = await db.user.create({
      data: {
        email: userInfo.email,
        name: userInfo.name,
        password: hashedPassword,
        profilePicture: null,
      },
    });

    // Upload profile picture to S3
    let s3Key = null;
    try {
      const imageBuffer = await downloadGoogleProfilePicture(userInfo.picture);
      const file: Express.Multer.File = {
        buffer: imageBuffer,
        originalname: `${tempUser.id}_google_profile.jpg`,
        mimetype: 'image/jpeg',
        size: imageBuffer.length,
        fieldname: 'profilePicture',
        encoding: '7bit',
        destination: '',
        filename: '',
        path: '',
        stream: null as any
      };

      s3Key = await uploadProfilePictureToS3(file, tempUser.id);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      // Continue even if profile picture upload fails
    }

    // Update user with S3 key
    const updatedUser = await db.user.update({
      where: { id: tempUser.id },
      data: { profilePicture: s3Key }
    });

    return updatedUser;
  } catch (error) {
    console.error("Error upserting Google user:", error);
    throw new Error("Failed to upsert Google user");
  }
}
