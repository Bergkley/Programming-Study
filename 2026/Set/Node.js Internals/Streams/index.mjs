import  {Readable, Transform, Writable, pipeline} from 'stream'
import { promisify }  from 'util'

const pipelineAsync = promisify(pipeline);

const readable = new Readable({
    read() {
        this.push('a');
        this.push('b');
        this.push('c');
        this.push(null);
    }
});

const output = new Writable({
    write(chunk, encoding, callback) {
        console.log(chunk.toString());
        callback();
    }
});

const toUpperCae = new Transform({
    transform(chunk, encoding, callback) {
        callback(null, chunk.toString().toUpperCase());
    }
});


await pipelineAsync(readable,toUpperCae, output);

