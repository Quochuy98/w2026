#!/usr/bin/env node

import { readdir, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ImageKit, { toFile } from "@imagekit/nodejs";
import sharp from "sharp";
import type { AlbumImage, WeddingSlot } from "../content/wedding";
import { SLOT_LAYOUTS, WEDDING_SLOTS } from "../content/wedding";
import {
  IMAGEKIT_MAX_PIXELS,
  IMAGEKIT_MAX_UPLOAD_BYTES,
  IMAGEKIT_UPLOAD_TRANSFORMATION,
  getImageKitConfig,
  IMAGEKIT_MAX_ALBUM_IMAGES,
  type ImageKitConfig,
} from "../lib/imagekit/config";
import { createImageKitClient } from "../lib/imagekit/client";
import { getImageKitUrl } from "../lib/imagekit/url";

export const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
]);

export interface UploadAlbumCliOptions {
  folder: string;
  expected?: number;
  replace: boolean;
  manifestPath: string;
}

export interface ProcessedAlbumImage {
  sourcePath: string;
  outputName: string;
  buffer: Buffer;
  width: number;
  height: number;
}

export interface ExistingAlbumAsset {
  name?: string;
  filePath?: string;
  tags?: string[] | null;
  fileId?: string;
  updatedAt?: string;
}

export interface UploadedAlbumImage {
  outputName: string;
  sourcePath: string;
  width: number;
  height: number;
  fileId?: string;
  filePath: string;
  url?: string;
  thumbnail?: string;
  tags: string[];
  slot?: WeddingSlot;
  updatedAt?: string;
}

export interface UploadAlbumDependencies {
  client?: ImageKit;
  config?: ImageKitConfig | null;
  readDirectory?: typeof readdir;
  imageProcessor?: typeof preprocessImage;
  writeManifest?: (path: string, content: string) => Promise<void>;
  log?: (message: string) => void;
}

const DEFAULT_MANIFEST_PATH = resolve(process.cwd(), "content/gallery.generated.ts");

function usage(): string {
  return `Usage: npm run album:upload -- <folder> --expected 45 [--replace]

Options:
  --expected <count>  Require exactly this many supported images (recommended: 45)
  --replace           Overwrite existing numbered files and preserve wedding-slot-* tags
  --manifest <path>   Write the generated manifest to this path
  --help              Show this help
`;
}

export function naturalCompare(left: string, right: string): number {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

export const sortNatural = naturalCompare;

export function isSupportedImagePath(filePath: string): boolean {
  return SUPPORTED_IMAGE_EXTENSIONS.has(extname(filePath).toLowerCase());
}

export function parseCliArgs(args: readonly string[]): UploadAlbumCliOptions | null {
  let folder: string | undefined;
  let expected: number | undefined;
  let replace = false;
  let manifestPath = DEFAULT_MANIFEST_PATH;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") return null;
    if (arg === "--replace") {
      replace = true;
      continue;
    }
    if (arg === "--expected") {
      const value = args[++index];
      if (!value || !/^\d+$/.test(value) || Number(value) < 1) {
        throw new Error("--expected must be a positive integer.");
      }
      expected = Number(value);
      continue;
    }
    if (arg.startsWith("--expected=")) {
      const value = arg.slice("--expected=".length);
      if (!/^\d+$/.test(value) || Number(value) < 1) {
        throw new Error("--expected must be a positive integer.");
      }
      expected = Number(value);
      continue;
    }
    if (arg === "--manifest") {
      const value = args[++index];
      if (!value) throw new Error("--manifest requires a file path.");
      manifestPath = resolve(value);
      continue;
    }
    if (arg.startsWith("--manifest=")) {
      const value = arg.slice("--manifest=".length);
      if (!value) throw new Error("--manifest requires a file path.");
      manifestPath = resolve(value);
      continue;
    }
    if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    if (folder) throw new Error("Only one source folder may be provided.");
    folder = arg;
  }

  if (!folder) throw new Error("A source folder is required.\n\n" + usage());
  if (expected === undefined) {
    throw new Error("--expected is required so the album count is verified before upload.");
  }

  return { folder: resolve(folder), expected, replace, manifestPath };
}

export const parseArguments = parseCliArgs;

