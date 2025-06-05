import { clone } from "isomorphic-git";
import http from "isomorphic-git/http/node/index.cjs";
import fs from "node:fs";
import { getHeapStatistics } from "node:v8";
import { setTimeout } from "node:timers/promises";

async function cloneRepo(repoUrl, dir) {
  try {
    await clone({
      fs,
      http,
      dir,
      url: repoUrl,
      singleBranch: true,
      depth: 1,
    });
    console.log("Repository cloned successfully!");
  } catch (error) {
    console.error("Error cloning repository:", error);
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

  const beforeStats = getMemoryData();
  console.log("Memory usage before cloning:", beforeStats);
  await cloneRepo(repoUrl, dir);
  const afterStats = getMemoryData();
  console.log("Memory usage after cloning:", afterStats);
  await setTimeout(10000); // Wait for 10 second to allow memory stats to stabilize
  const finalStats = getMemoryData();
  console.log("Final memory usage:", finalStats);
}

await main();
