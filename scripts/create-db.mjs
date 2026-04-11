import { Client } from "pg";
const client = new Client({ connectionString: "postgresql://postgres:tiger@127.0.0.1:5433/postgres" });
client.connect()
  .then(() => client.query("CREATE DATABASE rankershub"))
  .then(() => { console.log("Database created"); process.exit(0); })
  .catch(err => { console.error(err.message); process.exit(1); });
