const { Client } = require("pg");

async function check() {
  const connectionString = "postgresql://neondb_owner:npg_yIRw8WAVZp6e@ep-red-field-atpa7xn1.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables in public schema:", res.rows);
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    await client.end();
  }
}

check();
