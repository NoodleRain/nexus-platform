FROM python:3.12-slim

# Security: non-root user
RUN groupadd -r nexus && useradd -r -g nexus nexus

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create directories with proper permissions
RUN mkdir -p uploads logs && chown -R nexus:nexus /app

USER nexus

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["sh", "-c", "flask --app run init-db && flask --app run create-admin && gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 --timeout 120 --access-logfile - --error-logfile - 'run:app'"]
