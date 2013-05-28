jasmine.ConsoleReporter = function(print, showColors, doneCallback) {
  //inspired by mhevery's jasmine-node reporter
  //https://github.com/mhevery/jasmine-node

    doneCallback = doneCallback || function() {};
    showColors = showColors || false;

    var language = {
	spec: "spec",
	failure: "failure"
    };

    function greenStr(str) {
	console.log('%c '+ str, 'color: green');
    }

    function redStr(str) {
	console.log('%c '+ str, 'color: red');
    }

    function yellowStr(str) {
	console.log('%c '+ str, 'color: yellow');
    }

    function newline() {
	console.log("\n");
    }

    function started() {
	console.log("Started");
	newline();
    }

    function greenPass() {
	greenStr("PASS");
    }

    function redFail() {
	redStr("FAIL");
    }

    function yellowStar() {
	yellowStr("*");
    }

    function plural(str, count) {
	return count == 1 ? str : str + "s";
    }

    function repeat(thing, times) {
	var arr = [];
	for (var i = 0; i < times; i++) {
	    arr.push(thing);
	}
	return arr;
    }

    function indent(str, spaces) {
	var lines = (str || '').split("\n");
	var newArr = [];
	for (var i = 0; i < lines.length; i++) {
	    newArr.push(repeat(" ", spaces).join("") + lines[i]);
	}
	return newArr.join("\n");
    }

    function specFailureDetails(suiteDescription, specDescription, stackTraces) {
	newline();
	console.log(suiteDescription + " " + specDescription);
	for (var i = 0; i < stackTraces.length; i++) {
	    console.log(indent(stackTraces[i], 2));
	}
    }

    function finished(elapsed) {
	newline();
	console.log("Finished in " + elapsed / 1000 + " seconds");
    }

    function summary(colorF, specs, failed) {
	newline();
	console.log(colorF(specs + " " + plural(language.spec, specs) + ", " +
			   failed + " " + plural(language.failure, failed)));
    }

    function greenSummary(specs, failed) {
	summary(greenStr, specs, failed);
    }

    function redSummary(specs, failed) {
	summary(redStr, specs, failed);
    }

    function fullSuiteDescription(suite) {
	var fullDescription = suite.description;
	if (suite.parentSuite) fullDescription = fullSuiteDescription(suite.parentSuite) + " " + fullDescription;
	return fullDescription;
    }

    this.now = function() {
	return new Date().getTime();
    };

    this.reportRunnerStarting = function() {
	this.runnerStartTime = this.now();
	started();
    };

    this.reportSpecStarting = function() { /* do nothing */
    };

    this.reportSpecResults = function(spec) {
	var results = spec.results();
	if (results.skipped) {
	    yellowStar();
	} else {
            if (results.passed()) {
                console.log('#' + spec.id + ' ' + spec.suite.description + ': ' + spec.description);
		greenPass();
	    } else {
                console.log(redStr('#' + spec.id + ' ' + spec.suite.description + ': ' + spec.description));
		redFail();
	    }
	}
    };

    this.suiteResults = [];

    this.reportSuiteResults = function(suite) {
	var suiteResult = {
	    description: fullSuiteDescription(suite),
	    failedSpecResults: []
	};

	suite.results().items_.forEach(function(spec) {
	    if (spec.failedCount > 0 && spec.description) suiteResult.failedSpecResults.push(spec);
	});

	this.suiteResults.push(suiteResult);
    };

    function eachSpecFailure(suiteResults, callback) {
	for (var i = 0; i < suiteResults.length; i++) {
	    var suiteResult = suiteResults[i];
	    for (var j = 0; j < suiteResult.failedSpecResults.length; j++) {
		var failedSpecResult = suiteResult.failedSpecResults[j];
		var stackTraces = [];
		for (var k = 0; k < failedSpecResult.items_.length; k++) stackTraces.push(failedSpecResult.items_[k].trace.stack);
		callback(suiteResult.description, failedSpecResult.description, stackTraces);
	    }
	}
    }

    this.reportRunnerResults = function(runner) {
	eachSpecFailure(this.suiteResults, function(suiteDescription, specDescription, stackTraces) {
	    specFailureDetails(suiteDescription, specDescription, stackTraces);
	});

	finished(this.now() - this.runnerStartTime);

	var results = runner.results();
	var summaryFunction = results.failedCount === 0 ? greenSummary : redSummary;
	summaryFunction(runner.specs().length, results.failedCount);
	doneCallback(runner);
    };
};
