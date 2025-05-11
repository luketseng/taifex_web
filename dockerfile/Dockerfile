# Use the official Python 3.10 slim image as base
FROM python:3.10.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Install required system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        python3-dev \
        libffi-dev \
        libssl-dev \
        curl \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Python libraries
RUN pip3 install --no-cache-dir \
    numpy \
    PyDrive \
    selenium \
    requests
