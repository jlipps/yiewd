Yiewd
=====

Yiewd is a [Wd.js](https://github.com/admc/wd) wrapper that uses V8's new
generators for cleaner code! It's called `yiewd` because it uses the new
`yield` syntax with `wd`. `yield` + `wd` = `yiewd`. Amazing, right? And a great
way to exercise vowel pronunciation.

Yiewd is made possible with the
[monocle-js](https://github.com/jlipps/monocle-js) library.

Install with: `npm install yiewd`

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

Yeah, that sucks. Look at that callback pyramid! Look at all those repetitive
error checks!

The (generator-based) solution
------------
Let's all be a little more sane, shall we?

```js
var yiewd = require('yiewd')
  , driver = yiewd.remote();

driver.run(function*() {
  var sessionId, el, el2, text;
  sessionId = yield this.init(desiredCaps);
  yield this.get("http://mysite.com");
  yield this.elementById("someId").click();
  yield this.sleep(1.5);
  text = yield this.elementById("anotherThing").text();
  text.should.equal("What the text should be");
  yield this.quit();
});
```

Niiice.


How it works
------------
Basically, you get a driver object as a result of the call to `wd.remote()`.
You can use this driver object inside a monocle o-routine to `yield` to
asynchronous function execution rather than using callbacks. And you'll get the
result of the callback as the assignment to the yield expression!

Once you have a driver object, you can use `driver.run` as a way to kick off
a series of commands inside a generator. Here you have access to the driver
object as `this`, so you can do things like `yield
this.get("http://mysite.com")`.

Integrating with test suites
----------------------------
It's relatively easy to break up bits of sessions between testcases and so on.
Here's what a simple mocha test suite could look like:

```js
var yiewd = require('yiewd');

describe('my cool feature', function() {
  var driver = null;  // driver object used across testcases

  // global setUp, tearDown
  before(function(done) {
    driver = yiewd.remote();
    driver.run(function*() {
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

Notice how you get a `driver` object from `yiewd.remote()`. You can hold onto
this and later use `driver.run()` and pass it another generator which will take
over execution for the driver. Easy!

Composing functionality
-----------------------
Using [monocle-js](https://github.com/jlipps/monocle-js), you can compose your
own custom automation behaviors:

```js
var o_O = require('monocle-js').o_O
  , yiewd = require('yiewd')
  , driver = yiewd.remote();

var flow1 = o_O(function*() {
  yield driver.get('http://mywebpage.com');
  yield driver.elementByCss('a').click();
});

var flow2 = o_O(function*() {
  yield driver.elementByCss('input[type=text]').sendKeys("my text");
  yield driver.elementById('submit').click();
});

describe('my cool feature', function() {
  it('should do some things', function(done) {
    driver.run(function*() {
      yield this.init(desiredCaps);
      yield flow1();
      yield flow2();
      yield flow1(); // reuse flow1
      done();
    });
  });
});
```

Chaining driver calls
---------------------
Often in WebDriver-land, you only want to find an element in order to do
something with it. In those cases, it's a bit tedious to do something like
this:

```js
var el1 = yield driver.elementById('someEl');
var text = yield el1.text();
text.should.equal("hello world");
```

Of course, using Javascript&trade; we can already "chain" these calls:

```js
var text = yield (yield driver.elementById('someEl')).text();
text.should.equal("hello world");
```

But we have this goofy double-yield business. So Yiewd lets you do away with
it:

```js
var text = yield driver.elementById('someEl').text()
text.should.equal("hello world");
```

Integrating with Sauce Labs
---------------------------
We've got some special sauce so you can sauce while you Sauce:

```js
var yiewd = require('yiewd')
  , driver = yiewd.sauce(userName, accessKey);

driver.run(function*() {
  yield this.init(desiredCaps);
  yield this.get('http://saucelabs.com/guinea-pig/');
  try {
    var title = yield this.title();
    title.should.include("I am a page title");
    yield this.reportPass();
  } catch (e) {
    yield this.reportFail();
  }
  yield this.quit();
});
```

Probably the pass/fail reporting would be handled in some kind of global
tearDown method, of course.

Requirements
------------
Either:
* Node &gt;= 0.11.3 (one with generators)
* Make sure you start your test runner with the `--harmony` flag; this might
  be non-trivial but for mocha, see below.

Or:
* Any recent node
* Run your test scripts through [regenerator](https://github.com/facebook/regenerator) to get generator support, e.g.:

    ```bash
    regenerator my_test.js > my_test_es5.js && mocha my_test_es5.js
    ```

And:
* For running tests: `npm install -g mocha`

Run the Tests
-----
Make sure you have your chromedriver-enabled Selenium server running, then:

```
mocha -R spec -t 60000 --harmony test/es6/
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


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jlipps/yiewd/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

