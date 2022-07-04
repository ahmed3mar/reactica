tsup
# node build.mjs
# cp src/vite/ssr/index.html dist/vite/plugin/index.html
# rm -rf dist/react/src/
# cp -r src/react/ dist/react/src/

cp src/react/html-context.tsx dist/react/html-context.tsx
cp src/react/document.tsx dist/react/document.tsx
cp src/react/server.tsx dist/react/server.tsx

rm -rf /home/ahmed3mar/Sites/clients/ty/ty/ty-frontend/node_modules/reactica/dist
cp -r dist /home/ahmed3mar/Sites/clients/ty/ty/ty-frontend/node_modules/reactica/dist