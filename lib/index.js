var util = require('./util');
var Process = require('./process');
var Socket = require('./socket').Socket;
var Server = require('./socket').Server;
var fs = require('fs');
var async = require('async');
var EventEmitter2 = require('eventemitter2').EventEmitter2
var Table = require('cli-table');
var log = require('./log');
var config = require('./config');


var logPath = (process.env.HOME || '/root') + config.logPath;

//main class
var main = function(){};

util.inherit(main,EventEmitter2);

/* event handlers */
var handlers = {
  onRun:function(){
    //pipe the output to process.stdout
    this.child.getStdout().pipe(process.stdout); 
    this.server = new Server(this.child);
    log.write('Run child process ' + this.child.filename + '(' + this.child.pid + ') success!');
  },
  onRestart:function(){
    this.child.getStdout().pipe(process.stdout); 
    this.server = new Server(this.child);
    log.write('Restart child process ' + this.child.filename + '(' + this.child.pid + ')');
  },
  onStop:function(){
    log.write('Stop child process ' + this.child.filename + '(' + this.child.pid + ')');
  },
  onExit:function(){

    this.server.close();
    log.write('child process ' + this.child.filename + '(' + this.child.pid  + ') exit!');

  },
  onGetDataConnectSuccess:function(socket){
    socket.send('getProcessData');
  },
  onStopConnectSuccess:function(socket){
    socket.send('stopProcess');
  },
  //receive progress msg
  onGetPushProcessData:function(data,next){
    next(null,data);
  },
  //receive progress stop msg
  onGetStopProcess:function(data){
    if(data.success){
      console.log('Stop progress '+ data.pname + '(' + data.pid + ') success!');
    }
    process.exit(0);
  },
  //receive progress restart msg
  onGetRestartProcess:function(data){
  
    if(data.success){
      console.log('Restart progress ' + data.pname +'(' + data.pid + ') success!');
    }
    process.exit(0);
  },
  onGetOpenLog:function(data){
    if(data.success){
      console.log('Get log of progress '+ data.pname +'(' + data.pid + ') success!');
      console.log('\n');
      console.log(data.logContent);
    }
    process.exit(0);
  }
};

//send msg to server and get push data of process
var sendMsg = function(s,next){

  var self = this;
  var socket = new Socket(s);

  socket.connect();

  socket.on('connect',handlers.onGetDataConnectSuccess.bind(this));

  socket.on('resolveInfuse',function(){
    next();
  });

  socket.on('getPushProcessData',function(data){
    data.socket = socket;
    handlers.onGetPushProcessData.call(self,data,next);
  });

  socket.on('getStopProcess',function(data){
    handlers.onGetStopProcess(data);
  });

  socket.on('getRestartProcess',function(data){
    handlers.onGetRestartProcess(data);
  });

  socket.on('getOpenLog',function(data){
    handlers.onGetOpenLog(data);
  });
};

//get all processes
var getAllProcesses = function(callback){

  var sfArr = Socket.getAllSocketFiles();
  async.map(sfArr,sendMsg,function(err,processes){

    if(err){
      console.log('get all processes error!');
      return;
    }

    //get all processes success
    callback(processes);

  });

};


//render process list in table
var renderTable = function(processList){

  var table = new Table({
    head:['PID','PPID','Process Name','Start Time','Log File']
  });

  processList.forEach(function(p){
    if(p){
      table.push([p.pid,p.ppid,p.pname,new Date(p.startTime).toLocaleString(),p.logFilePath]);
    }
  });

  console.log(table.toString());

  process.exit(0);

};


//kill a process with filename or pid
var stopProcess = function(processes,pid){

  processes.forEach(function(p){
    if(p.pname == pid || p.pid == pid){
        p.socket.send('stopProcess');
    }
  });
};

//restart a process with filename or pid
var restartProcess = function(processes,pid){

  processes.forEach(function(p){
    if(p.pid == pid){
        p.socket.send('restartProcess');
    }
  });
};

//open a resume process log
var openLog = function(processList,ppid){

  processList.forEach(function(p){

    if(p.ppid == ppid){
        p.socket.send('openLog');
    }
  });

};

/* run a process */
main.prototype.run = function(filename){

    //init log
    log.init(logPath);

    //test if file exist
    try{
      fs.statSync(filename);
    }
    catch(e){
      log.write('File to run is not exist!');
      return;
    }

    child = new Process(filename);

    child.on('run',handlers.onRun.bind(this));
    child.on('restart',handlers.onRestart.bind(this));
    child.on('exit',handlers.onExit.bind(this));
    child.on('stop',handlers.onStop.bind(this));

    child.setLog(log);

    child.run();

    this.child = child;      
};

//list all child processes
main.prototype.list = function(){

  getAllProcesses(function(processes){
    renderTable(processes);
  });

};


//show the log of a resume process
main.prototype.log = function(ppid){

  getAllProcesses(function(processes){
    openLog(processes,ppid);
  });

};



//stop a process
main.prototype.stop = function(pid){

  getAllProcesses(function(processes){
    stopProcess(processes,pid);
  });

};

//restart a process
main.prototype.restart = function(pid){

  getAllProcesses(function(processes){
    restartProcess(processes,pid);
  });

};


module.exports = new main();