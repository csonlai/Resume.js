# Resume.js
Resume.js is a simple CLI process manager to  manager your node processes,and auto restart your process when exit.


# Installation
```
  [sudo] npm install cli-resumejs
```

# How it works

Resume.js let you manage your processes with commands,which communicate with different processes base on UNIX domain socket.


# Commands
We can use resume -h to get all commands support
``` bash
    resume -h
```
``` bash
  Usage: resume resume [options]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -r, --run <filename>  run a process which will resume itself when broke.
    -l, --list            list all processes.
    -R, --restart <pid>   restart a running process.
    -s, --stop <pid>      stop a running process
    -L, --log <ppid>      show the log of a resume process

  Examples:

    $ resume -r ./serverA.js
    $ resume -r ./serverB.js
    $ resume -l
```

## Simple Example

Run a node process with resume.js with -r command
``` bash 
    resume -r ./example.js
```

Then we can list our processes with -l command
``` bash
    resume -l 
```

``` bash

PID    | PPID   | Process Name  | Start Time       | Log File
-------| ------------------------------------------| ---------------------------------------------
1030   | 1026   | ./example.js  | 02 2014 17:50:55 | /Users/cson/.resume/log/1414921836441.log
1036   | 1028   | ./example2.js | 02 2014 17:55:52 | /Users/cson/.resume/log/1414921836782.log

```
Use -R command to restart a process

``` bash
    resume -R 1030
    Restart progress 1030 success!
```
Use -s command to stop a process

``` bash
    resume -s 1036
    Stop progress 1036 success!
```
We can also show the log of a process with -L command


``` bash
    resume -L 975
```
``` bash
    Sun Nov 02 2014 17:40:58 GMT+0800 (HKT)
    Run child process ../example/example.js(968) success!
    
    Sun Nov 02 2014 17:41:19 GMT+0800 (HKT)
    child process ../example/example.js(968) exit!
    
    Sun Nov 02 2014 17:41:19 GMT+0800 (HKT)
    Restart child process ../example/example.js(971)
    
    Sun Nov 02 2014 17:41:48 GMT+0800 (HKT)
    child process ../example/example.js(971) exit!
    
    Sun Nov 02 2014 17:41:48 GMT+0800 (HKT)
    Restart child process ../example/example.js(975)
```

## Auto Restart Example
When your process exit ,resume.js will auto restart it ,let your prcess run forever.

Firstly,list all processes:

``` bash
    resume -l
```
``` bash
  
    PID    | PPID   | Process Name  | Start Time       | Log File
    -------| ------------------------------------------| ---------------------------------------------
    1030   | 1026   | ./example.js  | 02 2014 17:50:55 | /Users/cson/.resume/log/1414921836441.log

```
Then we kill the process with kill command:
``` bash
    kill -s SIGKILL 1030
```

Fianlly,list all processes again,and we will see the process has auto restarted:
``` bash
  
    PID    | PPID   | Process Name  | Start Time       | Log File
    -------| ------------------------------------------| ---------------------------------------------
    1053   | 1026   | ./example.js  | 02 2014 18:09:01 | /Users/cson/.resume/log/1414921836441.log

```

