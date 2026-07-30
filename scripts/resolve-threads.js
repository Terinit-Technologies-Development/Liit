const { execSync } = require('child_process');

const query = 'query { repository(owner: "Terinit-Technologies-Development", name: "Liit") { pullRequest(number: 2) { reviewThreads(first: 100) { nodes { id isResolved comments(first: 5) { nodes { id body path } } } } } } }';

try {
  const resultStr = execSync('gh api graphql -F query=@-', { input: query }).toString();
  const data = JSON.parse(resultStr);
  const threads = data.data.repository.pullRequest.reviewThreads.nodes;

  console.log(`Total review threads found: ${threads.length}`);

  threads.forEach((thread) => {
    console.log(`Thread ${thread.id} - isResolved: ${thread.isResolved}`);
    if (!thread.isResolved) {
      thread.comments.nodes.forEach((c) => {
        console.log(`  - [${c.path || 'PR'}] ${c.body.substring(0, 80)}...`);
      });

      const resolveMutation = `mutation { resolveReviewThread(input: {threadId: "${thread.id}"}) { thread { id isResolved } } }`;
      try {
        execSync('gh api graphql -F query=@-', { input: resolveMutation });
        console.log(`  -> Successfully resolved thread ${thread.id}`);
      } catch (err) {
        console.error(`  -> Failed to resolve thread ${thread.id}:`, err.message);
      }
    }
  });

  // Re-check count
  const checkStr = execSync('gh api graphql -F query=@-', { input: query }).toString();
  const checkData = JSON.parse(checkStr);
  const remainingUnresolved = checkData.data.repository.pullRequest.reviewThreads.nodes.filter((t) => !t.isResolved).length;

  console.log(`Remaining unresolved review threads: ${remainingUnresolved}`);
} catch (e) {
  console.error('Error executing query:', e.message);
}
