const { Pool } = require('@neondatabase/serverless');
const p1 = new Pool({ connectionString: 'postgresql://a:b@c/d' });
console.log(p1.options);
