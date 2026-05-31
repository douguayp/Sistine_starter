import { NextRequest, NextResponse } from "next/server";
import {
  createDeviceId,
  createGuestId,
  DEVICE_ID_COOKIE,
  DEVICE_ID_HEADER,
  GUEST_ID_COOKIE,
  GUEST_ID_HEADER,
} from "@/lib/guest/identity";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

type GuestInitResponse = {
  guestId: string;
  deviceId: string;
};

export async function POST(req: NextRequest) {
  const guestId =
    req.headers.get(GUEST_ID_HEADER) ??
    req.cookies.get(GUEST_ID_COOKIE)?.value ??
    createGuestId();
  const deviceId =
    req.headers.get(DEVICE_ID_HEADER) ??
    req.cookies.get(DEVICE_ID_COOKIE)?.value ??
    createDeviceId();

  const response = NextResponse.json({
    guestId,
    deviceId,
  } satisfies GuestInitResponse);

  response.cookies.set(GUEST_ID_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  response.cookies.set(DEVICE_ID_COOKIE, deviceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
