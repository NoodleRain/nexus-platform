#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Nexus Platform - Production Deploy Script
# Run on your server: chmod +x scripts/deploy-prod.sh && ./scripts/deploy-prod.sh
# ═══════════════════════════════════════════════════════════════

set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}🚀 Nexus Platform Production Deploy${NC}"
echo "════════════════════════════════════"

# Validate .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo "  Copy .env.example to .env and fill in your values"
    exit 1
fi

# Check required vars
source .env
REQUIRED_VARS=("SECRET_KEY" "JWT_SECRET_KEY" "POSTGRES_PASSWORD")
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo -e "${RED}✗ Required variable $VAR is not set in .env${NC}"; exit 1
    fi
done
echo -e "${GREEN}✓ Environment variables validated${NC}"

# Pull latest code
echo -e "\n${YELLOW}Pulling latest code...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"

# Build and deploy
echo -e "\n${YELLOW}Building Docker images...${NC}"
docker compose build --parallel
echo -e "${GREEN}✓ Images built${NC}"

echo -e "\n${YELLOW}Restarting services...${NC}"
docker compose up -d --remove-orphans
echo -e "${GREEN}✓ Services started${NC}"

# Wait for backend to be ready
echo -e "\n${YELLOW}Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Backend failed to start${NC}"
        docker compose logs backend --tail=50
        exit 1
    fi
    sleep 2
done

# Run migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
docker compose exec backend flask --app run init-db
echo -e "${GREEN}✓ Database migrations complete${NC}"

# Clean up old images
echo -e "\n${YELLOW}Cleaning up old Docker images...${NC}"
docker image prune -f
echo -e "${GREEN}✓ Cleanup complete${NC}"

echo -e "\n${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Production deployment complete!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo -e "Health: ${BLUE}$(curl -s http://localhost/api/health)${NC}"
echo ""
