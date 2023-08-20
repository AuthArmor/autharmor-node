import "dotenv/config";

import { app }  from "./app";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Listening: http://${host}:${port}`);
});
