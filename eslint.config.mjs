import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "public/images/demo/**", "test-results/**", "playwright-report/**"],
  },
];

export default config;
