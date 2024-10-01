export async function delayed<T>(
  promises: Array<() => Promise<T>>,
  N: number,
  callback?: (finished: number) => void
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  while (index < promises.length) {
    // Take N promises at a time
    const batch = promises.slice(index, index + N).map(promise => promise());

    // Wait for the batch to resolve
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    if(callback) callback(results.length)

    // Increment the index to process the next batch
    index += N;

    // Wait for 1 second before starting the next batch
    if (index < promises.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
