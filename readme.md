<p align="center">
    <a href="https://quco.s4shibam.com">
        <img alt="Quco" width="100" src="./.readme/logo.png">
    </a>
</p>

<div align="center">
    <h1>Quco AI</h1>
    <p>Turn natural language into shell commands using AI</p>
</div>

<p align="center">
    <img src="https://img.shields.io/github/languages/code-size/s4shibam/quco-ai?style=flat-square" alt="Code Size">
    <img src="https://img.shields.io/github/license/s4shibam/quco-ai?style=flat-square" alt="License">
    <img src="https://img.shields.io/github/stars/s4shibam/quco-ai?style=flat-square&logo=github" alt="Stars">
</p>

<br />

## ⚡ Introduction

Quco converts natural language into executable shell commands using AI, right from your terminal. With support for multiple providers, built-in safety validation, and seamless shell integration. It’s like having a command-line memory on demand.

## ✨ Features

- 🚀 **Simple CLI** - Just type `quco <your request>` and get a shell command
- 🧠 **Multiple AI Providers** - Support for OpenAI, Anthropic, and Google models
- 🔒 **Safety First** - Never auto-executes commands; validates against destructive patterns
- 📋 **Clipboard Integration** - Auto-copies commands to clipboard
- ⌨️ **Autofill** - Optional zsh/bash autofill to load commands into shell buffer
- 📜 **Command History** - Automatically saves all prompts, responses, and errors for easy reference

## ⚙️ Tech Stack

- **Language** - TypeScript
- **AI** - Vercel AI SDK, Anthropic, Google, OpenAI
- **Runtime** - Node.js (>= 18.0.0)
- **CLI Tools** - Commander, Inquirer, Chalk, Ora

## 📦 Installation

```bash
npm install -g quco
```

After installation, run the setup:

```bash
quco --setup
```

This will guide you through selecting an AI model provider and entering your API key.

**Requirements:**

- macOS
- zsh or bash shell
- Node.js >= 18.0.0

## 🚀 Quick Start

After setup, restart your terminal or run:

```bash
source ~/.zshrc  # or ~/.bashrc
```

Then start generating commands:

```bash
# List all JavaScript files
quco list all javascript files in current directory

# Find files modified in last week
quco find files modified in last 7 days

# Process management
quco show all node processes

# Download youtube video
quco "download youtube video https://youtu.be/AbCd"
```

**Important:** If your prompt contains special characters like `?`, `*`, `&`, `|`, or URLs, wrap it in quotes to prevent your shell from interpreting them.

## Commands

| Command | Description |
|---------|-------------|
| `--setup` | Interactive setup and configuration.<br/>Stores credentials in your shell rc file (.zshrc or .bashrc). |
| `<prompt>` | Generate a shell command from natural language.<br/>The command is printed to stdout and copied to clipboard using pbcopy. |
| `--version` | Display version information. |
| `--config` | Show current configuration (model, provider, settings). |
| `--autofill-on` | Enable autofill for zsh or bash.<br/>This loads generated commands into your shell's edit buffer for review. |
| `--autofill-off` | Disable autofill and remove the shell function from your configuration. |

## 📚 Notes

### Command History

Quco automatically maintains a history of all command generations in `~/.quco/history.json`. The history includes timestamps, prompts, generated commands, and any errors. History is limited to the last 100 entries to prevent excessive disk usage.

### Configuration Backups

Quco automatically creates backups of your shell configuration file (`~/.zshrc` or `~/.bashrc`) whenever it makes modifications during setup or autofill operations. The 3 most recent backups are kept as `~/.zshrc.quco-backup-<timestamp>`.

## 📺 Demo

<video src="https://github.com/user-attachments/assets/1d3da9e4-44d8-41d3-92da-373f2996bd69" controls muted poster=".readme/main.webp"></video>

> **Note**: If the video doesn't load, **[▶️ click here to watch the demo](https://github.com/user-attachments/assets/1d3da9e4-44d8-41d3-92da-373f2996bd69)**

## 👋🏻 Contact

[![Linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/s4shibam)
[![Twitter](https://img.shields.io/badge/Twitter-00ACEE?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/s4shibam)
