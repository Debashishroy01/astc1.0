# Multi-stage Docker build for ASTC SAP Testing Platform
# Enterprise-grade containerization

# Build stage
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Create non-root user for security
RUN groupadd -r astc && useradd -r -g astc astc

# Set working directory
WORKDIR /home/site/wwwroot

# Copy Python dependencies from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Set ownership and permissions
RUN chown -R astc:astc /home/site/wwwroot && \
    chmod +x startup.sh

# Switch to non-root user
USER astc

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PYTHONPATH=/home/site/wwwroot
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Command to run the application
CMD ["gunicorn", "--bind=0.0.0.0:8000", "--timeout=600", "--workers=1", "app:app"] 