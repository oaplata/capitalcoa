#!/bin/bash

# Script de prueba para el módulo Backtests
# Asegúrate de que el servidor esté ejecutándose en http://localhost:3000

BASE_URL="http://localhost:3000"
AUTH_TOKEN=""

echo "🧪 Iniciando pruebas del módulo Backtests..."
echo "============================================="

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

# Función para crear activos de prueba
create_test_assets() {
    echo "📈 Creando activos de prueba..."
    
    # Activo 1: AAPL
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
    
    # Activo 2: TSLA
    curl -s -X POST "$BASE_URL/assets" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "ticker": "TSLA",
            "name": "Tesla Inc.",
            "type": "STOCK",
            "market": "NASDAQ",
            "info_url": "https://finance.yahoo.com/quote/TSLA",
            "logo_url": "https://logo.clearbit.com/tesla.com"
        }' > /dev/null
    
    # Activo 3: BTC
    curl -s -X POST "$BASE_URL/assets" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "ticker": "BTC",
            "name": "Bitcoin",
            "type": "CRYPTO",
            "market": "CRYPTO",
            "info_url": "https://coinmarketcap.com/currencies/bitcoin/",
            "logo_url": "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
        }' > /dev/null
    
    echo "✅ Activos creados (AAPL, TSLA, BTC)"
}

