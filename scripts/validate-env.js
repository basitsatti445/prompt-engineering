#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are set correctly
 */

const { validateConfig, app, database, auth } = require('../lib/config');

console.log('🔍 Validating environment configuration...\n');

try {
  // Validate configuration
  validateConfig();
  console.log('✅ Configuration validation passed\n');

  // Display current configuration (without sensitive data)
  console.log('📋 Current Configuration:');
  console.log('─'.repeat(50));
  console.log(`Environment: ${app.environment}`);
  console.log(`App Name: ${app.name}`);
  console.log(`App Version: ${app.version}`);
  console.log(`Debug Mode: ${app.debug}`);
  console.log(`Database URI: ${database.uri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`JWT Expires In: ${auth.jwt.expiresIn}`);
  console.log(`JWT Algorithm: ${auth.jwt.algorithm}`);
  console.log(`BCrypt Rounds: ${auth.bcrypt.rounds}`);
  console.log('─'.repeat(50));

  // Check for common issues
  console.log('\n🔧 Configuration Checks:');
  
  // Check JWT secret strength
  if (auth.jwt.secret.length < 32) {
    console.log('⚠️  Warning: JWT_SECRET is less than 32 characters');
  } else {
    console.log('✅ JWT_SECRET length is adequate');
  }

  // Check if using default JWT secret
  if (auth.jwt.secret === 'your-secret-key-change-in-production') {
    console.log('❌ Error: Using default JWT_SECRET - change this in production!');
    process.exit(1);
  } else {
    console.log('✅ JWT_SECRET is customized');
  }

  // Check database connection string format
  if (database.uri.startsWith('mongodb://') || database.uri.startsWith('mongodb+srv://')) {
    console.log('✅ Database URI format is correct');
  } else {
    console.log('❌ Error: Invalid database URI format');
    process.exit(1);
  }

  // Check environment-specific settings
  if (app.environment === 'production') {
    console.log('\n🚀 Production Environment Checks:');
    
    if (app.debug) {
      console.log('⚠️  Warning: Debug mode is enabled in production');
    } else {
      console.log('✅ Debug mode is disabled in production');
    }

    if (auth.jwt.secret.length < 32) {
      console.log('❌ Error: JWT_SECRET must be at least 32 characters in production');
      process.exit(1);
    }

    if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL === '*') {
      console.log('⚠️  Warning: FRONTEND_URL should be set to your domain in production');
    } else {
      console.log('✅ FRONTEND_URL is configured');
    }
  }

  console.log('\n🎉 Environment validation completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Start your application: npm run dev');
  console.log('   2. Check the application logs for any runtime issues');
  console.log('   3. Test the API endpoints to ensure everything works');

} catch (error) {
  console.error('\n❌ Environment validation failed:');
  console.error(`   ${error.message}`);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Check that all required environment variables are set');
  console.log('   2. Verify the format of your environment variables');
  console.log('   3. Make sure your .env.local file is in the project root');
  console.log('   4. Check the ENVIRONMENT_SETUP.md file for guidance');
  process.exit(1);
}