async function listSourceFiles(folder: string, readDirectory = readdir): Promise<string[]> {
  const entries = await readDirectory(folder, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const path = join(folder, entry.name);
    if (isSupportedImagePath(path)) files.push(path);
  }
  return files.sort((left, right) => naturalCompare(basename(left), basename(right)));
}

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validate, auto-rotate, resize and encode one source image in memory. */
export async function preprocessImage(sourcePath: string): Promise<ProcessedAlbumImage> {
  const fileStats = await stat(sourcePath);
  if (fileStats.size > IMAGEKIT_MAX_UPLOAD_BYTES) {
    throw new Error(
      `${basename(sourcePath)} is ${formatFileSize(fileStats.size)}; the pre-transform input limit is 20 MB.`,
    );
  }

  let metadata: { width?: number; height?: number };
  try {
    metadata = await sharp(sourcePath, { failOn: "error" }).metadata();
  } catch (error) {
    throw new Error(`${basename(sourcePath)} could not be decoded: ${errorMessage(error)}`);
  }

  const pixels = (metadata.width ?? 0) * (metadata.height ?? 0);
  if (!metadata.width || !metadata.height || pixels <= 0) {
    throw new Error(`${basename(sourcePath)} does not contain readable image dimensions.`);
  }
  if (pixels > IMAGEKIT_MAX_PIXELS) {
    throw new Error(
      `${basename(sourcePath)} is ${pixels.toLocaleString()} pixels; the pre-transform limit is 25,000,000 pixels.`,
    );
  }

  try {
    const result = await sharp(sourcePath, { failOn: "error" })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    return {
      sourcePath,
      outputName: "",
      buffer: result.data,
      width: result.info.width,
      height: result.info.height,
    };
  } catch (error) {
    throw new Error(`${basename(sourcePath)} could not be converted to WebP: ${errorMessage(error)}`);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function fileNameFromAsset(asset: ExistingAlbumAsset): string {
  return basename(asset.name || asset.filePath || "");
}

function slotFromTags(tags: readonly string[]): WeddingSlot | undefined {
  for (const tag of tags) {
    const candidate = tag.trim().toLowerCase().replaceAll("_", "-");
    if (!candidate.startsWith("wedding-slot-")) continue;
    const slot = candidate.slice("wedding-slot-".length);
    if ((WEDDING_SLOTS as readonly string[]).includes(slot)) return slot as WeddingSlot;
  }
  return undefined;
}

function weddingSlotTags(tags: readonly string[] | null | undefined): string[] {
  return Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim())
        .filter((tag) => /^wedding-slot-(?:hero|opening|portrait-one|portrait-two|detail-one|detail-two|closing)$/i.test(tag)),
    ),
  );
}

function defaultAlt(index: number, slot?: WeddingSlot): string {
  const labels: Record<WeddingSlot, string> = {
    hero: "ảnh bìa",
    opening: "ảnh mở album",
    "portrait-one": "ảnh chân dung",
    "portrait-two": "ảnh chân dung",
    "detail-one": "ảnh chi tiết",
    "detail-two": "ảnh chi tiết",
    closing: "ảnh kết album",
  };
  return `Ảnh cưới Quốc Huy và Hoài Thương, ${slot ? labels[slot] : `ảnh ${index + 1}`}`;
}

export function buildManifestSource(
  images: readonly UploadedAlbumImage[],
  folder: string,
  expectedCount: number,
  generatedAt = new Date().toISOString(),
): string {
  const manifestImages: AlbumImage[] = images.map((image, index) => ({
    id: image.fileId || image.filePath || image.outputName,
    src: image.url || image.filePath,
    url: image.url,
    path: image.filePath,
    thumbnail: image.thumbnail,
    width: image.width,
    height: image.height,
    alt: defaultAlt(index, image.slot),
    tags: image.tags,
    ...(image.slot ? { slot: image.slot } : {}),
    order: index + 1,
    layout: image.slot ? SLOT_LAYOUTS[image.slot] : "grid",
    source: "imagekit",
    updatedAt: image.updatedAt,
  }));

  const json = JSON.stringify(manifestImages, null, 2);
  return `/* Generated by scripts/upload-album.ts. Do not edit by hand. */\n\nimport type { AlbumImage } from "./wedding";\n\nexport interface GeneratedGalleryManifest {\n  version: 1;\n  generatedAt: string | null;\n  folder: string;\n  expectedCount: number;\n  images: AlbumImage[];\n}\n\nexport const GENERATED_ALBUM: AlbumImage[] = ${json};\n\nexport const GALLERY_MANIFEST: GeneratedGalleryManifest = {\n  version: 1,\n  generatedAt: ${JSON.stringify(generatedAt)},\n  folder: ${JSON.stringify(folder)},\n  expectedCount: ${expectedCount},\n  images: GENERATED_ALBUM,\n};\n\nexport const generatedAlbum = GENERATED_ALBUM;\nexport const galleryGenerated = GALLERY_MANIFEST;\n\nexport default GALLERY_MANIFEST;\n`;
}

