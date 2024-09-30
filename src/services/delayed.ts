const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function delayed<T>(
  promises: Array<() => Promise<T>>,
  N: number
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < promises.length; i++) {
    if (i > 0 && i % N === 0) {
      // Delay for 1 second after every N promises
      await delay(1000);
    }

    // Await the result of the current promise
    const result = await promises[i]();
    results.push(result);
  }

  return results;
}
