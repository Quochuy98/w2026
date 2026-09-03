/**
 * Server-side ImageKit SDK boundary.
 *
 * Keep this import out of `config.ts`: browser admin components consume the
 * public upload constants from that module, and the Node SDK must never be
 * pulled into their client bundle.
 */

import ImageKit from "@imagekit/nodejs";
import { requireImageKitConfig, type ImageKitConfig } from "./config";

export function createImageKitClient(config: ImageKitConfig = requireImageKitConfig()): ImageKit {
  return new ImageKit({ privateKey: config.privateKey });
}

