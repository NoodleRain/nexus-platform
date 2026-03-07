#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Nexus Platform - Local Development Setup Script
# Run: chmod +x scripts/setup-dev.sh && ./scripts/setup-dev.sh
# ═══════════════════════════════════════════════════════════════

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}"
echo "  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗"
echo "  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝"
echo "  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗"
echo "  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║"
echo "  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║"
echo "  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝"
echo -e "${NC}"
echo -e "${GREEN}Nexus Platform - Development Setup${NC}"
echo "════════════════════════════════════"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.10+${NC}"; exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found.${NC}"; exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Backend setup
echo -e "\n${YELLOW}Setting up backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Created virtual environment${NC}"
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo -e "${GREEN}✓ Python dependencies installed${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env from template${NC}"
    echo -e "${YELLOW}  ⚠ Please edit backend/.env with your settings${NC}"
fi

mkdir -p uploads logs ../database
flask --app run init-db 2>/dev/null || true
flask --app run create-admin 2>/dev/null || true
echo -e "${GREEN}✓ Database initialized${NC}"
deactivate

# Frontend setup
echo -e "\n${YELLOW}Setting up frontend...${NC}"
cd ../frontend
npm install -q
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

cd ..

echo -e "\n${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo -e "Start the backend:  ${BLUE}cd backend && source venv/bin/activate && python run.py${NC}"
echo -e "Start the frontend: ${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo -e "Default admin: ${YELLOW}admin@nexus.app${NC} / ${YELLOW}Admin1234!${NC}"
echo -e "Frontend:      ${BLUE}http://localhost:3000${NC}"
echo -e "API:           ${BLUE}http://localhost:5000/api${NC}"
echo ""
