const { useState, useEffect } = require("react");
const { fetchJobs } = require("./actions");

export function useJobQueue(pollInterval = 5000) {
  const [jobQueue, setJobQueue] = useState({
    done: 0,
    queued: 0,
    inProgress: 0,
    total: 0,
    failed: 0,
    jobs: {},
  });

  useEffect(() => {
    fetchJobs().then(setJobQueue);
    const h = setInterval(() => fetchJobs().then(setJobQueue), pollInterval);

    return () => {
      clearInterval(h);
    };
  }, [pollInterval]);

  return jobQueue;
}
