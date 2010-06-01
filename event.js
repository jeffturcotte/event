// event - a tiny & unobtrusive event library for node.js
// 
// Copyright (c) 2010 Jeff Turcotte
// 
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

var events = [],
	call_event_prefix = 'call:',
 	return_event_prefix = 'return:';
	
var collect = function(obj, event, callback) {
	return events.filter(function(val){
		var match = (val.obj === obj && val.event === event);
		
		if (!callback) { 
			return match 
		}
		
		return (match && callback === callback);
	});
};
	
this.addListener = function(obj, event, callback) {
	events.push({
		obj: obj, 
		event: event, 
		callback: callback 
	});
};

this.emit = function(obj, event, args) {
	var args = args;
	
	collect(obj, event).forEach(function(val) {
		args = val.callback.apply(obj, args);
	});
	
	return args;
};

this.eventify = function(obj) {
	var self = this,
		protos = [],
		clone = {},
		proto;
		

	clone.__proto__ = obj;
	proto = clone;

	while (proto = proto.__proto__) {
		if (proto == null || proto === proto.__proto__) 
			break;

		protos.unshift(proto);
	}

	for (p in protos) {
		for (prop in protos[p]) {
			if (typeof(protos[p][prop]) !== 'function') 
				continue;
			
			(function(prop){
				clone[prop] = function(){
					var args, val;
					
					args = self.emit(clone, call_event_prefix + prop, arguments);
					args = (args instanceof Array) ? args : arguments;
					val  = clone.__proto__[prop].apply(clone, args);
					val  = self.emit(clone, return_event_prefix + prop, [val]);
					return val;
				};
			})(prop);
		}
	}
	
	return clone;
}