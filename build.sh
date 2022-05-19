tsup
node build.mjs
cp src/vite/ssr/index.html dist/vite/plugin/index.html
rm -rf dist/react/src/
cp -r src/react/ dist/react/src/