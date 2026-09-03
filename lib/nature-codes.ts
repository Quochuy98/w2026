/**
 * Curated list of beautiful, elegant English names of flowers, birds, fish, and trees/plants
 * for generating unique, aesthetic wedding guest invitation codes.
 */
export const NATURE_NAMES = {
  // Flowers
  flowers: [
    "rose",
    "lotus",
    "lily",
    "orchid",
    "jasmine",
    "tulip",
    "sunflower",
    "daisy",
    "lavender",
    "hydrangea",
    "peony",
    "violet",
    "camellia",
    "magnolia",
    "iris",
    "dahlia",
    "hibiscus",
    "sakura",
    "poppy",
    "marigold",
    "carnation",
    "blossom",
    "gardenia",
    "azalea",
    "freesia",
    "anemone",
  ],

  // Birds
  birds: [
    "swan",
    "dove",
    "phoenix",
    "nightingale",
    "robin",
    "sparrow",
    "seagull",
    "swallow",
    "canary",
    "peacock",
    "hummingbird",
    "albatross",
    "cardinal",
    "flamingo",
    "bluejay",
    "starling",
    "kingfisher",
    "falcon",
    "wren",
    "finch",
  ],

  // Fish & Marine
  fish: [
    "koi",
    "dolphin",
    "whale",
    "goldfish",
    "clownfish",
    "seahorse",
    "marlin",
    "angelfish",
    "guppy",
    "betta",
    "salmon",
    "swordfish",
    "tetra",
    "starfish",
    "sunfish",
    "bluefin",
    "manta",
    "nautilus",
  ],

  // Trees & Plants
  plants: [
    "pine",
    "bamboo",
    "cedar",
    "maple",
    "willow",
    "oak",
    "cypress",
    "bonsai",
    "clover",
    "fern",
    "eucalyptus",
    "olive",
    "redwood",
    "ivy",
    "palm",
    "birch",
    "juniper",
    "sage",
    "laurel",
    "elm",
  ],
};

/**
 * All English nature code names combined (80+ unique aesthetic words)
 */
export const ALL_NATURE_CODES: string[] = [
  ...NATURE_NAMES.flowers,
  ...NATURE_NAMES.birds,
  ...NATURE_NAMES.fish,
  ...NATURE_NAMES.plants,
];

/**
 * Generates a random English nature code (flower, bird, fish, plant/tree).
 * @param withSuffix Optional 2-digit number suffix (e.g. "swan-26")
 */
export function getRandomNatureCode(withSuffix = false): string {
  const randomIndex = Math.floor(Math.random() * ALL_NATURE_CODES.length);
  const baseCode = ALL_NATURE_CODES[randomIndex];

  if (withSuffix) {
    const suffix = Math.floor(10 + Math.random() * 90);
    return `${baseCode}-${suffix}`;
  }

  return baseCode;
}
