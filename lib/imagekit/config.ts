export const DEFAULT_IMAGEKIT_FOLDER = "/wedding/thuong-huy/";
export const IMAGEKIT_UPLOAD_TRANSFORMATION =
  "rt-auto,w-2400,h-2400,c-at_max,q-82,f-webp,md-false";
export const IMAGEKIT_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const IMAGEKIT_MAX_PIXELS = 25_000_000;
export const IMAGEKIT_MAX_ALBUM_IMAGES = 45;

export interface ImageKitConfig {
  privateKey: string;
  publicKey: string;
  urlEndpoint: string;
  folder: string;
}

export interface ImageKitEnv {
  [key: string]: string | undefined;
  IMAGEKIT_PRIVATE_KEY?: string;
  IMAGEKIT_PUBLIC_KEY?: string;
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?: string;
  /** Supported as a backwards-compatible alias for local scripts. */
  IMAGEKIT_URL_ENDPOINT?: string;
  IMAGEKIT_FOLDER?: string;
}

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function normalizeImageKitFolder(folder = DEFAULT_IMAGEKIT_FOLDER): string {
  const value = clean(folder).replaceAll("\\", "/");
  if (!value) return DEFAULT_IMAGEKIT_FOLDER;
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, "/");
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

export function normalizeImageKitEndpoint(endpoint: string): string {
  const value = clean(endpoint).replace(/\/+$/, "");
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

/**
 * Reads the six documented environment variables. Missing values return null
 * so the public page can fall back to local demo images without throwing.
 */
export function getImageKitConfig(env: ImageKitEnv = process.env): ImageKitConfig | null {
  const privateKey = clean(env.IMAGEKIT_PRIVATE_KEY);
  const publicKey = clean(env.IMAGEKIT_PUBLIC_KEY);
  const urlEndpoint = normalizeImageKitEndpoint(
    clean(env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) || clean(env.IMAGEKIT_URL_ENDPOINT),
  );

  if (!privateKey || !publicKey || !urlEndpoint) return null;

  return {
    privateKey,
    publicKey,
    urlEndpoint,
    folder: normalizeImageKitFolder(env.IMAGEKIT_FOLDER || DEFAULT_IMAGEKIT_FOLDER),
  };
}

export function isImageKitConfigured(env: ImageKitEnv = process.env): boolean {
  return getImageKitConfig(env) !== null;
}

export function requireImageKitConfig(env: ImageKitEnv = process.env): ImageKitConfig {
  const config = getImageKitConfig(env);
  if (!config) {
    throw new Error(
      "ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.",
    );
  }
  return config;
}
