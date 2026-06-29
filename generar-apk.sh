#!/usr/bin/env bash
set -e

echo "======================================"
echo " GENERADOR DE APK COMPACTO (WINDOWS) "
echo "======================================"

PROJECT_DIR="$(pwd)"
APK_NAME="mi-app-debug.apk"

# 1. Compilación Web
echo "1. Instalando dependencias npm..."
npm install
echo "2. Compilando proyecto web..."
npm run build

# 2. Sincronización con Capacitor
echo "3. Sincronizando con plataforma Android..."
if [ -d "android" ]; then
    echo "La carpeta android ya existe. Sincronizando..."
    npx cap sync android
else
    echo "La carpeta android no existe. Creando..."
    npx cap add android
    npx cap sync android
fi

# 3. Verificación de Variables de Entorno Locales
# Autodetectamos si el SDK está en la ruta por defecto de Windows
if [ -z "$ANDROID_HOME" ]; then
    export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
fi

echo "4. Configurando local.properties..."
cd "$PROJECT_DIR/android"
#la ruta nativa fija de tu Windows para evitar errores de Git Bash
echo "sdk.dir=C\:\\\\android-sdk" > local.properties

# 4. Compilación Nativa silenciosa sin Android Studio
echo "5. Generando APK mediante Gradle Wrapper..."
chmod +x gradlew
./gradlew clean
./gradlew assembleDebug

# 5. Extracción del APK listo para usar
echo "6. Copiando APK a la raíz del proyecto..."
cd "$PROJECT_DIR"
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    cp android/app/build/outputs/apk/debug/app-debug.apk ./"$APK_NAME"
    echo "======================================"
    echo "¡ÉXITO! APK generado en: $PROJECT_DIR/$APK_NAME"
    echo "======================================"
else
    echo "Error: No se encontró el archivo APK generado."
    exit 1
fi