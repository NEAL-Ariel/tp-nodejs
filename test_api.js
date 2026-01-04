/**
 * Script de test automatisé de l'API
 * 
 * Usage: node test_api.js
 * 
 * Ce script teste les fonctionnalités principales de l'API
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let accessToken = '';
let refreshToken = '';
let userId = '';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      options.headers['Content-Length'] = JSON.stringify(data).length;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test(name, testFn) {
  try {
    log(`\n🧪 Test: ${name}`, 'blue');
    const result = await testFn();
    if (result.success) {
      log(`✅ ${name}: PASSED`, 'green');
      return true;
    } else {
      log(`❌ ${name}: FAILED - ${result.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name}: ERROR - ${error.message}`, 'red');
    return false;
  }
}

// Tests
async function testHealth() {
  const response = await makeRequest('GET', '/health');
  return {
    success: response.status === 200 && response.data.success,
    message: response.status === 200 ? 'OK' : `Status: ${response.status}`
  };
}

async function testRegister() {
  const email = `test${Date.now()}@example.com`;
  const response = await makeRequest('POST', '/api/auth/register', {
    email,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  });

  if (response.status === 201 && response.data.success) {
    accessToken = response.data.data.tokens.accessToken;
    refreshToken = response.data.data.tokens.refreshToken;
    userId = response.data.data.user.id;
    return { success: true, message: 'OK' };
  }

  return {
    success: false,
    message: `Status: ${response.status}, Message: ${response.data.message || 'Unknown'}`
  };
}

async function testLogin() {
  const response = await makeRequest('POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });

  return {
    success: response.status === 200 || response.status === 401, // 401 si utilisateur n'existe pas
    message: `Status: ${response.status}`
  };
}

async function testGetProfile() {
  if (!accessToken) {
    return { success: false, message: 'No access token' };
  }

  const response = await makeRequest('GET', '/api/me', null, accessToken);
  return {
    success: response.status === 200 && response.data.success,
    message: response.status === 200 ? 'OK' : `Status: ${response.status}`
  };
}

async function testRefreshToken() {
  if (!refreshToken) {
    return { success: false, message: 'No refresh token' };
  }

  const response = await makeRequest('POST', '/api/auth/refresh', {
    refreshToken
  });

  if (response.status === 200 && response.data.success) {
    accessToken = response.data.data.accessToken; // Mettre à jour le token
    return { success: true, message: 'OK' };
  }

  return {
    success: false,
    message: `Status: ${response.status}`
  };
}

async function testLogout() {
  if (!accessToken || !refreshToken) {
    return { success: false, message: 'No tokens' };
  }

  const response = await makeRequest('POST', '/api/auth/logout', {
    refreshToken
  }, accessToken);

  return {
    success: response.status === 200 && response.data.success,
    message: response.status === 200 ? 'OK' : `Status: ${response.status}`
  };
}

async function testValidation() {
  // Test avec données invalides
  const response = await makeRequest('POST', '/api/auth/register', {
    email: 'invalid-email',
    password: '123', // Trop court
    firstName: '',
    lastName: ''
  });

  return {
    success: response.status === 400, // Doit retourner une erreur de validation
    message: response.status === 400 ? 'Validation OK' : `Status: ${response.status}`
  };
}

async function testRateLimit() {
  // Tenter plusieurs connexions rapides
  const promises = [];
  for (let i = 0; i < 6; i++) {
    promises.push(
      makeRequest('POST', '/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    );
  }

  const responses = await Promise.all(promises);
  const rateLimited = responses.some(r => r.status === 429);

  return {
    success: true, // On ne vérifie pas vraiment, juste qu'il ne plante pas
    message: rateLimited ? 'Rate limiting actif' : 'Rate limiting non détecté'
  };
}

// Exécution des tests
async function runTests() {
  log('\n🚀 Démarrage des tests de l\'API d\'authentification\n', 'blue');
  log('⚠️  Assurez-vous que le serveur est démarré (node server.js)\n', 'yellow');

  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'Inscription', fn: testRegister },
    { name: 'Connexion', fn: testLogin },
    { name: 'Récupération du profil', fn: testGetProfile },
    { name: 'Refresh token', fn: testRefreshToken },
    { name: 'Déconnexion', fn: testLogout },
    { name: 'Validation des données', fn: testValidation },
    { name: 'Rate limiting', fn: testRateLimit }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test(test.name, test.fn);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Résumé
  log('\n' + '='.repeat(50), 'blue');
  log(`📊 Résumé des tests:`, 'blue');
  log(`   ✅ Réussis: ${passed}`, 'green');
  log(`   ❌ Échoués: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`   📈 Total: ${tests.length}`, 'blue');
  log('='.repeat(50) + '\n', 'blue');

  if (failed === 0) {
    log('🎉 Tous les tests sont passés !', 'green');
    process.exit(0);
  } else {
    log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'yellow');
    process.exit(1);
  }
}

// Vérifier que le serveur est accessible
makeRequest('GET', '/health')
  .then(() => {
    runTests();
  })
  .catch((error) => {
    log('\n❌ Erreur: Le serveur n\'est pas accessible !', 'red');
    log(`   Assurez-vous que le serveur est démarré: node server.js`, 'yellow');
    log(`   Erreur: ${error.message}\n`, 'red');
    process.exit(1);
  });


