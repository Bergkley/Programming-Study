import { Transform, Readable } from 'stream';
import { promisify } from 'util';
import { pipeline } from 'stream';
import fs from 'fs';

const pipelineAsync = promisify(pipeline);

const seed = fs.readFileSync('./fileTxt/arquivo.txt', 'utf8');

const targetSize = Math.pow(1024, 3);
const repetitions = Math.ceil(targetSize / seed.length);

let count = 0;

const readable = new Readable({
    read() {
        if (count < repetitions) {
            this.push(seed);
            count++;
        } else {
            this.push(null);
        }
    }
});

const toUpperCase = new Transform({
    transform(chunk, encoding, callback) {
        const content = chunk.toString();

        const words = content
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            );

        callback(null, words.join(' '));
    }
});

const output = fs.createWriteStream('./fileTxt/arquivoFinal.txt');

async function main() {
    await pipelineAsync(readable, toUpperCase, output);
    console.log('Arquivo gravado com sucesso!');
}

main();