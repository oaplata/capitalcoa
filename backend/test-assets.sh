#!/bin/bash

# Script para probar el módulo de assets de CapitalCoa

echo "🧪 Probando módulo de assets..."

# Obtener token de autenticación
echo "🔑 Obteniendo token de autenticación..."
TOKEN=$(curl -s http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@capitalcoa.com","password":"sumian01150202"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token de autenticación"
  exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

# Headers para las peticiones
HEADERS="-H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json'"

echo ""
echo "📋 1. Listando assets existentes..."
curl -s http://localhost:3000/api/assets $HEADERS | jq '.'

echo ""
echo "📈 2. Obteniendo estadísticas de AAPL..."
curl -s http://localhost:3000/api/assets/AAPL/stats $HEADERS | jq '.'

echo ""
echo "🆕 3. Creando nuevo asset..."
NEW_ASSET=$(curl -s http://localhost:3000/api/assets \
  -X POST \
  $HEADERS \
  -d '{
    "ticker": "GOOGL",
    "name": "Alphabet Inc.",
    "type": "stock",
    "market": "NASDAQ",
    "info_url": "https://finance.yahoo.com/quote/GOOGL",
    "logo_url": "https://logo.clearbit.com/google.com"
  }')

echo $NEW_ASSET | jq '.'

echo ""
echo "🔍 4. Obteniendo asset por ticker: GOOGL"
curl -s http://localhost:3000/api/assets/GOOGL $HEADERS | jq '.'

echo ""
echo "✏️ 5. Actualizando asset..."
curl -s http://localhost:3000/api/assets/GOOGL \
  -X PATCH \
  $HEADERS \
  -d '{
    "name": "Alphabet Inc. (Google)",
    "info_url": "https://finance.yahoo.com/quote/GOOGL"
  }' | jq '.'

echo ""
echo "📊 6. Obteniendo estadísticas del nuevo asset..."
curl -s http://localhost:3000/api/assets/GOOGL/stats $HEADERS | jq '.'

echo ""
echo "🗑️ 7. Eliminando asset..."
curl -s http://localhost:3000/api/assets/GOOGL \
  -X DELETE \
  $HEADERS | jq '.'

echo ""
echo "🔍 8. Verificando que el asset fue eliminado..."
curl -s http://localhost:3000/api/assets/GOOGL $HEADERS | jq '.'

echo ""
echo "✅ Pruebas del módulo de assets completadas!" 