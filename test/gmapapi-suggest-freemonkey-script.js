
var top = windows.getRegistered("firefox-window", "topmost");
var tab = top.tabs.new(file.testDir().append("gmapi-suggest-page.html"));

// Solve some focus problems :s
// Focus event wasn't dispatch if the windows was not focused!
top.window.focus();
wait.during(1000);

var container = elements.xpath(tab, "id('container')");
var input = elements.xpath(tab, "id('input')");

// Register a listener to watch for location events
var locationChangeBeingCalled = false;
tab.window.wrappedJSObject.onLocationChange = function () {
  locationChangeBeingCalled = true;
}
input.node.setAttribute("onlocationchange","onLocationChange(event)");

// Type some location in *the* input
input.node.focus();
input.type("paris");

// Check that everything is ok
var list = elements.xpath(tab, "id('suggest_list')");
wait.forEquals(function () {return list.node.textContent;},"Paris, France");
wait.forTrue(function () {return locationChangeBeingCalled;});
container.screenshot();

wait.during(1000);
// Blur the input in order to hide the suggest list popup
input.node.blur();

container.screenshot();


