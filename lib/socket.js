var net = require('net');
var util = require('./util');
var fs = require('fs');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var config = require('./config');

var socketPath = (process.env.HOME || '/root') + config.sockPath;
util.mkdirpSync(socketPath);

var server;


//send msg cmd
var cmd = {
	getProcessData:function(){
		var process = this.process;
		//send process data back to the client socket
		this.socket.write(JSON.stringify({
			type:'pushProcessData',
			pname:process.filename,
			pid:process.pid,
			ppid:process.ppid,
			startTime:process.startTime,
			logFilePath:process.log.filePath
		}));
	},
	stopProcess:function(){
		var c_process = this.process;
		//console.log('kill process' + c_process.pid);
		c_process.kill(true);

		//send result of stopping process back to the client socket
		this.socket.write(JSON.stringify({
			type:'stopProcess',
			success:1,
			pid:c_process.pid,
			pname:c_process.filename
		}));

	},
	restartProcess:function(){
		var c_process = this.process;
		c_process.kill();


		//send result of stopping process back to the client socket
		this.socket.write(JSON.stringify({
			type:'restartProcess',
			success:1,
			pid:c_process.pid,
			pname:c_process.filename
		}));

	},
	openLog:function(){
	
		var c_process = this.process;
		var log = c_process.getLog();


		this.socket.write(JSON.stringify({
			type:'openLog',
			success:1,
			pid:c_process.pid,
			pname:c_process.filename,
			logContent:log.read()
		}));


	}

};

//event handlers
var handlers = {

	onConnect:function(){
		this.connected = true;
		this.emit('connect',this);
	},
	onGetData:function(data){

		data = JSON.parse(data);

		cmd[data.type].call(this);
	},
	onGetPushData:function(data){

		data = JSON.parse(data);

		if(data.type == 'pushProcessData'){
			this.emit('getPushProcessData',data);
		}
		else if(data.type == 'stopProcess'){
			this.emit('getStopProcess',data);
		}
		else if(data.type == 'restartProcess'){
			this.emit('getRestartProcess',data);
		}
		else if(data.type == 'openLog'){
			this.emit('getOpenLog',data);
		}
	},
	onSocketError:function(ex){
		//delete the sock file when refused
		if (ex.code === 'ECONNREFUSED') {
	        fs.unlink(this.socketName);
	        this.emit('resolveInfuse');
      	}
      	else{
      		console.log('socket error!');
      	}
  
		// this.socket.destory();
	}
};


//Server class
var Server = function(process){
	this.init(process);
};

util.inherit(Server,EventEmitter2);

//init
Server.prototype.init = function(process){
	this.process = process;
	if(!this.server){
		this.create();
	}
};

//bind event handlers
Server.prototype.bind = function(){
	this.socket.on('data',handlers.onGetData.bind(this));
}; 

//create server
Server.prototype.create = function(){
	var self = this;

	//use UNIX domain socket
	this.server = net.createServer(function(socket){
		socket.setEncoding('UTF8');
		self.socket = socket;
		self.bind();
	});

	this.server.listen(socketPath + 'resume_' + Date.now() + '.sock');
};
//server close
Server.prototype.close = function(){
	this.server.close();
};

//Socket class
var Socket = function(filename){
	this.init(filename);
};

util.inherit(Socket,EventEmitter2);

//init
Socket.prototype.init = function(filename){

	var self = this;

	//console.log(socketPath + filename);
	this.socketName = socketPath + filename;

	this.socket = new net.Socket();
	this.socket.setEncoding('UTF8');
	
	this.bind();
};

Socket.prototype.connect = function(){
	this.socket.connect(this.socketName,handlers.onConnect.bind(this));
};

//event bind 
Socket.prototype.bind = function(){

	this.socket.on('data',handlers.onGetPushData.bind(this));
	this.socket.on('error',handlers.onSocketError.bind(this));
};

//send msg
Socket.prototype.send = function(msgType){
	//console.log('send');
	this.socket.write(JSON.stringify({
		type:msgType
	}));
};

//get all socket file name 
Socket.getAllSocketFiles = function(){
	var socketFiles;
	try{
		socketFiles = fs.readdirSync(socketPath);
	}
	catch(ex){

		if(ex.code == 'ENOENT'){
			fs.mkdirSync(socketPath);
		}

		socketFiles = fs.readdirSync(socketPath);
	}
	return socketFiles;
};



module.exports.Server = Server;
module.exports.Socket = Socket;