# active-request-monitor (WIP)

Disclaimer: This should not be used by anyone, anywhere, ever. This package relies on undocumented, nominally internal features of Node.

Still figuring out how to get unit tests on this. After that it'll be published to npm. Final name still TBD, hopefully something that will indicate this is a gross hack. Will also do some benchmarking with `hrtime` to ensure the absolute minimum performance hit.

Clone it, and hack around and run the `demo.js` file.

### Ok, ok, get on with it

When you do something asynchronous in Node, you provide a callback. When that work is complete, the callback is called. Internally Node wraps up this callback in an object of some sort, specific to the async work to be done. These objects sit sort of on the boundary between Node's JavaScript libraries (say, `fs`) and Node's the low-level C/C++ libraries that actually make system calls. Just to be clear, this stuff is separate from V8, which is the JavaScript engine Node uses.

So, you make a call to `fs.readFile` and Node wraps up all the info it needs into a [`FSReqWrap`]() object and the native libraries go ahead and carry out that work. When the file is read into memory, the work Node requested is complete and the callback can be invoked. 

(I'm using "request" here not as in an HTTP request, but as in "Node is asking for something")

This is how all of a Node program progresses: some code is executed which makes some requests of the system. During that time, some other requests finish. The callbacks for those requests are executed, the result of which may be more requests. As such, a busy Node program might have a decent sized pool of outstanding requests. There are few (sane) reasons I can think of to want to inspect Node's outstanding work from within the process. And yet... it's possible, so here we have it. If we look at the active requests each turn of the event loop we can see how much work is being added and how much removed by comparing what we saw the last time around. Further, by inspecting the objects themselves, we can get an idea of what type of work the process is asking the system to do. 

### API

#### `monitorActiveRequests(Function handler) -> Function stopMonitoring`
Begins to monitor active requests. Each turn of the event loop, the `handler` is invoked with `(added, removed)`, where each of `added` and `removed` is an array of request objects. Checking the `constructor.name` property of an object will give you a good idea of what type of work it is doing. For `removed` objects, often the result of the async operation is available. For instance, a completed `FSReqWrap` object will have the file data available at `context.buffer` and the original callback can be found at `context.callback`. With named callback functions, or by inspecting `callback.toString()` you can get a very good idea where the request originated. Since `handler` is run on each turn of the event loop, you can also use it to profile event loop duration, although a simpler solution for that specific problem is probably better.

`monitorActiveRequests()` returns a `stopMonitoring` function which, unsurprisingly, stops monitoring active requests.

This package requires a `Array.from` and `Set`.

