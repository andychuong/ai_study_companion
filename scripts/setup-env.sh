#!/bin/bash

# Setup script for AI Study Companion environment variables

echo "🔧 AI Study Companion - Environment Setup"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    touch .env.local
    echo "DATABASE_URL=" >> .env.local
    echo "NEXTAUTH_SECRET=" >> .env.local
    echo "NEXTAUTH_URL=http://localhost:3001" >> .env.local
    echo "" >> .env.local
    echo "# OpenAI (Required for AI features)" >> .env.local
    echo "OPENAI_API_KEY=" >> .env.local
    echo "" >> .env.local
    echo "# Pinecone (Required for RAG)" >> .env.local
    echo "PINECONE_API_KEY=" >> .env.local
    echo "PINECONE_INDEX_NAME=study-companion" >> .env.local
    echo "✅ Created .env.local"
    echo ""
fi

echo "📝 Current .env.local status:"
echo ""

# Check what's already set
if grep -q "OPENAI_API_KEY=sk-" .env.local 2>/dev/null; then
    echo "✅ OpenAI API Key: Set"
else
    echo "❌ OpenAI API Key: Not set"
fi

if grep -q "PINECONE_API_KEY=" .env.local 2>/dev/null && ! grep -q "PINECONE_API_KEY=$" .env.local 2>/dev/null; then
    echo "✅ Pinecone API Key: Set"
else
    echo "❌ Pinecone API Key: Not set"
fi

if grep -q "DATABASE_URL=postgresql://" .env.local 2>/dev/null; then
    echo "✅ Database URL: Set"
else
    echo "❌ Database URL: Not set"
fi

echo ""
echo "📚 Setup Guides:"
echo "  - OpenAI: https://platform.openai.com/api-keys"
echo "  - Pinecone: https://www.pinecone.io"
echo ""
echo "💡 To add keys manually, edit .env.local"
echo "   Or run this script with: ./scripts/setup-env.sh"

