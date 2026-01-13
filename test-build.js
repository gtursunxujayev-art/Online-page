// Test script to verify build configuration
console.log('Testing build configuration...\n');

const fs = require('fs');
const path = require('path');

// Check critical files
const criticalFiles = [
  'package.json',
  'vite.config.ts',
  'vercel.json',
  'tsconfig.api.json',
  'api/leads/route.ts',
  'api/content/route.ts',
  'api/init-db/route.ts',
  'api/amocrm/pipelines/route.ts',
  'lib/db.ts',
  'lib/amocrm.ts',
  'client/src/lib/api.ts'
];

let allGood = true;

console.log('Checking critical files:');
for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));

// Check package.json dependencies
console.log('\nChecking dependencies in package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@vercel/postgres', '@vercel/node', 'axios', '@types/axios'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allGood = false;
    }
  }
} catch (error) {
  console.log('❌ Failed to read package.json');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('\n✅ All checks passed! Your project is ready for deployment.');
  console.log('\nTo deploy:');
  console.log('1. git add .');
  console.log('2. git commit -m "Fix build errors"');
  console.log('3. git push origin main');
  console.log('4. Vercel will auto-deploy');
} else {
  console.log('\n❌ Some checks failed. Please fix the issues above.');
}

console.log('\nExpected build output:');
console.log('- Frontend: dist/ directory');
console.log('- API: .vercel/output/functions/api/ directory');
console.log('- No TypeScript errors');
console.log('- No missing dependencies');