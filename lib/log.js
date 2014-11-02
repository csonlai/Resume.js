var util = require('./util');
var fs = require('fs');

//log manager
module.exports = {
  //log init
  init:function(filePath){
    if(!this._id){
      this._id = Date.now();
    }

    util.mkdirpSync(filePath);
    
    this.filePath = filePath  + this._id + '.log';
    this.logStream = fs.createWriteStream(this.filePath);
  },
  write:function(str){
    var strArr = [new Date().toString(),str,'\n'];
    this.logStream.write(strArr.join('\n'),'UTF-8');
  },
  end:function(){
    this.logStream.end();
  },
  read:function(){
    return fs.readFileSync(this.filePath,{
      encoding:'UTF-8'
    });
  }
};
