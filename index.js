"use strict";

function monitorActiveRequests (handler) {

  const tag = h => h.__start = Date.now();

  let timer = setImmediate(monitor, new Set(process._getActiveRequests()), handler);

  function monitor (prev, fn) {
    const current = new Set(process._getActiveRequests());
    const removed = Array.from(prev).filter(x => !current.has(x));
    const added   = Array.from(current).filter(x => !prev.has(x));
    added.forEach(tag);

    fn(added, removed);
    
    timer = setImmediate(monitor, current, fn);
  }
  

  return () => clearImmediate(timer);
}

module.exports = monitorActiveRequests;

