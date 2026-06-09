cd /data/x/dev/randomly-die
pnpm quasar build
./node_modules/.bin/cap sync android
cd android && export ANDROID_HOME=/home/not/Android/Sdk && export JAVA_HOME=/usr/lib/jvm/java-21-openjdk && ./gradlew assembleDebug

#assembleRelease - requires setting up keystore
