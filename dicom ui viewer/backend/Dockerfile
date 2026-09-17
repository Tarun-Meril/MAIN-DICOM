FROM python:3.12-slim

WORKDIR /workspace

# Install system dependencies for compiling packages and database drivers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app codebase
COPY . .

# Make start.sh executable
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
