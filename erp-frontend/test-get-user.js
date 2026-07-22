const { getUser } = require('./src/lib/api/user-api');
async function run() {
  try {
    const res = await getUser(1);  
    console.log("User details:", res);
  } catch (e) {
    console.log("Error:", e);
  }
}
run();
