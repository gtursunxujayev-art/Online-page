// Test script to check which server is running
const http = require('http');

const servers = [
  { port: 5000, name: 'Production Server (with AmoCRM)' },
  { port: 3001, name: 'Development Server (mock)' },
  { port: 3000, name: 'Client Server' }
];

console.log('=== Checking which servers are running ===\n');

servers.forEach(({ port, name }) => {
  const req = http.request({
    hostname: 'localhost',
    port: port,
    path: '/api/health',
    method: 'GET',
    timeout: 2000
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`✅ ${name} is running on port ${port}`);
        console.log(`   Response: ${JSON.stringify(json)}`);
      } catch {
        console.log(`✅ ${name} is running on port ${port} (non-JSON response)`);
      }
    });
  });
  
  req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.log(`❌ ${name} is NOT running on port ${port}`);
    } else {
      console.log(`❌ ${name} port ${port} error: ${err.message}`);
    }
  });
  
  req.on('timeout', () => {
    console.log(`⏱️ ${name} port ${port} request timeout (server might be busy)`);
    req.destroy();
  });
  
  req.end();
});

console.log('\n=== Instructions ===');
console.log('1. To run Production Server (with AmoCRM):');
console.log('   - Set NODE_ENV=development or NODE_ENV=production');
console.log('   - Run: node server/index.ts');
console.log('   - OR: npx tsx server/index.ts');
console.log('   - Server will run on port 5000');
console.log('\n2. To run Development Server (mock, NO AmoCRM):');
console.log('   - Run: npm run dev:api');
console.log('   - Server runs on port 3001');
console.log('\n3. Check environment variables:');
console.log('   - AMOCRM_SUBDOMAIN should be set');
console.log('   - AMOCRM_ACCESS_TOKEN should be set');
console.log('\n4. Test AmoCRM endpoint:');
console.log('   - Visit: http://localhost:5000/api/debug/amocrm');