import { spawn } from 'child_process';
 
const esbuild = spawn('./node_modules/esbuild-linux-64/bin/esbuild', [
  'package.json',
]);
 
esbuild.stdout.on('data', (chunk) => {
  console.log(chunk.toString());
});