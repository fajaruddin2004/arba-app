const jwt = require("jsonwebtoken");

async function testStats() {
  const token = jwt.sign(
    { userId: 1, role: "ADMIN", username: "admin" },
    process.env.JWT_SECRET || "rahasia-stikom-22j",
    { expiresIn: "1d" }
  );

  const res = await fetch("http://localhost:3000/api/admin/stats", {
    headers: {
      cookie: `auth_token=${token}`
    }
  });

  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}

testStats();
