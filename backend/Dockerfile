# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv pip install --system --no-cache -r uv.lock

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["uv", "run", "--host", "0.0.0.0", "--port", "8000", "app.main:app"]
