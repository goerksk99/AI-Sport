#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${ANDROID_HOME:=${ANDROID_SDK_ROOT:-}}"
if [[ -z "$ANDROID_HOME" ]]; then
  echo 'Bitte ANDROID_HOME auf ein eingerichtetes Android SDK setzen.' >&2
  exit 1
fi
export ANDROID_HOME
export EXPO_NO_TELEMETRY=1
export EXPO_OFFLINE=1
npm run typecheck
npm test
npx expo prebuild --platform android --no-install
# A bundled release variant: runs without Metro or Expo Go. Expo's generated
# Android template signs this preview with its public development test key.
# Never use this signing configuration for a production/store release.
(
  cd android
  ./gradlew :app:assembleRelease --no-daemon --max-workers=3 \
    -PreactNativeArchitectures="${PULS_ANDROID_ARCHITECTURES:-arm64-v8a,armeabi-v7a}" \
    '-Dorg.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g'
)
mkdir -p artifacts
cp android/app/build/outputs/apk/release/app-release.apk artifacts/PULS-Android-Test.apk
printf 'APK: %s/artifacts/PULS-Android-Test.apk\n' "$PWD"
