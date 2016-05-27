/*
var socket = SocketApi({
	host:'172.19.145.147', //服务器host
	port:'8000', //服务器端口，默认8000
	loginHandler:function(obj,self){}, //登入回调 @params:obj={players,playersCount,loginId}
	logoutHandler:function(obj,self){}, //登出回调 @params:obj={players,playersCount,logoutId}
	attackSendHandler:function(obj,self){}, //发送攻击回调 @params:obj={attackId,targetId}
	attackReceiveHandler:function(obj,self){} //收到攻击回调 @params:obj={attackId,targetId}
})
*/

let io = require('../modules/socket.io');

let SocketApi = options => {

	//var socket = io('172.19.142.35:8000');
	if(options.host == undefined) return null;

	let socket = io(options.host+':'+(options.port||8000))

	let socketControler = {
		userId:null,//玩家id
		init () {
			//监听登入
			socket.on('login',this.loginHandler.bind(this));
			//监听player的id
			socket.on('player_id',this.playerIdHandler.bind(this));
			//监听登出
			socket.on('logout',this.logoutHandler.bind(this));
			//监听发出攻击
			socket.on('attack_send',this.attackSendHandler.bind(this));
			//监听收到攻击
			socket.on('attack_receive',this.attackReceiveHandler.bind(this));
		},
		loginHandler (obj) {
			if(typeof options.loginHandler == 'function'){
				options.loginHandler(obj,this);
			}
		},
		playerIdHandler (obj) {
			this.userId = obj.userId
		},
		logoutHandler (obj) {
			if(typeof options.logoutHandler == 'function'){
				options.logoutHandler(obj,this);
			}
		},
		attackSendHandler (obj) {
			if(typeof options.attackSendHandler == 'function'){
				options.attackSendHandler(obj,this);
			}
		},
		attackReceiveHandler (obj) {
			if(typeof options.attackReceiveHandler == 'function'){
				options.attackReceiveHandler(obj,this);
			}
		},
		//发送登入
		loginEmit (obj) {
			socket.emit('login',obj)
		},
		//发送登出
		logoutEmit () {
			socket.emit('logout')
		},
		//发送发出攻击
		attackSendEmit (targetId) {
			socket.emit('attack_send',{
				attackId:this.playerId,
				targetId:targetId
			})
		},
		//发送收到攻击
		attackReceiveEmit (attackId) {
			socket.emit('attack_receive',{
				attackId:attackId,
				targetId:this.playerId
			})
		}
	}

	socketControler.init () ;

	return {
		playerId:socketControler.userId,
		loginEmit:socketControler.loginEmit,
		logoutEmit:socketControler.logoutEmit,
		attackSendEmit:socketControler.attackSendHandler
	}
}

	
module.exports = SocketApi