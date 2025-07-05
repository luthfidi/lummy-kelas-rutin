# Lummy Burn NFT - Smart Contract Makefile

# Default target
.DEFAULT_GOAL := help

# Variables
NETWORK ?= local
LISK_RPC ?= https://rpc.sepolia-api.lisk.com
FORK_URL ?= $(LISK_RPC)

# Help command
help: ## Show this help message
	@echo "Lummy Burn NFT Smart Contracts"
	@echo "=============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation
install: ## Install dependencies
	@echo "Installing Foundry dependencies..."
	forge install
	@echo "✅ Dependencies installed"

# Building
build: ## Build contracts
	@echo "Building contracts..."
	forge build
	@echo "✅ Build complete"

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	forge clean
	@echo "✅ Clean complete"

# Testing
test: ## Run all tests
	@echo "Running tests..."
	forge test -vv
	@echo "✅ Tests complete"

test-unit: ## Run unit tests only
	@echo "Running unit tests..."
	forge test test/unit/ -vv

test-integration: ## Run integration tests only
	@echo "Running integration tests..."
	forge test test/integration/ -vv

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	forge coverage
	@echo "✅ Coverage report generated"

test-gas: ## Run tests with gas reporting
	@echo "Running gas report..."
	forge test --gas-report
	@echo "✅ Gas report complete"

# Local development
anvil: ## Start local Anvil node
	@echo "Starting Anvil local node..."
	anvil --host 0.0.0.0 --port 8545

anvil-fork: ## Start Anvil with Lisk Sepolia fork
	@echo "Starting Anvil with Lisk Sepolia fork..."
	anvil --host 0.0.0.0 --port 8545 --fork-url https://rpc.sepolia.lisk.com

deploy-local: ## Deploy to local Anvil
	@echo "Deploying to local network..."
	forge script script/SimpleDeploy.s.sol --rpc-url local --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

setup-local: ## Setup roles on local deployment
	@echo "Setting up roles on local network..."
	forge script script/SetupRoles.s.sol --rpc-url local --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Lisk Sepolia deployment
deploy-lisk: ## Deploy to Lisk Sepolia
	@echo "Deploying to Lisk Sepolia..."
	@if [ -z "$$PRIVATE_KEY" ]; then echo "❌ PRIVATE_KEY environment variable required"; exit 1; fi
	forge script script/Deploy.s.sol --rpc-url lisk-sepolia --broadcast --verify --private-key $$PRIVATE_KEY
	@echo "✅ Deployed to Lisk Sepolia"

setup-lisk: ## Setup roles on Lisk Sepolia
	@echo "Setting up roles on Lisk Sepolia..."
	@if [ -z "$$ADMIN_PRIVATE_KEY" ] || [ -z "$$ORGANIZER_PRIVATE_KEY" ]; then echo "❌ ADMIN_PRIVATE_KEY and ORGANIZER_PRIVATE_KEY required"; exit 1; fi
	forge script script/SetupRoles.s.sol --rpc-url lisk-sepolia --broadcast --private-key $$ADMIN_PRIVATE_KEY
	@echo "✅ Roles setup complete"

# Contract interaction
create-event: ## Create a test event (requires deployed contracts)
	@echo "Creating test event..."
	@if [ -z "$ORGANIZER_PRIVATE_KEY" ]; then echo "❌ ORGANIZER_PRIVATE_KEY required"; exit 1; fi
	forge script script/CreateTestEvent.s.sol --rpc-url $(NETWORK) --broadcast --private-key $ORGANIZER_PRIVATE_KEY

# Contract verification
verify: ## Verify contracts on block explorer
	@echo "Verifying contracts..."
	forge verify-contract --chain lisk-sepolia --watch

# Utility commands
format: ## Format code
	@echo "Formatting code..."
	forge fmt
	@echo "✅ Code formatted"

lint: ## Lint code
	@echo "Linting code..."
	forge fmt --check
	@echo "✅ Code linted"

