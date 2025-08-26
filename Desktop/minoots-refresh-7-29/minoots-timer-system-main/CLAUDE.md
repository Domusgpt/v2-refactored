# MINOOTS Smart Timer System

## 🎯 Project Overview
**MINOOTS** is a production-ready Timer-as-a-Service platform with AI-powered command execution for developers, AI agents, and enterprise workflows.

**Current Status**: ACTIVE DEVELOPMENT - Phase 1+2 Integration Complete, User Validation Phase

## 🏗️ Tech Stack

### Core Architecture
- **Backend**: Firebase Functions (Node.js 20) + Firestore
- **Security**: Phase 1 Security Hardening (command validation, rate limiting, audit logging)
- **Distribution**: Phase 2 Distributed Architecture (job queues, circuit breakers, tool registry)
- **AI Integration**: Google Gemini 1.5 Flash for smart command assistance
- **Communication**: Model Context Protocol (MCP) server for AI agent integration

### Key Components
- **Firebase Functions**: REST API and scheduled processors (`functions/`)
- **Smart Command Agent**: AI-powered local command execution (`smart-command-agent.js`)
- **MCP Server**: 12 tools for timer management and agent coordination (`mcp/`)
- **Phase 1+2 Integration**: Security + distributed systems (`functions/integrations/`)

## 📁 Project Structure

```
/minoots-timer-system-main/
├── CLAUDE.md                    ← This file (project context)
├── MASTER_PLAN.md              ← Current execution plan
├── smart-command-agent.js      ← AI-powered command execution agent
├── functions/                  ← Firebase Functions backend
│   ├── index.js               ← Main API server
│   ├── integrations/          ← Phase 1+2 systems
│   ├── middleware/            ← Auth, rate limiting
│   └── utils/                 ← Helper functions
├── mcp/                       ← Model Context Protocol server
│   ├── index.js              ← MCP server implementation
│   └── package.json          ← MCP dependencies
└── docs/                     ← User-facing documentation (TO CREATE)
```

## 🚀 Development Commands

### Core Operations
```bash
# Start smart command agent locally
npm run start:smart

# Start MCP server for Claude integration  
npm run start:mcp

# Deploy Firebase backend
firebase deploy --only functions

# Test API health
curl https://api-m3waemr5lq-uc.a.run.app/health
```

### Development Workflow
```bash
# Development mode with auto-reload
npm run dev:smart

# Test integration end-to-end
npm run test:smart

# Deploy specific functions
firebase deploy --only functions:api
```

## 🔑 Environment Configuration

### Required Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `FIREBASE_PROJECT_ID`: Firebase project ID (minoots-timer-system)

### Testing Credentials
- **API Base**: `https://api-m3waemr5lq-uc.a.run.app`
- **Testing API Key**: `mnt_d5edd4b51de08b4a33ff730e7e061a34bb7a8d791a89f18fd1eb849a88f8da01`
- **Testing Tier**: Unlimited requests and concurrent timers

## 🎯 Current Development Focus

### ACTIVE WORK: User Validation Phase
**Goal**: Validate that new users can successfully use MINOOTS without prior context

**Current Blockers**:
1. Missing external API documentation for new users
2. Need to test with fresh AI agents (no internal context)
3. Command injection flow needs end-to-end validation

### Recently Completed
- ✅ Smart command agent with Gemini AI integration
- ✅ Extended MCP server with 12 timer management tools  
- ✅ Testing tier with unlimited access for development
- ✅ Phase 1+2 Firebase integration deployed and working

## 🧪 Testing Strategy

### Fresh Agent Testing Protocol
1. **Setup**: Create clean environment outside project directory
2. **Documentation**: Provide only external user documentation
3. **Scenarios**: Basic setup, command execution, AI assistance, error recovery
4. **Metrics**: Time to success, error rates, confusion points

### Success Criteria
- Fresh agent completes setup in <10 minutes
- Command execution works end-to-end
- AI assistance provides helpful guidance
- <3 critical blocking issues identified

## 🔐 Security & Safety

### Multi-Layer Protection
- **Phase 1 Security**: Command validation, input sanitization, rate limiting
- **AI Safety Checks**: Gemini-powered dangerous command detection
- **Execution Sandboxing**: Isolated command execution environments
- **Audit Logging**: Complete activity tracking via Firestore

### Development Safety
- **Testing Tier**: Safe unlimited access for development
- **Smart Agent**: AI assistance for error recovery and optimization
- **Circuit Breakers**: Automatic failure detection and recovery

## 📋 Code Style & Standards

### TypeScript/JavaScript
- Use ES modules (import/export), not CommonJS (require)
- Destructure imports when possible: `import { tool } from 'toolkit'`
- Prefer arrow functions for simple operations
- Use async/await over Promises

### API Development  
- All endpoints return consistent JSON structure: `{ success, data/error, timestamp }`
- Include proper HTTP status codes and error messages
- Log all operations for debugging and audit
- Validate all inputs before processing

### Documentation
- Update CLAUDE.md after major changes
- Document all new APIs in external documentation
- Include working code examples for all features
- Keep troubleshooting guides current

## 🚨 Critical Development Rules

### MUST Requirements
- **Security First**: All commands go through Phase 1 validation
- **Test with Fresh Agents**: No feature is complete until tested by unfamiliar agent
- **Document Everything**: External users must be able to understand the system
- **Monitor Production**: All Firebase functions have proper logging and error handling

### NEVER Do
- Do not bypass security validation for convenience  
- Do not commit API keys or secrets to repository
- Do not deploy without testing the change
- Do not assume users understand internal architecture

## 🔧 MCP Integration

### Available Tools (12 total)
- **Timer Management**: create_timer, list_timers, get_timer, delete_timer
- **Quick Operations**: quick_wait, broadcast_to_team
- **Smart Command Execution**: execute_command_with_timer, spawn_smart_agent
- **Monitoring**: check_api_health, get_agent_status, ask_agent_question
- **Coordination**: agent_coordination_session

### Claude Desktop Setup
```json
{
  "minoots": {
    "command": "node",
    "args": ["/path/to/minoots-timer-system-main/mcp/index.js"],
    "env": {
      "MINOOTS_API_BASE": "https://api-m3waemr5lq-uc.a.run.app"
    }
  }
}
```

## 📊 Key Metrics & Monitoring

### Performance Targets
- **API Response Time**: <500ms for all endpoints
- **Timer Accuracy**: Commands execute within 1 second of scheduled time
- **System Reliability**: >99% uptime for core functionality
- **User Onboarding**: Complete setup in <15 minutes

### Monitoring Dashboards
- Firebase Functions logs and performance
- Firestore usage and query performance  
- Smart agent execution history and AI usage
- User onboarding success rates and friction points

---

## 🎯 CURRENT PRIORITY
**Execute MASTER_PLAN.md to validate the system with fresh agents and complete user-facing documentation.**

**Next Action**: Create external API documentation and test with completely fresh AI agent.