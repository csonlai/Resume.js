var program = require('commander');
var index = require('./index');

exports.start = function(){
  

  program
    .version('0.0.4')
    .usage('resume [options]')
    .option('-r, --run <filename>', 'run a process which will resume itself when broke.',index.run)
    .option('-l, --list', 'list all processes.',index.list)
    .option('-R, --restart <pid>', 'restart a running process.',index.restart)
    .option('-s, --stop <pid>', 'stop a running process',index.stop)
    .option('-L, --log <ppid>', 'show the log of a resume process',index.log)
    ;
    

  program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ resume -r ./serverA.js');
    console.log('    $ resume -r ./serverB.js');
    console.log('    $ resume -l');
    console.log('');
  });


  program.parse(process.argv);

};



