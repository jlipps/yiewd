Yiewd
=====

Yiewd is a [Wd.js](https://github.com/admc/wd) wrapper that uses V8's new
generators for cleaner code! It's called `yiewd` because it uses the new
`yield` syntax with `wd`. `yield` + `wd` = `yiewd`. Amazing, right? And a great
way to exercise vowel pronunciation.

The problem
-----------
Let's say we want to write a webdriver test:

```js
var wd = require('wd')
  , driver = wd.remote();

driver.init(desiredCaps, function(err, sessionId) {
  if (err) return postTest(err);
  driver.get("http://mysite.com", function(err) {
    if (err) return postTest(err);
    driver.elementById("someId", function(err, el) {
      if (err) return postTest(err);
      el.click(function(err) {
        if (err) return postTest(err);
        setTimeout(function() { // pause a bit
          driver.elementById("anotherThing", function(err, el2) {
            if (err) return postTest(err);
            el2.text(function(err, text) {
              if (err) return postTest(err);
              text.should.equal("What the text should be");
              driver.quit(postTest);
            });
          });
        }, 1500); // what's this random number doing here? It goes with the pause!
      });
    });
  });
});
```

Yeah, that sucks. Look at that callback pyramid! Look at all those error checks!

The solution
------------
Let's all be a little more sane, shall we?

```js
wd.remote(function*() {
  var sessionId, el, el2, text;
  sessionId = yield this.init(desiredCaps);
  yield this.get("http://mysite.com");
  el = yield this.elementById("someId");
  yield el.click();
  yield this.sleep(1.5);
  el2 = yield this.elementById("anotherThing")
  text = yield el2.text();
  text.should.equal("What the text should be");
  yield this.quit();
});
```

Isn't that awesome? Because of Javascript's "elegant" binding rules, we've even
got all the driver methods proxied on `this`!


How it works
------------
Basically, you pass a generator to `wd.remote`. This generator receives
a driver object. Now, anytime you would have had a callback, just yield the
function. If anything would have been passed as an argument to the callback,
you'll get it as the result of the assignment to yield.

It takes a slight change in how you think, but it's so much better than
callbacks. Enjoy!

Integrating with test suites
----------------------------
It's relatively easy to break up bits of sessions between testcases and so on.
Here's what a simple mocha test suite could look like:

```js
describe('my cool feature', function() {
  var driver = null;  // driver object used across testcases

  // global setUp, tearDown
  before(function(done) {
    yiewd.remote(function*(d) {
      driver = d;
      yield this.init(desiredCaps);
      done();
    });
  });
  after(function(done) {
    driver.run(function*() {
      yield this.quit();
      done();
    });
  });

  it('should do some thing', function(done) {
    driver.run(function*() {
      // test logic
      done();
    });
  });

  it('should do another thing', function(done) {
    driver.run(function*() {
      // test logic
      done();
    });
  });
});
```

Notice how you get a `driver` object passed into the generator
argument to `yiewd.remote()`. You can hold onto this and later use
`driver.run()` and pass it another generator which will take over execution for
the driver. Easy!

Integrating with Sauce Labs
---------------------------
We've got some special sauce so you can sauce while you Sauce:

```js
yiewd.sauce(userName, accessKey, function*() {
  yield this.init(desiredCaps);
  yield this.get('http://saucelabs.com/guinea-pig/');
  try {
    var title = yield this.title();
    title.should.include("I am a page title");
    yield this.reportPass();
  } catch (e) {
    yield this.reportFail();
  }
});
```

Probably the pass/fail reporting would be handled in some kind of global
tearDown method, of course.

Requirements
------------
* Node &gt;= 0.11.3 (one with generators)
* Make sure you start your test runner with the `--harmony` flag; this might
  be non-trivial but for mocha, see below.
* For running tests: `npm install -g mocha`

Run the Tests
-----
Make sure you have your chromedriver-enabled Selenium server running, then:

```
mocha -R spec -t 60000 --harmony test/
```

Architecture
------------
This is a simple wrapper around Wd.js that is really easy to maintain: (a) new
methods from Wd.js can be added with one word in Yiewd, (b) there's nothing
really to maintain beyond the generator glue which should stabilize quickly.

Contributing
------------
Give it a whirl and contribute bugfixes! Pull requests welcome. Biggest area of
need right now is filling out our testsuite to make sure everything works
correctly.

Acknowledgements
----------------
These articles / code samples helped me get started with generators (no code
was reused, however):
* [http://wingolog.org/archives/2013/05/08/generators-in-v8](http://wingolog.org/archives/2013/05/08/generators-in-v8)
* [https://github.com/kriskowal/q/tree/master/examples/async-generators](https://github.com/kriskowal/q/tree/master/examples/async-generators)
