## Reproduction attempt

For https://github.com/prisma/prisma/issues/21471

Make sure to have a database running and edit the `.env` file.

```sh
# Check your Node.js version
node -v

yarn

yarn prisma db push

NODE_OPTIONS="--max-old-space-size=200" yarn ts-node main.ts
```
