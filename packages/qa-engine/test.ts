import { QARunner } from './src';

async function test() {
  const runner = new QARunner({
    url: 'https://example.com',
    maxTurns: 10 // Shorter for testing
  });

  console.log('Starting QA test...\n');

  const result = await runner.run();

  console.log('\n=== Test Results ===');
  console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Total turns: ${result.totalTurns}`);
  console.log(`Completion reason: ${result.completionReason}`);
  console.log(`Bugs found: ${result.findings.length}`);

  if (result.findings.length > 0) {
    console.log('\n=== Findings ===');
    result.findings.forEach((finding, i) => {
      console.log(`\n${i + 1}. Turn ${finding.detectedAtTurn}: ${finding.description}`);
    });
  }

  if (result.actionLog.length > 0) {
    console.log('\n=== Actions Taken ===');
    result.actionLog.forEach((log, i) => {
      console.log(`\n${i + 1}. Turn ${log.turn}: ${log.action}`);
      console.log(`   Reasoning: ${log.reasoning}`);
    });
  }

  if (result.error) {
    console.log(`\nError: ${result.error}`);
  }
}

test().catch(console.error);