update: ## Update dependencies
	@echo "Updating dependencies..."
	forge update
	@echo "✅ Dependencies updated"

# Frontend integration
generate-abi: ## Generate ABI files for frontend
	@echo "Generating ABI files..."
	@mkdir -p ../frontend/src/contracts/abi
	jq '.abi' out/AccessControl.sol/AccessControl.json > ../frontend/src/contracts/abi/AccessControl.json
	jq '.abi' out/EventFactory.sol/EventFactory.json > ../frontend/src/contracts/abi/EventFactory.json
	jq '.abi' out/Event.sol/Event.json > ../frontend/src/contracts/abi/Event.json
	jq '.abi' out/TicketNFT.sol/TicketNFT.json > ../frontend/src/contracts/abi/TicketNFT.json
	@echo "✅ ABI files generated for frontend"

update-frontend-config: ## Update frontend contract addresses
	@echo "Updating frontend configuration..."
	@if [ ! -f "deployment-4202.json" ]; then echo "❌ deployment-4202.json not found. Run 'make deploy-lisk' first"; exit 1; fi
	@python3 scripts/update-frontend-config.py
	@echo "✅ Frontend configuration updated"

# Documentation
docs: ## Generate documentation
	@echo "Generating documentation..."
	forge doc
	@echo "✅ Documentation generated"

# Development workflow shortcuts
dev-setup: install build test ## Complete development setup
	@echo "✅ Development environment ready"

dev-deploy: build deploy-local setup-local generate-abi ## Deploy and setup for development
	@echo "✅ Development deployment complete"

production-deploy: build test deploy-lisk setup-lisk verify generate-abi update-frontend-config ## Full production deployment
	@echo "✅ Production deployment complete"

# Wallet management helpers
fund-wallets: ## Fund test wallets with IDRX (local only)
	@echo "Funding test wallets..."
	forge script script/FundWallets.s.sol --rpc-url local --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

check-balances: ## Check IDRX balances of test wallets
	@echo "Checking wallet balances..."
	forge script script/CheckBalances.s.sol --rpc-url $(NETWORK)

# Security
slither: ## Run Slither security analysis
	@echo "Running Slither analysis..."
	slither .
	@echo "✅ Security analysis complete"

mythril: ## Run Mythril security analysis
	@echo "Running Mythril analysis..."
	myth analyze src/
	@echo "✅ Mythril analysis complete"

# Debugging
debug-test: ## Run specific test with debugging
	@echo "Debug mode - specify TEST_NAME"
	@if [ -z "$TEST_NAME" ]; then echo "❌ TEST_NAME required (e.g., make debug-test TEST_NAME=testCompleteWorkflow)"; exit 1; fi
	forge test --match-test $TEST_NAME -vvvv

trace-tx: ## Trace a specific transaction
	@echo "Tracing transaction - specify TX_HASH"
	@if [ -z "$TX_HASH" ]; then echo "❌ TX_HASH required"; exit 1; fi
	cast run $TX_HASH --rpc-url $(NETWORK)

# Gas optimization
gas-snapshot: ## Create gas usage snapshot
	@echo "Creating gas snapshot..."
	forge snapshot
	@echo "✅ Gas snapshot saved"

gas-compare: ## Compare gas usage with snapshot
	@echo "Comparing gas usage..."
	forge snapshot --diff .gas-snapshot
	@echo "✅ Gas comparison complete"

# Clean everything
clean-all: clean ## Clean everything including dependencies
	@echo "Cleaning all artifacts and dependencies..."
	rm -rf lib/
	rm -rf cache/
	rm -rf broadcast/
	rm -rf deployment-*.json
	rm -rf test-event-*.json
	@echo "✅ Complete cleanup finished"

.PHONY: help install build clean test test-unit test-integration test-coverage test-gas anvil deploy-local setup-local deploy-lisk setup-lisk create-event verify format lint update generate-abi update-frontend-config docs dev-setup dev-deploy production-deploy fund-wallets check-balances slither mythril debug-test trace-tx gas-snapshot gas-compare clean-all