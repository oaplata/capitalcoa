#!/bin/bash

# Script para probar el módulo de signals de CapitalCoa

echo "📡 Probando módulo de signals..."

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
echo "📋 1. Listando signals existentes..."
curl -s http://localhost:3000/api/signals $HEADERS | jq '.'

echo ""
echo "📊 2. Obteniendo estadísticas de signals..."
curl -s http://localhost:3000/api/signals/stats $HEADERS | jq '.'

echo ""
echo "🆕 3. Creando nueva señal LONG..."
NEW_SIGNAL=$(curl -s http://localhost:3000/api/signals \
  -X POST \
  $HEADERS \
  -d '{
    "asset_ticker": "AAPL",
    "signal_type": "LONG",
    "entry": 150.50,
    "stop_loss": 145.00,
    "target": 160.00
  }')

echo $NEW_SIGNAL | jq '.'

# Extraer el ID de la señal creada
SIGNAL_ID=$(echo $NEW_SIGNAL | jq -r '.id')

echo ""
echo "🔍 4. Obteniendo señal por ID: $SIGNAL_ID"
curl -s http://localhost:3000/api/signals/$SIGNAL_ID $HEADERS | jq '.'

echo ""
echo "✏️ 5. Actualizando señal..."
curl -s http://localhost:3000/api/signals/$SIGNAL_ID \
  -X PATCH \
  $HEADERS \
  -d '{
    "target": 165.00,
    "stop_loss": 148.00
  }' | jq '.'

echo ""
echo "🆕 6. Creando señal SHORT..."
curl -s http://localhost:3000/api/signals \
  -X POST \
  $HEADERS \
  -d '{
    "asset_ticker": "TSLA",
    "signal_type": "SHORT",
    "entry": 250.00,
    "stop_loss": 255.00,
    "target": 240.00
  }' | jq '.'

echo ""
echo "📊 7. Obteniendo estadísticas actualizadas..."
curl -s http://localhost:3000/api/signals/stats $HEADERS | jq '.'

echo ""
echo "🔄 8. Probando webhook de TradingView..."
curl -s http://localhost:3000/api/signals/webhook \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "MSFT",
    "signal_type": "LONG",
    "entry": 300.00,
    "stop_loss": 295.00,
    "target": 310.00,
    "timestamp": "2024-01-15T10:30:00Z",
    "message": "Bullish breakout detected"
  }' | jq '.'

echo ""
echo "🗑️ 9. Eliminando señal de prueba..."
curl -s http://localhost:3000/api/signals/$SIGNAL_ID \
  -X DELETE \
  $HEADERS | jq '.'

echo ""
echo "🔍 10. Verificando que la señal fue eliminada..."
curl -s http://localhost:3000/api/signals/$SIGNAL_ID $HEADERS | jq '.'

echo ""
echo "✅ Pruebas del módulo de signals completadas!" 