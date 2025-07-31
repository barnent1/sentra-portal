#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// Required environment variables by environment
const requiredVars = {
  common: [
    'NODE_ENV',
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ],
  development: [
    // Additional development-specific variables
  ],
  production: [
    'REDIS_URL',
    'API_KEY_SALT',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'CSRF_SECRET',
    'EMAIL_FROM',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
  ],
  test: [
    // Test-specific variables
  ],
};

// Optional but recommended variables
const recommendedVars = [
  'SENTRY_DSN',
  'RATE_LIMIT_WINDOW',
  'RATE_LIMIT_MAX_REQUESTS',
  'CORS_ALLOWED_ORIGINS',
];

// Validate environment variables
function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const errors = [];
  const warnings = [];

  console.log(`\n🔍 Validating environment variables for ${env} environment...\n`);

  // Check common required variables
  requiredVars.common.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(`❌ Missing required variable: ${varName}`);
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });

  // Check environment-specific required variables
  if (requiredVars[env]) {
    requiredVars[env].forEach((varName) => {
      if (!process.env[varName]) {
        errors.push(`❌ Missing required variable: ${varName}`);
      } else {
        console.log(`✅ ${varName} is set`);
      }
    });
  }

  // Check recommended variables
  recommendedVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`⚠️  Missing recommended variable: ${varName}`);
    }
  });

  // Validate specific variable formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    warnings.push('⚠️  DATABASE_URL should start with postgresql://');
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push('❌ NEXTAUTH_SECRET should be at least 32 characters long');
  }

  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    errors.push('❌ PORT must be a valid number');
  }

  // Print results
  console.log('\n📊 Validation Results:\n');

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach((error) => console.log(error));
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach((warning) => console.log(warning));
  }

  if (errors.length === 0) {
    console.log('✅ All required environment variables are properly set!\n');
    return 0;
  } else {
    console.log(`\n❌ Found ${errors.length} error(s) in environment configuration.\n`);
    return 1;
  }
}

// Generate .env file from .env.example
function generateEnvFile() {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envPath = path.join(__dirname, '..', '.env.local');

  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Skipping generation.');
    return;
  }

  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example not found!');
    return;
  }

  console.log('📝 Generating .env.local from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env.local created! Please update it with your values.\n');
}

// Main execution
const command = process.argv[2];

if (command === 'generate') {
  generateEnvFile();
} else {
  const exitCode = validateEnv();
  process.exit(exitCode);
}