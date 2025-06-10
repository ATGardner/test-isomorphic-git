import { clone } from "isomorphic-git"
import http from "isomorphic-git/http/node/index.cjs"
import fs, { mkdirSync, rmSync } from "node:fs"
import { setTimeout } from "node:timers/promises"
import { getHeapStatistics } from "node:v8"
import { simpleGit } from "simple-git"

async function cloneRepoUsingIsomorphicGit(repoUrl, dir) {
  try {
    await clone({
      fs,
      http,
      dir,
      url: repoUrl,
      singleBranch: true,
      depth: 1,
    });
    console.log("Repository cloned successfully using isomorphic-git!");
  } catch (error) {
    console.error("Error cloning repository using isomorphic-git", error);
  }
}

async function cloneRepoUsingSimpleGit(repoUrl, dir) {
  try {
    const git = simpleGit().env({
      GIT_CONFIG_GLOBAL: "/dev/null", // Prevent global git config from being used
      GIT_CONFIG_SYSTEM: "/dev/null", // Prevent system git config from being used
      GIT_CONFIG_NOSYSTEM: "1", // Prevent system git config from being used
      GIT_TERMINAL_PROMPT: "0", // Disable interactive prompts
    });
    await git.clone(repoUrl, dir)
    console.log("Repository cloned successfully using simple-git!");
  } catch (error) {
    console.error("Error cloning repository using simple-git", error);
  }
}

function getMemoryData() {
  const stats = getHeapStatistics();
  const memoryUsage = process.memoryUsage();
  return {
    total_heap_size: (stats.total_heap_size / (1024 * 1024)).toFixed(2) + "MB",
    total_heap_size_executable:
      (stats.total_heap_size_executable / (1024 * 1024)).toFixed(2) + "MB",
    total_physical_size:
      (stats.total_physical_size / (1024 * 1024)).toFixed(2) + "MB",
    total_available_size:
      (stats.total_available_size / (1024 * 1024)).toFixed(2) + "MB",
    used_heap_size: (stats.used_heap_size / (1024 * 1024)).toFixed(2) + "MB",
    heap_size_limit: (stats.heap_size_limit / (1024 * 1024)).toFixed(2) + "MB",
    malloced_memory: (stats.malloced_memory / (1024 * 1024)).toFixed(2) + "MB",
    peak_malloced_memory:
      (stats.peak_malloced_memory / (1024 * 1024)).toFixed(2) + "MB",
    does_zap_garbage: stats.does_zap_garbage,
    number_of_native_contexts: stats.number_of_native_contexts,
    number_of_detached_contexts: stats.number_of_detached_contexts,
    total_global_handles_size: stats.total_global_handles_size,
    used_global_handles_size: stats.used_global_handles_size,
    external_memory: (stats.external_memory / (1024 * 1024)).toFixed(2) + "MB",
    rss: (memoryUsage.rss / (1024 * 1024)).toFixed(2) + "MB",
    heapTotal: (memoryUsage.heapTotal / (1024 * 1024)).toFixed(2) + "MB",
    heapUsed: (memoryUsage.heapUsed / (1024 * 1024)).toFixed(2) + "MB",
    external: (memoryUsage.external / (1024 * 1024)).toFixed(2) + "MB",
    arrayBuffers: (memoryUsage.arrayBuffers / (1024 * 1024)).toFixed(2) + "MB",
  };
}

function deleteDirectory(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Deleting directory: ${dir}`);
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const repoUrl = process.argv[2];
  if (!repoUrl) {
    console.error(
      "Please provide a repository URL as a command line argument."
    );
    process.exit(1);
  }

  const dir = process.argv[3];
  if (!dir) {
    console.error(
      "Please provide a directory path as a command line argument."
    );
    process.exit(1);
  }

  deleteDirectory(dir);

  const beforeStats = getMemoryData();
  console.log("Memory usage before cloning:", beforeStats, repoUrl);
  console.time()
  await cloneRepoUsingSimpleGit(repoUrl, dir);
  console.timeEnd()
  const afterStats = getMemoryData();
  console.log("Memory usage after cloning:", afterStats, repoUrl);
  await setTimeout(10000); // Wait for 10 second to allow memory stats to stabilize
  const finalStats = getMemoryData();
  console.log("Final memory usage:", finalStats);
}

await main();
