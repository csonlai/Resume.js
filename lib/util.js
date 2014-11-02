var fs = require('fs');
module.exports = {
	inherit:function(child,parent){
		var newFunc = function(){};
		newFunc.prototype = parent.prototype;
		child.prototype = new newFunc();
	},
	mkdirpSync:function (pathes, mode) {  
	    mode = mode || 0777;  
	    var dirs = pathes.trim().split('/');  
	  
	    dirs.length && mkdir(dirs.shift());  
	    // mkdir  
	    function mkdir (d) {  
	    	if(d){
			    try{
			      fs.readdirSync(d);
			    }
			    catch(ex){
			      fs.mkdirSync(d);
			    }
			}

	        dirs.length && mkdir(d + '/' + dirs.shift());  
	    }  
	}
};