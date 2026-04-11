import { Client } from "pg";
const client = new Client({ connectionString: "postgresql://postgres:tiger@localhost:5432/rankershub" });
client.connect()
  .then(() => client.query("SELECT * FROM admins"))
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); process.exit(0); })
  .catch(err => { console.error(err.message); process.exit(1); });
