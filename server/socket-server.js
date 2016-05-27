var io = require('socket.io')();
var logic = require('./game-logic');

function logout(logoutId){

    logic.delUser(logoutId);
    //广播登出
    io.emit('logout',{userList:logic.userList,logoutId});

    console.log(logoutId+'登出');
}

var socketio = {
    init:function(){
        this.logicInit();
        this.createDefaultUser(10);
        this.connection();
    },
    logicInit:function(){
        logic.init({
            size:1000,
            hitHappen:function(type,message){
                //广播收到攻击
                io.emit('attack_receive',{type,message})
                console.log(message.user.id+'收到攻击');
            },
            delHappen:function(logoutId){
                logout(logoutId)
            }
        })

        logic.start();
    },
    createDefaultUser:function(num){
        for(var i = 0 ;i < num;i++){
            logic.addUser(1000+i,logic.createUser(1000+i));
        }
    },
    connection:function(){
        var controller = io.of('/');

        controller.on('connection', function(socket){
            //监听登入
            socket.on('login',function(){
                if(!logic.userList.hasOwnProperty(socket.id)){

                    logic.addUser(socket.id,logic.createUser(socket.id));

                    //单播player的id
                    socket.emit('player_id',{userId:socket.id});
                    //广播登入
                    io.emit('login',{userList:logic.userList,loginId:socket.id});

                    console.log(socket.id+'登入');
                }
            });
            //监听登出
            socket.on('disconnect', function(){
                logout(socket.id)
            });
            socket.on('logout', function(){
                logout(socket.id)
            });

            //监听发出攻击
            socket.on('attack_send',function(obj){
                if(logic.userList.hasOwnProperty(obj.targetId)){

                    logic.shot(logic.userList[socket.id],logic.userList[obj.targetId])
                    //广播发出攻击
                    io.emit('attack_send',{
                        attackId:socket.id,
                        targetId:obj.targetId
                    })

                    console.log(socket.id+'发出对'+obj.targetId+'的攻击');
                }
            });

        })
    }
}
socketio.init();

exports.listen = server => {
    return io.listen(server);
};