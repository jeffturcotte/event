# event

a tiny & unobtrusive event library for node.js

## simple usage

	var sys = require('sys');
	var event = require('./event');
	
	var User = {
		setName: function() {
			event.emit(User, 'name-set');
		}
	};
	
	event.addListener('name-set', function(){
		sys.puts('the name was set!');
	});
	
	User.setName(); 
		# => 'the name was set!'
	
	
## eventify usage

	var sys = require('sys');
	var event = require('./event');
	
	var User = {
		setName: function(newName) {
			return newName;
		}
	};
	
	User = event.eventify(User);
	
	#
	#	eventify adds event emitters to every enumerable function in 
	#   the specified object and prototypes.
	#
	#		'call:PROPERTY-NAME'
	#			callback accepts the arguments for the original 
	#			function and returns an array of modified arguments
	#   	
	#		'return:PROPERTY-NAME'
	#			accepts the return value of the original 
	#			function returns a modified return value
	#
	
	event.addListener(User, 'call:setName', function(newName){
		return [newName + ' modified'];
	});
	
	event.addListener(User, 'return:setName', function(retVal){
		return retVal + ' twice';
	});
	
	var name = User.setName('this name was'); 

	sys.puts(name);
		# => 'this name was modified twice'
		
## license

MIT