export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const [{ startSchedulers }, { syncDefaultSources }] = await Promise.all([
      import("@/lib/scheduler"),
      import("@/lib/bootstrap"),
    ]);

    await syncDefaultSources();
    startSchedulers();
  }
}
