export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Bugable Worker</h1>
      <p>This is the job worker service. It processes QA jobs.</p>
      <p>
        <strong>Endpoint:</strong> POST /api/jobs/[jobId]/run
      </p>
    </main>
  );
}
