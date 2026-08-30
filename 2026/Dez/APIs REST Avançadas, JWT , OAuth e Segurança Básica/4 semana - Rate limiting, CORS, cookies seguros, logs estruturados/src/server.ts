import "dotenv/config";
import App from "./app.js";
import { prisma } from "./database/prisma.js";

const app = new App();

const PORT = process.env.PORT || 3000


const [, server] = await Promise.all([
    prisma.$connect(),
    app.instance.listen(PORT,()=> {
        console.log('Server Running in port 3000')
    })
])

async function shutdown() {
  await prisma.$disconnect();
  await server.close();
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
