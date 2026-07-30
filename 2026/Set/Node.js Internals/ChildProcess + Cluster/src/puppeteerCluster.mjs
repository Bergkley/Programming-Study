import data from '../resources/data.json' with { type: 'json' };
import puppeteerCluster from 'puppeteer-cluster';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import querystring from 'node:querystring';
import { v1 } from 'uuid';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { Cluster } = puppeteerCluster;
const __dirname = dirname(fileURLToPath(import.meta.url));

const BC_URL = 'https://erickwendel.github.io/business-card-template/index.html'


async function render({ page, data: { finalUrl, name } }) {
    
    const output = join(__dirname, `/../output/${name}-${v1()}.pdf`)
    await mkdir(dirname(output), { recursive: true });

    console.log('rendering', name)
    await page.goto(finalUrl, { waitUntil: 'networkidle2', });
    await page.waitForFunction(() => document.querySelector("#name")?.textContent.trim());

    await page.pdf({
        path: output,
        format: 'A4',
        landscape: true,
        printBackground: true,

    });

    console.log('ended', output)
}

function createQueryStringFromObject(data) {
    const separator = null;
    const keyDelimiter = null;
    const options = { encodeURIComponent: querystring.unescape };
    const qs = querystring.stringify(data, separator, keyDelimiter, options);
    return qs;
}

async function main() {
    console.log('starting cluster...')

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 10,
       
    });

    cluster.on('taskerror', (error, data) => {
        console.error(`failed rendering ${data.name}:`, error.message);
    });

    await cluster.task(render);

    for (const item of data) {
        const qs = createQueryStringFromObject(item);
        const finalUrl = `${BC_URL}?${qs}`
        console.log('queueing', item.name)
        await cluster.queue({ finalUrl, name: item.name });
    }

    await cluster.idle();
    await cluster.close();
}


main().catch(console.error)



