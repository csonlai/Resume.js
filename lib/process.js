var util = require('./util');
var spawn = require('child_process').spawn;
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var Process = function(filename){
	this.filename = filename;

};
util.inherit(Process,EventEmitter2);


//run the process
Process.prototype.run = function(isRestart){
	this.process = spawn(process.execPath,[this.filename],{

	});
	
	this.pid = this.process.pid;
	this.ppid = process.pid;
	this.startTime = Date.now();

	this.bind();

	//fire run event
	this.emit(isRestart ? 'restart' : 'run');
};
Process.prototype.getStdout = function(){
	return this.process.stdout;
};
Process.prototype.bind = function(){

	var ps = this.process,
		self = this;

	ps.on('exit', function (code, signal) {
		
		self.emit('exit');

		if(!self.forceStop){
			self.resume();	
		}

    });

};

Process.prototype.kill = function(forceStop){
	//if force to kill progress
	if(forceStop){
		this.emit('stop');
	}
	this.forceStop = forceStop;
	process.kill(this.pid,'SIGKILL');
}

Process.prototype.resume = function(){
	this.run(true);
};

Process.prototype.setLog = function(log){
	this.log = log;
};

Process.prototype.getLog = function(log){
	return this.log;
};






module.exports = Process;