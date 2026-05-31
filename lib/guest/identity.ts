import crypto from "node:crypto";

export const GUEST_ID_COOKIE = "china_food_guest_id";
export const DEVICE_ID_COOKIE = "china_food_device_id";
export const GUEST_ID_HEADER = "x-china-food-guest-id";
export const DEVICE_ID_HEADER = "x-china-food-device-id";

function createIdentifier(prefix: string) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

export function createGuestId() {
  return createIdentifier("guest");
}

export function createDeviceId() {
  return createIdentifier("device");
}

export function hashIdentifier(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getRequestIdentifier(
  headers: Headers,
  cookies: { get: (name: string) => { value: string } | undefined },
  headerName: string,
  cookieName: string
) {
  return headers.get(headerName) ?? cookies.get(cookieName)?.value ?? null;
}
