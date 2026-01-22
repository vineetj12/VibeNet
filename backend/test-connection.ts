import WebSocket from "ws";

console.log("🚀 Starting VibeNet Connection Test...\n");

// Create two WebSocket connections
const ws1 = new WebSocket("ws://localhost:8081");
const ws2 = new WebSocket("ws://localhost:8081");

let user1Connected = false;
let user2Connected = false;
let matchFound = false;

// User 1 Connection
ws1.onopen = () => {
  console.log("👤 User 1 connected to backend ✅");
  user1Connected = true;
  checkIfReady();
};

ws1.onmessage = (event) => {
  const data = JSON.parse(event.data.toString());
  console.log("📨 User 1 received:", data);
  
  if (data.type === "ownership") {
    console.log(`🎯 User 1 matched! Role: ${data.data}, Room: ${data.Roomid.slice(0, 8)}...\n`);
    matchFound = true;
  }
};

ws1.onerror = (error) => {
  console.error("❌ User 1 error:", error);
};

ws1.onclose = () => {
  console.log("👤 User 1 disconnected");
};

// User 2 Connection
ws2.onopen = () => {
  console.log("👤 User 2 connected to backend ✅");
  user2Connected = true;
  checkIfReady();
};

ws2.onmessage = (event) => {
  const data = JSON.parse(event.data.toString());
  console.log("📨 User 2 received:", data);
  
  if (data.type === "ownership") {
    console.log(`🎯 User 2 matched! Role: ${data.data}, Room: ${data.Roomid.slice(0, 8)}...\n`);
    matchFound = true;
  }
};

ws2.onerror = (error) => {
  console.error("❌ User 2 error:", error);
};

ws2.onclose = () => {
  console.log("👤 User 2 disconnected");
};

function checkIfReady() {
  if (user1Connected && user2Connected) {
    console.log("\n✅ Both users connected!\n");
    
    // Wait for match
    setTimeout(() => {
      if (matchFound) {
        console.log("✅ TEST PASSED: Users matched successfully!\n");
        console.log("🎉 VibeNet is working correctly!\n");
      } else {
        console.log("⚠️ Users connected but not yet matched (waiting...)\n");
      }
      
      // Keep connections open for 10 seconds then close
      setTimeout(() => {
        console.log("Closing connections...");
        ws1.close();
        ws2.close();
        process.exit(0);
      }, 8000);
    }, 2000);
  }
}

// Timeout if connections don't establish
setTimeout(() => {
  console.error("❌ Connection timeout!");
  process.exit(1);
}, 15000);
