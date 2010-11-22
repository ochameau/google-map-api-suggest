/* ***** BEGIN LICENSE BLOCK *****
# Copyright 2010 Alexandre Poirot
#
# Contributor(s):
#   Alexandre poirot <poirot.alex@gmail.com>
# 
# 
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either 
# version 2.1 of the License, or (at your option) any later version.
# 
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
# 
# You should have received a copy of the GNU Lesser General Public 
# License along with this library.  If not, see <http://www.gnu.org/licenses/>.
#
# ***** END LICENSE BLOCK *****/

var locationSuggest = new google.maps.Geocoder();

locationSuggest._update = function (input) {
  var query = input.value;
  
  // Cleanup the input
  query = query.replace(/\s+$/,"").replace(/^\s+/,"");
  
  // Check if a query is necessary
  if (!query || query.length<2) {
    return locationSuggest.close();
  }
  
  clearTimeout(locationSuggest._waitingDelay);
  locationSuggest._waitingDelay = setTimeout(function(){
    locationSuggest.geocode({address: query, region: "fr"}, locationSuggestesult);
  }, 300);
  
  locationSuggest._updatePosition(input);
  
  function locationSuggestesult(response, status) {
    
    if (status == google.maps.GeocoderStatus.OK && response[0]) {
      
      locationSuggest._clearList();
      var len = response.length;
      for(var i=0; i<len; i++){
        var line = locationSuggest._createLine(input, response[i]);
        if (line)
          locationSuggest._list.appendChild(line);
      }
      
      locationSuggest._updateInput(input, response[0], true);
      
    } else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
      
      locationSuggest._list.innerHTML =  "?";
      
    } else {
      
      locationSuggest._list.innerHTML =  status;
      
    }
  }
  
}

locationSuggest._updateInput = function (input, googleGeocodeItem, suggest) {
  if (suggest) {
    // TODO: do fancy suggest autocompletion!
  } else {
    input.value = googleGeocodeItem.formatted_address;
  }
  
  var callback = input.getAttribute("onlocationchange");
  var fun = eval("function f(event) {"+callback+";};f");
  fun.apply(null,[{input: input, googleGeocodeItem:googleGeocodeItem}]);
}

locationSuggest._clearList = function() {
  locationSuggest._list.selectedNodeI = -1;
  locationSuggest._savedInputValue = "";
  locationSuggest._list.innerHTML =  "";
}

locationSuggest._updatePosition = function(input) {
  function findPos(obj) {
    var curleft = curtop = 0;
  	if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
     	} while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
  }
  var pos = findPos(input);
  locationSuggest._list.style.left = pos[0]+"px";
  locationSuggest._list.style.top = (pos[1]+input.offsetHeight)+"px";
  locationSuggest._list.style.display = "block";
  // Offer a way to style the flying popup relative to the input
  if (input.id) {
    locationSuggest._list.className = "under_"+input.id;
  }
  locationSuggest._list.style.width = input.offsetWidth+"px";
}

locationSuggest._createLine = function(input, item) {
  var line = document.createElement("li");
  line.innerHTML = item.formatted_address;
  line.item = item;
  line.setAttribute("style","cursor: pointer; list-style: none; margin-left: 0; padding-left: 0;");
  line.onmousedown = function () {
    locationSuggest._updateInput(input,item,false);
  };
  return line;
}

locationSuggest.selectLine = function (input,direction) {
  try {
    var node = locationSuggest._list.childNodes[locationSuggest._list.selectedNodeI];
    node.className="";
    node.style.fontWeight="";
  } catch(e) {}
  if (locationSuggest._list.selectedNodeI==-1 && direction ==1)
    locationSuggest._savedInputValue = input.value;
  locationSuggest._list.selectedNodeI += direction;
  locationSuggest._list.selectedNodeI = Math.min(Math.max(-1,locationSuggest._list.selectedNodeI),locationSuggest._list.childNodes.length-1);
  if (locationSuggest._list.selectedNodeI==-1) {
    input.value = locationSuggest._savedInputValue;
    return;
  }
  var node = locationSuggest._list.childNodes[locationSuggest._list.selectedNodeI];
  node.className = "selected";
  node.style.fontWeight = "bold";
  locationSuggest._updateInput(input,node.item,false);
}

locationSuggest.close = function() {
  locationSuggest._list.style.display = "none";
  locationSuggest._clearList();
}

locationSuggest.registerInput = function(input) {
  input.onkeyup = function (event) {
    if (event.keyCode==40) // Arrow down
      locationSuggest.selectLine(input,1);
    else if (event.keyCode==38) // Arrow up
      locationSuggest.selectLine(input,-1);
    else if (event.keyCode==13) // Enter
      ;
    else if (input.enabled)
      locationSuggest._update(input);
  }
  input.onfocus = function () {
    input.enabled=true;
  }
  input.onblur = function () {
    locationSuggest.close();
    input.enabled=false;
  }
  input.setAttribute("autocomplete","off");
  input.form.setAttribute("autocomplete","off");
}


google.maps.event.addDomListenerOnce(window, "load",function () {
  locationSuggest._list = document.createElement("div");
  locationSuggest._list.id = "suggest_list";
  locationSuggest._list.setAttribute("style","margin: 0; padding: 0; position: absolute; min-width: 200px; right: 0; background:#f0f0f0; display:none;");
  document.body.appendChild(locationSuggest._list);
  
  var inputs = document.body.getElementsByTagName("input");
  for(var i=0; i<inputs.length; i++) {
    var input = inputs[i];
    if (!input.className.match(/location-suggest/i)) continue;
    locationSuggest.registerInput(input);
  }
});
