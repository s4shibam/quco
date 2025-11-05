#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Postinstall script for quco
 *
 * This script runs after npm install and provides information about setup.
 * It does NOT automatically modify shell rc files or store secrets.
 * Users must explicitly run `quco --setup` for configuration.
 */

const chalk = require('chalk');

// Check if this is a global install
const isGlobalInstall = process.env.npm_config_global === 'true';

if (isGlobalInstall) {
  console.log(chalk.bold('\n🎉 Quco installed successfully!\n'));
  console.log('To get started, run the setup command:\n');
  console.log(chalk.cyan('  quco --setup\n'));
  console.log('This will guide you through:');
  console.log('  • Selecting an AI model provider');
  console.log('  • Entering your API key');
  console.log('  • Configuring optional features\n');
  console.log(chalk.dim('For more information, run: quco\n'));
} else {
  // Local install - just inform about development setup
  console.log(chalk.dim('\nQuco installed locally.'));
  console.log(chalk.dim('For global usage, run: npm install -g quco\n'));
}
