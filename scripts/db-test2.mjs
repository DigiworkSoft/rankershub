import fs from "fs";
import { Client } from "pg";
const client = new Client({ connectionString: "postgresql://postgres:tiger@localhost:5432/rankershub" });
client.connect()
  .then(() => client.query("SELECT * FROM admins"))
  .then(res => { fs.writeFileSync("out.txt", JSON.stringify(res.rows, null, 2)); process.exit(0); })
  .catch(err => { fs.writeFileSync("out.txt", err.stack); process.exit(1); });
