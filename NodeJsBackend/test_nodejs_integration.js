#!/usr/bin/env node
/**
 * Node.js + FastAPI Integration Test Script
 */

const axios = require('axios');

// Configuration
const NODEJS_URL = 'http://localhost:3000';
const FASTAPI_URL = 'http://127.0.0.1:8000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testNodeJSHealth() {
  log('\n🔍 Testing Node.js Backend Health...', 'blue');
  
  try {
    const response = await axios.get(`${NODEJS_URL}/`, { timeout: 5000 });
    log(`   ✅ Node.js Basic Health: ${response.status} - ${response.data}`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ Node.js Health Check Failed: ${error.message}`, 'red');
    return false;
  }
}

async function testFastAPIHealth() {
  log('\n🔍 Testing FastAPI Backend Health...', 'blue');
  
  try {
    const response = await axios.get(`${FASTAPI_URL}/health`, { timeout: 5000 });
    log(`   ✅ FastAPI Basic Health: ${response.status} - ${JSON.stringify(response.data)}`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ FastAPI Health Check Failed: ${error.message}`, 'red');
    return false;
  }
}

async function testNodeJSFastAPIIntegration() {
  log('\n🔍 Testing Node.js + FastAPI Integration...', 'blue');
  
  try {
    const response = await axios.get(`${NODEJS_URL}/api/health/fastapi`, { timeout: 10000 });
    log(`   ✅ Integration Health: ${response.status}`, 'green');
    log(`   📊 Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
    return true;
  } catch (error) {
    log(`   ❌ Integration Health Check Failed: ${error.message}`, 'red');
    return false;
  }
}

async function testDetailedHealth() {
  log('\n🔍 Testing Detailed Health Check...', 'blue');
  
  try {
    const response = await axios.get(`${NODEJS_URL}/api/health/detailed`, { timeout: 10000 });
    log(`   ✅ Detailed Health: ${response.status}`, 'green');
    log(`   📊 Services Status:`, 'yellow');
    
    const services = response.data.services;
    if (services.nodejs) {
      log(`      Node.js: ${services.nodejs.status} (Port: ${services.nodejs.port})`, 'green');
    }
    if (services.fastapi) {
      log(`      FastAPI: ${services.fastapi.healthy ? 'healthy' : 'unhealthy'}`, 
          services.fastapi.healthy ? 'green' : 'red');
      if (services.fastapi.backend_info) {
        log(`      Backend URL: ${services.fastapi.backend_info.baseUrl}`, 'yellow');
        log(`      Is FastAPI: ${services.fastapi.backend_info.isFastAPI}`, 'yellow');
      }
    }
    
    return true;
  } catch (error) {
    log(`   ❌ Detailed Health Check Failed: ${error.message}`, 'red');
    return false;
  }
}

async function testFastAPIEndpoints() {
  log('\n🔍 Testing FastAPI Endpoints from Node.js...', 'blue');
  
  try {
    // Test FastAPI grading health
    const gradingHealth = await axios.get(`${FASTAPI_URL}/api/v1/grading/health`, { timeout: 5000 });
    log(`   ✅ FastAPI Grading Health: ${gradingHealth.status}`, 'green');
    
    // Test FastAPI status
    const status = await axios.get(`${FASTAPI_URL}/api/v1/grading/status`, { timeout: 5000 });
    log(`   ✅ FastAPI Status: ${status.status}`, 'green');
    
    return true;
  } catch (error) {
    log(`   ❌ FastAPI Endpoints Test Failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCORSConfiguration() {
  log('\n🔍 Testing CORS Configuration...', 'blue');
  
  try {
    // Test CORS preflight request
    const response = await axios.options(`${FASTAPI_URL}/api/v1/grading/grade-answer`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 5000
    });
    
    log(`   ✅ CORS Preflight: ${response.status}`, 'green');
    
    // Check CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    };
    
    log(`   📊 CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`, 'yellow');
    
    return true;
  } catch (error) {
    log(`   ❌ CORS Test Failed: ${error.message}`, 'red');
    return false;
  }
}

async function testBackendConnectivity() {
  log('\n🔍 Testing Backend Connectivity...', 'blue');
  
  try {
    // Test if Node.js can reach FastAPI
    const nodejsResponse = await axios.get(`${NODEJS_URL}/api/health/fastapi`, { timeout: 10000 });
    
    if (nodejsResponse.data.fastapi && nodejsResponse.data.fastapi.healthy) {
      log(`   ✅ Node.js → FastAPI: Connected`, 'green');
      return true;
    } else {
      log(`   ❌ Node.js → FastAPI: Connection Failed`, 'red');
      log(`   📊 FastAPI Status: ${JSON.stringify(nodejsResponse.data.fastapi, null, 2)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`   ❌ Backend Connectivity Test Failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🧪 Node.js + FastAPI Integration Test Suite', 'bold');
  log('=' * 50, 'blue');
  
  const tests = [
    { name: 'Node.js Health', fn: testNodeJSHealth },
    { name: 'FastAPI Health', fn: testFastAPIHealth },
    { name: 'Integration Health', fn: testNodeJSFastAPIIntegration },
    { name: 'Detailed Health', fn: testDetailedHealth },
    { name: 'FastAPI Endpoints', fn: testFastAPIEndpoints },
    { name: 'CORS Configuration', fn: testCORSConfiguration },
    { name: 'Backend Connectivity', fn: testBackendConnectivity }
  ];
  
  let passed = 0;
  const total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      }
    } catch (error) {
      log(`   ❌ ${test.name} threw an error: ${error.message}`, 'red');
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  log('\n' + '=' * 50, 'blue');
  log(`📊 Test Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('🎉 All tests passed! Integration is working perfectly.', 'green');
    log('\n📝 Next steps:', 'blue');
    log('   1. Test the complete grading workflow', 'yellow');
    log('   2. Test Excel generation', 'yellow');
    log('   3. Deploy both services', 'yellow');
  } else {
    log('⚠️  Some tests failed. Check the services and configuration.', 'red');
    log('\n🔧 Troubleshooting:', 'blue');
    log('   1. Ensure both services are running:', 'yellow');
    log('      - Node.js: npm start (in NodeJsBackend/)', 'yellow');
    log('      - FastAPI: python run.py (in fastapi/)', 'yellow');
    log('   2. Check environment variables', 'yellow');
    log('   3. Verify CORS configuration', 'yellow');
    log('   4. Check network connectivity', 'yellow');
  }
  
  return passed === total;
}

// Run the tests
if (require.main === module) {
  main()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      log(`❌ Test suite failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { main };
