#!/bin/bash

# Script de prueba para el módulo Trades
# Asegúrate de que el servidor esté ejecutándose en http://localhost:3000

BASE_URL="http://localhost:3000"
AUTH_TOKEN=""

echo "🧪 Iniciando pruebas del módulo Trades..."
echo "=========================================="

# Función para hacer login y obtener token
login() {
    echo "🔐 Iniciando sesión..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "admin",
            "password": "admin123"
        }')
    
    AUTH_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$AUTH_TOKEN" ]; then
        echo "❌ Error al obtener token de autenticación"
        echo "Respuesta: $RESPONSE"
        exit 1
    fi
    
    echo "✅ Token obtenido: ${AUTH_TOKEN:0:20}..."
}

# Función para crear un activo de prueba
create_test_asset() {
    echo "📈 Creando activo de prueba..."
    curl -s -X POST "$BASE_URL/assets" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "ticker": "AAPL",
            "name": "Apple Inc.",
            "type": "STOCK",
            "market": "NASDAQ",
            "info_url": "https://finance.yahoo.com/quote/AAPL",
            "logo_url": "https://logo.clearbit.com/apple.com"
        }' > /dev/null
    
    echo "✅ Activo AAPL creado"
}

# Función para crear un signal de prueba
create_test_signal() {
    echo "📊 Creando signal de prueba..."
    SIGNAL_RESPONSE=$(curl -s -X POST "$BASE_URL/signals" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "signal_type": "LONG",
            "entry": 150.00,
            "stop_loss": 145.00,
            "target": 160.00
        }')
    
    SIGNAL_ID=$(echo $SIGNAL_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Signal creado con ID: $SIGNAL_ID"
}

# Función para probar creación de trades
test_create_trades() {
    echo ""
    echo "🔄 Probando creación de trades..."
    
    # Trade 1: Trade abierto
    echo "📝 Creando trade abierto..."
    TRADE1_RESPONSE=$(curl -s -X POST "$BASE_URL/trades" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "signal_id": '$SIGNAL_ID',
            "asset_ticker": "AAPL",
            "actual_entry": 152.50,
            "entry_timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
            "status": "OPEN",
            "current_price": 153.00,
            "floating_pnl": 0.33
        }')
    
    TRADE1_ID=$(echo $TRADE1_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Trade abierto creado con ID: $TRADE1_ID"
    
    # Trade 2: Trade cerrado
    echo "📝 Creando trade cerrado..."
    TRADE2_RESPONSE=$(curl -s -X POST "$BASE_URL/trades" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "actual_entry": 148.00,
            "entry_timestamp": "'$(date -u -d "2 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")'",
            "actual_exit": 155.00,
            "exit_timestamp": "'$(date -u -d "1 day ago" +"%Y-%m-%dT%H:%M:%S.000Z")'",
            "status": "CLOSED",
            "realized_pnl": 4.73
        }')
    
    TRADE2_ID=$(echo $TRADE2_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Trade cerrado creado con ID: $TRADE2_ID"
    
    # Trade 3: Trade sin signal
    echo "📝 Creando trade sin signal..."
    TRADE3_RESPONSE=$(curl -s -X POST "$BASE_URL/trades" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "actual_entry": 151.00,
            "entry_timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
            "status": "OPEN"
        }')
    
    TRADE3_ID=$(echo $TRADE3_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Trade sin signal creado con ID: $TRADE3_ID"
}

# Función para probar consultas
test_queries() {
    echo ""
    echo "🔍 Probando consultas..."
    
    # Obtener todos los trades
    echo "📋 Obteniendo todos los trades..."
    curl -s -X GET "$BASE_URL/trades" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.trades | length' | xargs echo "   Total trades:"
    
    # Obtener trades abiertos
    echo "📋 Obteniendo trades abiertos..."
    curl -s -X GET "$BASE_URL/trades?status=OPEN" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.trades | length' | xargs echo "   Trades abiertos:"
    
    # Obtener trades por activo
    echo "📋 Obteniendo trades de AAPL..."
    curl -s -X GET "$BASE_URL/trades?asset_ticker=AAPL" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.trades | length' | xargs echo "   Trades de AAPL:"
    
    # Obtener trades por signal
    echo "📋 Obteniendo trades del signal $SIGNAL_ID..."
    curl -s -X GET "$BASE_URL/trades?signal_id=$SIGNAL_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.trades | length' | xargs echo "   Trades del signal:"
}

# Función para probar operaciones especiales
test_special_operations() {
    echo ""
    echo "⚡ Probando operaciones especiales..."
    
    # Cerrar un trade
    echo "🔒 Cerrando trade $TRADE1_ID..."
    curl -s -X POST "$BASE_URL/trades/$TRADE1_ID/close" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "exitPrice": 158.00,
            "exitTimestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
        }' > /dev/null
    
    echo "✅ Trade cerrado"
    
    # Actualizar precio actual
    echo "💰 Actualizando precio actual del trade $TRADE3_ID..."
    curl -s -X PATCH "$BASE_URL/trades/$TRADE3_ID/price" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "currentPrice": 154.50
        }' > /dev/null
    
    echo "✅ Precio actualizado"
}

# Función para probar estadísticas
test_stats() {
    echo ""
    echo "📊 Probando estadísticas..."
    
    echo "📈 Estadísticas de trades:"
    curl -s -X GET "$BASE_URL/trades/stats" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
}

# Función para probar actualizaciones
test_updates() {
    echo ""
    echo "✏️ Probando actualizaciones..."
    
    echo "📝 Actualizando trade $TRADE3_ID..."
    curl -s -X PATCH "$BASE_URL/trades/$TRADE3_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "current_price": 155.00,
            "floating_pnl": 2.65
        }' > /dev/null
    
    echo "✅ Trade actualizado"
}

# Función para probar eliminación
test_deletion() {
    echo ""
    echo "🗑️ Probando eliminación..."
    
    echo "🗑️ Eliminando trade $TRADE3_ID..."
    curl -s -X DELETE "$BASE_URL/trades/$TRADE3_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    
    echo "✅ Trade eliminado"
}

# Función para probar casos de error
test_error_cases() {
    echo ""
    echo "⚠️ Probando casos de error..."
    
    # Intentar crear trade con activo inexistente
    echo "❌ Intentando crear trade con activo inexistente..."
    curl -s -X POST "$BASE_URL/trades" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "INVALID",
            "actual_entry": 100.00,
            "entry_timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
            "status": "OPEN"
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # Intentar cerrar un trade ya cerrado
    echo "❌ Intentando cerrar trade ya cerrado..."
    curl -s -X POST "$BASE_URL/trades/$TRADE2_ID/close" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "exitPrice": 160.00
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # Intentar obtener trade inexistente
    echo "❌ Intentando obtener trade inexistente..."
    curl -s -X GET "$BASE_URL/trades/99999" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.message' | xargs echo "   Error esperado:"
}

# Función principal
main() {
    login
    create_test_asset
    create_test_signal
    test_create_trades
    test_queries
    test_special_operations
    test_stats
    test_updates
    test_deletion
    test_error_cases
    
    echo ""
    echo "🎉 ¡Pruebas del módulo Trades completadas!"
    echo "=========================================="
}

# Ejecutar función principal
main 