const { Client } = require("pg");

async function check() {
  const connectionString = "postgresql://neondb_owner:npg_yIRw8WAVZp6e@ep-red-field-atpa7xn1.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const res = await client.query('SELECT email FROM "User"');
    console.log("Users in DB:", res.rows);
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    await client.end();
  }
}

check();  try {
    const user = await prisma.user.findUnique({
      where: { email: "demo@demo.com" }
    });
    console.log("User found:", user ? "YES" : "NO");
    if (user) {
      console.log("Email:", user.email);
    }
  } catch (e) {
    console.error("Error querying DB:", e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
