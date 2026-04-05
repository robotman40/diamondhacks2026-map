FROM python:3.13-slim-bookworm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app/

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "saferoute_backend:app", "--host", "0.0.0.0", "--port", "8000"]
