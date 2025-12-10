#!/bin/bash

# Skript pre nastavenie GitHub repozitára

echo "🚀 Nastavenie GitHub repozitára pre AI Animator"
echo ""

# Kontrola, či je git inicializovaný
if [ ! -d ".git" ]; then
    echo "❌ Git repozitár nie je inicializovaný!"
    exit 1
fi

echo "📝 Zadajte nasledujúce informácie:"
echo ""
read -p "GitHub používateľské meno: " GITHUB_USERNAME
read -p "Názov repozitára (napr. ai-animator): " REPO_NAME

if [ -z "$GITHUB_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo "❌ Musíte zadať obe hodnoty!"
    exit 1
fi

echo ""
echo "🔗 Pridávam remote repozitár..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  Remote už existuje, aktualizujem..."
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

echo "✅ Remote repozitár pridaný!"
echo ""
echo "📤 Nahrávam kód na GitHub..."
echo ""

# Zistiť aktuálnu branch
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Mením branch na main..."
    git branch -M main
fi

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Úspešne nahraté na GitHub!"
    echo "🌐 Repozitár: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📋 Ďalšie kroky:"
    echo "1. Choďte na https://vercel.com"
    echo "2. Importujte repozitár: $GITHUB_USERNAME/$REPO_NAME"
    echo "3. Pridajte Environment Variable: OPENAI_API_KEY"
    echo "4. Deploy!"
    echo ""
    echo "📖 Viac informácií v DEPLOYMENT.md"
else
    echo ""
    echo "❌ Chyba pri nahrávaní!"
    echo "Skontrolujte:"
    echo "1. Či ste vytvorili repozitár na GitHub"
    echo "2. Či máte správne oprávnenia"
    echo "3. Či je váš GitHub účet prihlásený v git"
fi

