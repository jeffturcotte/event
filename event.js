

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

// ==========
// = public =
// ==========
	
this.setCallEventPrefix = function(prefix) {
	call_event_prefix = prefix;
},

this.setReturnEventPrefix = function(prefix) {
	return_event_prefix = prefix;
},

this.add = function(obj, event, callback) {
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
