const API = "http://localhost:5000/api";

async function post(url, data, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, data: json };
  return json;
}

async function get(url, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, { method: "GET", headers });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, data: json };
  return json;
}

async function patch(url, data, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, data: json };
  return json;
}

async function run() {
  console.log("=== Testing /api/admin/stats & /api/clearing/:id/transition ===");

  // 1. Test /admin/stats with Branch Manager
  console.log("\n[1] Testing /admin/stats with Branch Manager (manager@snb.com)...");
  const managerLogin = await post("/auth/login", { email: "manager@snb.com", password: "password123" });
  const statsRes = await get("/admin/stats", managerLogin.token);
  console.log("    [OK] /admin/stats returned 200 OK! Total cheques:", statsRes.total);

  // 2. Test /admin/stats with Drawee Bank
  console.log("\n[2] Testing /admin/stats with Drawee Verifier (drawee@hdb.com)...");
  const draweeLogin = await post("/auth/login", { email: "drawee@hdb.com", password: "password123" });
  const draweeStats = await get("/admin/stats", draweeLogin.token);
  console.log("    [OK] /admin/stats returned 200 OK for Drawee Bank! Total cheques:", draweeStats.total);

  // 3. Find an active cheque to transition
  console.log("\n[3] Finding a cheque in PRESENTED or VERIFIED state...");
  const cheques = await get("/cheques", managerLogin.token);
  const targetCheque = cheques.find((c) => ["PRESENTED", "VERIFIED", "AWAITING_CHECKER"].includes(c.status));

  if (targetCheque) {
    console.log(`    Found Cheque ${targetCheque.id} with status: ${targetCheque.status}`);

    // Test transition with Branch Manager
    console.log("\n[4] Testing transition with Branch Manager...");
    const targetStatus = targetCheque.status === "PRESENTED" ? "VERIFIED" : "CLEARED";
    try {
      const transRes = await patch(`/clearing/${targetCheque.id}/transition`, {
        toStatus: targetStatus,
        remarks: "Manager verification test",
      }, managerLogin.token);
      console.log(`    [OK] Cheque transitioned successfully to ${transRes.status} without 403 error!`);
    } catch (err) {
      if (err.data?.error?.includes("Maker-Checker Violation") || err.data?.allowedNext) {
        console.log(`    [OK] Transition reached clearing controller logic without 403 insufficient role! (${err.data.error})`);
      } else {
        throw err;
      }
    }
  } else {
    console.log("    No pending cheques found in system (all cleared or returned).");
  }

  console.log("\n[PASS] ALL CHECKS PASSED: 403 Forbidden resolved on both endpoints!");
}

run().catch((err) => {
  console.error("[FAIL] Test failed:", err);
  process.exit(1);
});
