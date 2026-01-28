import { QARunner } from "./src";

async function test() {
  const runner = new QARunner({
    url: "http://www.dibz.se",
    maxTurns: 3, // Shorter for testing
  });

  console.log("Starting QA test with streaming events...\n");

  for await (const event of runner.run()) {
    switch (event.type) {
      case 'test_started':
        console.log(`🚀 Test started: ${event.url} (max ${event.maxTurns} turns)`);
        break;

      case 'turn_started':
        console.log(`\n--- Turn ${event.turn} ---`);
        break;

      case 'screenshot_taken':
        console.log(`📸 Screenshot: ${event.metadata.size.toLocaleString()} bytes`);
        break;

      case 'bugs_detected':
        if (event.findings.length > 0) {
          console.log(`🐛 Bugs found: ${event.findings.length} (total: ${event.totalFindings})`);
          event.findings.forEach(bug => {
            console.log(`   [${bug.severity.toUpperCase()}] ${bug.category}: ${bug.description}`);
            console.log(`   Location: ${bug.location}`);
          });
        } else {
          console.log(`✓ No new bugs detected (total: ${event.totalFindings})`);
        }
        break;

      case 'action_planned':
        if (event.complete) {
          console.log(`✅ Testing complete: ${event.reasoning}`);
        } else {
          console.log(`🤔 Next action: ${event.action}`);
          console.log(`   Reasoning: ${event.reasoning}`);
        }
        break;

      case 'action_executed':
        if (event.success) {
          console.log(`✓ Executed: ${event.action}`);
        } else {
          console.log(`✗ Failed to execute: ${event.action}`);
          console.log(`   Error: ${event.error}`);
        }
        break;

      case 'turn_completed':
        console.log(`--- Turn ${event.turn} complete ---`);
        break;

      case 'test_completed':
        console.log(`\n🎉 Test completed successfully!`);
        console.log(`\n=== Summary ===`);
        console.log(`Total turns: ${event.result.totalTurns}`);
        console.log(`Completion reason: ${event.result.completionReason}`);
        console.log(`Total bugs found: ${event.result.findings.length}`);
        console.log(`Total actions taken: ${event.result.actionLog.length}`);
        break;

      case 'test_error':
        console.error(`\n❌ Test error: ${event.error}`);
        if (event.partialResult) {
          console.error(`Partial results available:`);
          console.error(`  Turns completed: ${event.partialResult.totalTurns}`);
          console.error(`  Bugs found: ${event.partialResult.findings?.length || 0}`);
        }
        break;
    }
  }
}

test().catch(console.error);
