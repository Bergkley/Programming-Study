import data from '../resources/data.json' with { type: 'json' };
import cp from 'node:child_process';
import { fileURLToPath } from 'node:url';


const moduleName = fileURLToPath(new URL('./worker.mjs', import.meta.url));


async function main() {
   for (const item of data){
      const worker = cp.fork(moduleName,[]);
        worker.on('message', msg => console.log(msg))
        worker.on('error', msg => console.error('error!', msg))

        worker.send(item);
   }
}

main().catch(console.error);
