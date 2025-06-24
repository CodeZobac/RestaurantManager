#!/bin/bash
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32; echo
