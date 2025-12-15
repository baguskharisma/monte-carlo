import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: './docs/api-documentation.yaml',
  output: {
    format: 'prettier',
    path: './src/generated/api',
  },
  types: {
    enums: 'javascript',
    dates: true,
  },
  services: {
    asClass: false,
  },
});
