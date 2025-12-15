#!/usr/bin/env node

/**
 * Generate TypeScript types from OpenAPI spec
 *
 * Usage:
 *   npm run generate:api
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const OPENAPI_FILE = path.join(__dirname, '../docs/api-documentation.yaml');
const OUTPUT_DIR = path.join(__dirname, '../src/generated');

console.log('🚀 Generating API types from OpenAPI spec...\n');

// Check if OpenAPI file exists
if (!fs.existsSync(OPENAPI_FILE)) {
  console.error('❌ OpenAPI spec file not found:', OPENAPI_FILE);
  process.exit(1);
}

// Create output directory if not exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Run openapi-typescript
const command = `npx openapi-typescript ${OPENAPI_FILE} -o ${OUTPUT_DIR}/api.ts --alphabetize`;

console.log('📝 Running:', command, '\n');

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error generating types:', error.message);
    process.exit(1);
  }

  if (stderr) {
    console.error('⚠️  Warnings:', stderr);
  }

  if (stdout) {
    console.log(stdout);
  }

  console.log('\n✅ API types generated successfully!');
  console.log('📁 Output:', path.join(OUTPUT_DIR, 'api.ts'));
  console.log('\n💡 Import types with:');
  console.log("   import type { components } from '@/generated/api';\n");
});
