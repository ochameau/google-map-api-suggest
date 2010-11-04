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
  var fun = eval("(function (event) {"+callback+";})");
  fun.apply(null,[{input: input, googleGeocodeItem:googleGeocodeItem}]);
}

locationSuggest._clearList = function() {
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
  line.setAttribute("style","cursor: pointer; list-style: none; margin-left: 0; padding-left: 0;");
  line.onmousedown = function () {
    locationSuggest._updateInput(input,item,false);
  };
  return line;
}



locationSuggest.close = function() {
  locationSuggest._list.style.display = "none";
  locationSuggest._clearList();
}

locationSuggest.registerInput = function(input) {
  input.onkeyup = function () {
    if (input.enabled)
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


window.addEventListener("load",function () {
  locationSuggest._list = document.createElement("div");
  locationSuggest._list.id = "suggest_list";
  locationSuggest._list.setAttribute("style","margin: 0; padding: 0; position: absolute; min-width: 200px; right: 0; background:#f0f0f0; display:none;");
  document.body.appendChild(locationSuggest._list);
  
  var inputs = document.getElementsByClassName("location-suggest");
  for(var i=0; i<inputs.length; i++) {
    var input = inputs[i];
    if (!input.tagName.match(/input/i)) continue;
    locationSuggest.registerInput(input);
  }
}, false);