async function existingAssets(client: ImageKit, config: ImageKitConfig): Promise<ExistingAlbumAsset[]> {
  const response = await client.assets.list({
    type: "file",
    fileType: "image",
    path: config.folder,
    limit: IMAGEKIT_MAX_ALBUM_IMAGES,
    sort: "ASC_NAME",
  });
  return Array.isArray(response) ? (response as ExistingAlbumAsset[]) : [];
}

function outputName(index: number, total: number): string {
  const width = Math.max(2, String(total).length);
  return `${String(index + 1).padStart(width, "0")}.webp`;
}

export async function runAlbumUpload(
  options: UploadAlbumCliOptions,
  dependencies: UploadAlbumDependencies = {},
): Promise<UploadedAlbumImage[]> {
  const config = dependencies.config === undefined ? getImageKitConfig() : dependencies.config;
  if (!config) {
    throw new Error(
      "ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.",
    );
  }

  const files = await listSourceFiles(options.folder, dependencies.readDirectory);
  if (files.length === 0) throw new Error("No supported image files were found in the source folder.");
  if (files.length > IMAGEKIT_MAX_ALBUM_IMAGES) {
    throw new Error(`Found ${files.length} images; the album limit is ${IMAGEKIT_MAX_ALBUM_IMAGES}.`);
  }
  if (options.expected !== undefined && files.length !== options.expected) {
    throw new Error(`Expected ${options.expected} images but found ${files.length} supported images.`);
  }

  const client = dependencies.client || createImageKitClient(config);
  const existing = await existingAssets(client, config);
  const existingByName = new Map(existing.map((asset) => [fileNameFromAsset(asset), asset]));
  const destinationNames = files.map((_, index) => outputName(index, files.length));

  if (!options.replace) {
    const collisions = destinationNames.filter((name) => existingByName.has(name));
    if (collisions.length) {
      throw new Error(
        `Destination files already exist: ${collisions.join(", ")}. Re-run with --replace to overwrite them.`,
      );
    }
  }

  const process = dependencies.imageProcessor || preprocessImage;
  const uploaded: UploadedAlbumImage[] = [];
  const log = dependencies.log || ((message: string) => console.log(message));

  for (let index = 0; index < files.length; index += 1) {
    const sourcePath = files[index];
    const targetName = destinationNames[index];
    try {
      const processed = await process(sourcePath);
      const previous = existingByName.get(targetName);
      const preservedSlotTags = options.replace ? weddingSlotTags(previous?.tags) : [];
      const tags = Array.from(new Set(["wedding-album", ...preservedSlotTags]));
      const response = await client.files.upload({
        file: await toFile(processed.buffer, targetName, { type: "image/webp" }),
        fileName: targetName,
        folder: config.folder,
        tags,
        useUniqueFileName: false,
        overwriteFile: options.replace,
        overwriteTags: options.replace,
        transformation: { pre: IMAGEKIT_UPLOAD_TRANSFORMATION },
        responseFields: ["tags"],
      });
      const path = response.filePath || `${config.folder}${targetName}`;
      uploaded.push({
        outputName: targetName,
        sourcePath,
        width: response.width || processed.width,
        height: response.height || processed.height,
        fileId: response.fileId,
        filePath: path,
        url: response.url || getImageKitUrl(path, {}, config),
        thumbnail: response.thumbnailUrl,
        tags: response.tags?.length ? response.tags : tags,
        slot: slotFromTags(response.tags?.length ? response.tags : tags),
        updatedAt: new Date().toISOString(),
      });
      log(`${index + 1}/${files.length}  ${basename(sourcePath)} → ${targetName}`);
    } catch (error) {
      throw new Error(`Upload failed for ${basename(sourcePath)} → ${targetName}: ${errorMessage(error)}`);
    }
  }

  const manifest = buildManifestSource(uploaded, config.folder, options.expected ?? files.length);
  const writeManifest =
    dependencies.writeManifest || (async (path: string, content: string) => {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(path, content, "utf8");
    });
  await writeManifest(options.manifestPath, manifest);
  return uploaded;
}

async function main(): Promise<void> {
  try {
    const options = parseCliArgs(process.argv.slice(2));
    if (!options) {
      console.log(usage());
      return;
    }
    await runAlbumUpload(options);
  } catch (error) {
    console.error(`\nAlbum upload stopped: ${errorMessage(error)}`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  void main();
}
