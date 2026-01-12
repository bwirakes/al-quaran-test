/**
 * Test script for podcast generation flow
 * Run with: bun run scripts/test-podcast-flow.ts
 */

const BASE_URL = "http://localhost:3000";

interface JobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  audioUrl?: string;
  error?: string;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testPodcastFlow() {
  console.log("🎙️ Testing Podcast Generation Flow\n");
  console.log("=".repeat(50));

  // Step 1: Generate podcast script
  console.log("\n📝 Step 1: Generating podcast script...");
  const generateRes = await fetch(`${BASE_URL}/api/podcast/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topics: ["sabar", "syukur"] }),
  });

  if (!generateRes.ok) {
    console.error("❌ Generate failed:", await generateRes.text());
    return;
  }

  const generateData = await generateRes.json();
  if (!generateData.success) {
    console.error("❌ Generate error:", generateData.error);
    return;
  }

  console.log("✅ Script generated!");
  console.log(`   Title: ${generateData.data.title}`);
  console.log(`   Topic: ${generateData.data.topic}`);
  console.log(`   Verse: ${generateData.data.verse.verseKey}`);
  console.log(`   Script length: ${generateData.data.script.length} chars`);
  console.log(`   Job ID: ${generateData.data.jobId}`);

  const jobId = generateData.data.jobId;

  // Step 2: Poll for TTS completion
  console.log("\n🔊 Step 2: Waiting for TTS to complete...");
  
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max
  let job: JobStatus | null = null;

  while (attempts < maxAttempts) {
    attempts++;
    
    const statusRes = await fetch(`${BASE_URL}/api/podcast/status/${jobId}`);
    
    if (statusRes.ok) {
      job = await statusRes.json();
      console.log(`   [${attempts}] Status: ${job?.status}`);
      
      if (job?.status === "completed") {
        console.log("\n✅ TTS completed!");
        console.log(`   Audio URL: ${job.audioUrl}`);
        break;
      }
      
      if (job?.status === "failed") {
        console.error("\n❌ TTS failed:", job.error);
        break;
      }
    } else {
      console.log(`   [${attempts}] Status: waiting... (${statusRes.status})`);
    }
    
    await sleep(5000); // Poll every 5 seconds
  }

  if (attempts >= maxAttempts) {
    console.error("\n⏱️ Timeout waiting for TTS");
    return;
  }

  // Step 3: Verify audio is accessible
  if (job?.audioUrl) {
    console.log("\n🎵 Step 3: Verifying audio file...");
    const audioRes = await fetch(job.audioUrl, { method: "HEAD" });
    
    if (audioRes.ok) {
      const contentType = audioRes.headers.get("content-type");
      const contentLength = audioRes.headers.get("content-length");
      console.log("✅ Audio file accessible!");
      console.log(`   Type: ${contentType}`);
      console.log(`   Size: ${contentLength ? Math.round(parseInt(contentLength) / 1024) + " KB" : "unknown"}`);
    } else {
      console.error("❌ Audio file not accessible:", audioRes.status);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Test completed!\n");
}

// Run the test
testPodcastFlow().catch(console.error);
