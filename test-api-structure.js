// Simple test to verify API structure
console.log('Checking API structure...\n');

const fs = require('fs');
const path = require('path');

const apiStructure = {
  'api/leads/route.ts': 'Leads API',
  'api/content/route.ts': 'Content API',
  'api/amocrm/pipelines/route.ts': 'AmoCRM Pipelines API',
  'lib/db.ts': 'Database utilities',
  'lib/amocrm.ts': 'AmoCRM integration',
  'client/src/lib/api.ts': 'Frontend API client',
  'vercel.json': 'Vercel configuration',
  'tsconfig.api.json': 'API TypeScript config',
  'env.example': 'Environment variables template'
};

let allGood = true;

for (const [file, description] of Object.entries(apiStructure)) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${description}: ${file}`);
  } else {
    console.log(`❌ ${description}: ${file} - MISSING`);
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All files are present! API structure is ready.');
  console.log('\nNext steps:');
  console.log('1. Set up PostgreSQL database (Neon, Supabase, etc.)');
  console.log('2. Configure AmoCRM credentials');
  console.log('3. Deploy to Vercel');
  console.log('4. Test lead submission');
} else {
  console.log('❌ Some files are missing. Please check above.');
}

console.log('\nEnvironment variables needed:');
console.log('- DATABASE_URL: PostgreSQL connection string');
console.log('- AMOCRM_SUBDOMAIN: Your AmoCRM subdomain');
console.log('- AMOCRM_ACCESS_TOKEN: AmoCRM API access token');
console.log('- ADMIN_TOKEN: Simple token for admin access (optional)');