# Función para probar creación de backtests
test_create_backtests() {
    echo ""
    echo "🔄 Probando creación de backtests..."
    
    # Backtest 1: Estrategia conservadora para AAPL
    echo "📝 Creando backtest conservador para AAPL..."
    BACKTEST1_RESPONSE=$(curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "sma_period": 50,
            "trend_periods": 20,
            "atr_period": 14,
            "stoploss_factor": 2.0,
            "profit_factor": 3.0,
            "metrics": {
                "strategy_name": "Conservative SMA",
                "description": "Estrategia conservadora con SMA de 50 períodos"
            }
        }')
    
    BACKTEST1_ID=$(echo $BACKTEST1_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Backtest conservador creado con ID: $BACKTEST1_ID"
    
    # Backtest 2: Estrategia agresiva para TSLA
    echo "📝 Creando backtest agresivo para TSLA..."
    BACKTEST2_RESPONSE=$(curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "TSLA",
            "sma_period": 20,
            "trend_periods": 10,
            "atr_period": 10,
            "stoploss_factor": 1.5,
            "profit_factor": 4.0,
            "metrics": {
                "strategy_name": "Aggressive SMA",
                "description": "Estrategia agresiva con SMA de 20 períodos"
            }
        }')
    
    BACKTEST2_ID=$(echo $BACKTEST2_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Backtest agresivo creado con ID: $BACKTEST2_ID"
    
    # Backtest 3: Estrategia para BTC
    echo "📝 Creando backtest para BTC..."
    BACKTEST3_RESPONSE=$(curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "BTC",
            "sma_period": 100,
            "trend_periods": 50,
            "atr_period": 21,
            "stoploss_factor": 2.5,
            "profit_factor": 5.0,
            "metrics": {
                "strategy_name": "Crypto Long-term",
                "description": "Estrategia a largo plazo para criptomonedas"
            }
        }')
    
    BACKTEST3_ID=$(echo $BACKTEST3_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Backtest BTC creado con ID: $BACKTEST3_ID"
    
    # Backtest 4: Sin métricas personalizadas
    echo "📝 Creando backtest sin métricas personalizadas..."
    BACKTEST4_RESPONSE=$(curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "sma_period": 30,
            "trend_periods": 15,
            "atr_period": 14,
            "stoploss_factor": 1.8,
            "profit_factor": 2.5
        }')
    
    BACKTEST4_ID=$(echo $BACKTEST4_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "✅ Backtest sin métricas creado con ID: $BACKTEST4_ID"
}

# Función para probar consultas
test_queries() {
    echo ""
    echo "🔍 Probando consultas..."
    
    # Obtener todos los backtests
    echo "📋 Obteniendo todos los backtests..."
    curl -s -X GET "$BASE_URL/backtests" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.backtests | length' | xargs echo "   Total backtests:"
    
    # Obtener backtests por activo
    echo "📋 Obteniendo backtests de AAPL..."
    curl -s -X GET "$BASE_URL/backtests?asset_ticker=AAPL" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.backtests | length' | xargs echo "   Backtests de AAPL:"
    
    # Obtener backtests con filtros de SMA
    echo "📋 Obteniendo backtests con SMA >= 30..."
    curl -s -X GET "$BASE_URL/backtests?sma_period_min=30" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.backtests | length' | xargs echo "   Backtests con SMA >= 30:"
    
    # Obtener backtests con filtros de profit factor
    echo "📋 Obteniendo backtests con profit factor >= 3..."
    curl -s -X GET "$BASE_URL/backtests?profit_factor_min=3" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.backtests | length' | xargs echo "   Backtests con profit factor >= 3:"
}

# Función para probar operaciones especiales
test_special_operations() {
    echo ""
    echo "⚡ Probando operaciones especiales..."
    
    # Ejecutar backtest
    echo "🚀 Ejecutando backtest $BACKTEST1_ID..."
    curl -s -X POST "$BASE_URL/backtests/$BACKTEST1_ID/run" \
        -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    
    echo "✅ Backtest ejecutado"
    
    # Comparar backtests
    echo "📊 Comparando backtests..."
    curl -s -X POST "$BASE_URL/backtests/compare" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "ids": ['$BACKTEST1_ID', '$BACKTEST2_ID', '$BACKTEST3_ID']
        }' | jq '.comparison.summary' | xargs echo "   Comparación:"
}

# Función para probar estadísticas
test_stats() {
    echo ""
    echo "📊 Probando estadísticas..."
    
    echo "📈 Estadísticas de backtests:"
    curl -s -X GET "$BASE_URL/backtests/stats" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
}

# Función para probar actualizaciones
test_updates() {
    echo ""
    echo "✏️ Probando actualizaciones..."
    
    echo "📝 Actualizando backtest $BACKTEST2_ID..."
    curl -s -X PATCH "$BASE_URL/backtests/$BACKTEST2_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "sma_period": 25,
            "profit_factor": 4.5,
            "metrics": {
                "strategy_name": "Updated Aggressive SMA",
                "description": "Estrategia agresiva actualizada",
                "updated_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
            }
        }' > /dev/null
    
    echo "✅ Backtest actualizado"
}

# Función para probar eliminación
test_deletion() {
    echo ""
    echo "🗑️ Probando eliminación..."
    
    echo "🗑️ Eliminando backtest $BACKTEST4_ID..."
    curl -s -X DELETE "$BASE_URL/backtests/$BACKTEST4_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    
    echo "✅ Backtest eliminado"
}

# Función para probar casos de error
test_error_cases() {
    echo ""
    echo "⚠️ Probando casos de error..."
    
    # Intentar crear backtest con activo inexistente
    echo "❌ Intentando crear backtest con activo inexistente..."
    curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "INVALID",
            "sma_period": 50,
            "trend_periods": 20,
            "atr_period": 14,
            "stoploss_factor": 2.0,
            "profit_factor": 3.0
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # Intentar crear backtest con profit_factor <= stoploss_factor
    echo "❌ Intentando crear backtest con profit_factor <= stoploss_factor..."
    curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "sma_period": 50,
            "trend_periods": 20,
            "atr_period": 14,
            "stoploss_factor": 3.0,
            "profit_factor": 2.0
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # Intentar crear backtest con SMA < trend_periods
    echo "❌ Intentando crear backtest con SMA < trend_periods..."
    curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "sma_period": 10,
            "trend_periods": 20,
            "atr_period": 14,
            "stoploss_factor": 2.0,
            "profit_factor": 3.0
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # Intentar comparar menos de 2 backtests
    echo "❌ Intentando comparar menos de 2 backtests..."
    curl -s -X POST "$BASE_URL/backtests/compare" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "ids": ['$BACKTEST1_ID']
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # Intentar obtener backtest inexistente
    echo "❌ Intentando obtener backtest inexistente..."
    curl -s -X GET "$BASE_URL/backtests/99999" \
        -H "Authorization: Bearer $AUTH_TOKEN" | jq '.message' | xargs echo "   Error esperado:"
}

# Función para probar validaciones de rangos
test_range_validations() {
    echo ""
    echo "🔢 Probando validaciones de rangos..."
    
    # SMA muy alto
    echo "❌ Intentando crear backtest con SMA muy alto..."
    curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "sma_period": 300,
            "trend_periods": 20,
            "atr_period": 14,
            "stoploss_factor": 2.0,
            "profit_factor": 3.0
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # ATR muy alto
    echo "❌ Intentando crear backtest con ATR muy alto..."
    curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "sma_period": 50,
            "trend_periods": 20,
            "atr_period": 100,
            "stoploss_factor": 2.0,
            "profit_factor": 3.0
        }' | jq '.message' | xargs echo "   Error esperado:"
    
    # Profit factor muy alto
    echo "❌ Intentando crear backtest con profit factor muy alto..."
    curl -s -X POST "$BASE_URL/backtests" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{
            "asset_ticker": "AAPL",
            "sma_period": 50,
            "trend_periods": 20,
            "atr_period": 14,
            "stoploss_factor": 2.0,
            "profit_factor": 25.0
        }' | jq '.message' | xargs echo "   Error esperado:"
}

# Función principal
main() {
    login
    create_test_assets
    test_create_backtests
    test_queries
    test_special_operations
    test_stats
    test_updates
    test_deletion
    test_error_cases
    test_range_validations
    
    echo ""
    echo "🎉 ¡Pruebas del módulo Backtests completadas!"
    echo "============================================="
}

# Ejecutar función principal
main 