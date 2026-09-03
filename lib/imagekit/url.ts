import type { AlbumImage } from "../../content/wedding";
import { getImageKitConfig, normalizeImageKitEndpoint } from "./config";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: "at_max" | "maintain_ratio" | "force" | string;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png" | string;
  blur?: number;
  dpr?: number;
}

function positiveInteger(value: number | undefined): number | undefined {
  if (!Number.isFinite(value) || value === undefined || value <= 0) return undefined;
  return Math.round(value);
}

function clampQuality(value: number | undefined): number | undefined {
  if (!Number.isFinite(value) || value === undefined) return undefined;
  return Math.min(100, Math.max(1, Math.round(value)));
}

function clampBlur(value: number | undefined): number | undefined {
  if (!Number.isFinite(value) || value === undefined) return undefined;
  return Math.min(100, Math.max(1, Math.round(value)));
}

/** Build ImageKit's compact transformation query value. */
export function buildTransformation(options: ImageTransformOptions = {}): string {
  const values: string[] = [];
  const width = positiveInteger(options.width);
  const height = positiveInteger(options.height);
  const quality = clampQuality(options.quality);
  const blur = clampBlur(options.blur);
  const dpr = positiveInteger(options.dpr);

  if (width) values.push(`w-${width}`);
  if (height) values.push(`h-${height}`);
  if (options.crop) values.push(`c-${safeTransformationValue(options.crop)}`);
  if (quality) values.push(`q-${quality}`);
  if (options.format) values.push(`f-${safeTransformationValue(options.format)}`);
  if (blur) values.push(`bl-${blur}`);
  if (dpr && dpr > 1) values.push(`dpr-${Math.min(3, dpr)}`);

  return values.join(",");
}

function safeTransformationValue(value: string): string {
  // Transformation values are controlled by our own UI/config. Strip query
  // delimiters anyway so a path can never be turned into a second parameter.
  return value.replace(/[\s&,?=#]/g, "");
}

function appendTransformation(source: string, transformation: string): string {
  if (!transformation) return source;
  const separator = source.includes("?") ? "&" : "?";
  return `${source}${separator}tr=${transformation}`;
}

/**
 * Generate a delivery URL. Local `/images/...` paths are returned unchanged,
 * while ImageKit URLs receive a `tr=` query string.
 */
export function buildImageUrl(
  source: string,
  options: ImageTransformOptions = {},
  config = getImageKitConfig(),
): string {
  const value = source.trim();
  if (!value) return value;

  const transformation = buildTransformation(options);
  if (!transformation) return value;

  // A local fallback should not receive an ImageKit query string.
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  const endpoint = config?.urlEndpoint ? normalizeImageKitEndpoint(config.urlEndpoint) : "";
  if (!endpoint && !/^https?:\/\//i.test(value)) return value;
  return appendTransformation(value, transformation);
}

export function getImageKitUrl(
  path: string,
  options: ImageTransformOptions = {},
  config = getImageKitConfig(),
): string {
  const cleanPath = path.trim();
  if (!cleanPath) return cleanPath;
  if (/^https?:\/\//i.test(cleanPath)) return buildImageUrl(cleanPath, options, config);
  if (!config?.urlEndpoint) return cleanPath;

  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return buildImageUrl(`${config.urlEndpoint}${normalizedPath}`, options, config);
}

export function getAlbumImageSource(
  image: Pick<AlbumImage, "src" | "url" | "path">,
  options: ImageTransformOptions = {},
  config = getImageKitConfig(),
): string {
  // Prefer the original path when a configured endpoint is available. This
  // keeps transformed URLs stable even if ImageKit's response URL changes.
  if (config?.urlEndpoint && image.path) return getImageKitUrl(image.path, options, config);
  return buildImageUrl(image.url || image.src, options, config);
}

export function getResponsiveImageSources(
  image: Pick<AlbumImage, "src" | "url" | "path">,
  widths: readonly number[] = [360, 640, 960, 1440],
  config = getImageKitConfig(),
): Array<{ width: number; src: string }> {
  return widths
    .filter((width) => Number.isFinite(width) && width > 0)
    .map((width) => ({
      width: Math.round(width),
      src: getAlbumImageSource(image, { width: Math.round(width), quality: 82, format: "webp" }, config),
    }));
}

export const transformImageUrl = buildImageUrl;
export const buildImageKitUrl = getImageKitUrl;
export const responsiveImageSources = getResponsiveImageSources;
