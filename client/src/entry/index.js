let userId = 0;
let scene = $('#scene');
let menu = $('#menu');
let menuHover = false;
let menuHoverTimer = null;
let user = {};
let userBox = `
	<a-box id="user$id" class="userBox" position="$position" rotation="0 0 0" width="2" depth="2"
		 height="2" color="#$color" roughness="0.8">
		<a-animation attribute="rotation"
		   dur="10000"
		   fill="forwards"
		   to="0 360 0"
		   repeat="indefinite"></a-animation>
	</a-box>
`;
let shotBox = `
	<a-sphere id="$id" class="shotBox" position="0 2 14" radius="0.25" color="#ffffff" data-position="$position"></a-sphere>
`;

var SocketApi = require('./socket/socket-api.js');
var game = require('./core/game-logic.js');
game.init({
	size: 1000 / 50,
	hitHappen: function(type, message) {
		if (type == 1) {
            // 炮弹击中用户
            $('#'+message.shell.id).remove();
            // this.delShell(message.shell.id);
            // this.hitUser(message.user.id);
        }
	},
	ticker: function() {
		if($('.shotBox').length > 0){
			$('.shotBox').each(function(i, shotBox){
				var id = $(this).attr('id');
				console.log(id, game.shellList);
				var shell = game.shellList[id];
				if(shell) {
					$(this).attr('position', shell.x + ' 0 ' + shell.y);
				}
			});
		}
		console.log()
	},
	userDeath: function(id) {
		$('#user'+id).remove();
	}
})

var socket = SocketApi({
	host:'172.25.139.44',
	loginHandler:function(obj,self){
		for(let item in obj.userList){
			let value = obj.userList[item];
			if (user[item]) {

			} else {
				var _user = game.createUser(item);
				game.addUser(item, _user);
				// console.log(_user, userId)

				let newUser = userBox.replace('$position', [_user.x, -2 + Math.random() * 3, _user.y].join(' '))
										.replace('$id', item)
										.replace('$color', [parseInt(Math.random() * 16).toString(16),
															parseInt(Math.random() * 16).toString(16),
															parseInt(Math.random() * 16).toString(16),
															parseInt(Math.random() * 16).toString(16),
															parseInt(Math.random() * 16).toString(16),
															parseInt(Math.random() * 16).toString(16)].join(''));
				scene.append(newUser);

				// let newUser = userBox.replace('$position', [-10 + value.x/10, -2 + Math.random() * 3, -20 + value.y/10].join(' '))
				// 						.replace('$id', item)
				// 						.replace('$color', [parseInt(Math.random() * 16).toString(16),
				// 											parseInt(Math.random() * 16).toString(16),
				// 											parseInt(Math.random() * 16).toString(16),
				// 											parseInt(Math.random() * 16).toString(16),
				// 											parseInt(Math.random() * 16).toString(16),
				// 											parseInt(Math.random() * 16).toString(16)].join(''));
				// scene.append(newUser);
				// console.log(item, newUser);
			}
		}
		if(!userId) userId = obj.loginId;
		game.userList[userId].x = 0;
		game.userList[userId].y = 14;
		// console.log(game.userList[userId])
		console.log(obj.loginId+'登入');
	},
	logoutHandler:function(obj,self){
		// let lists = document.querySelectorAll('#playerList li');
		// let list = document.querySelector('#playerList');
		// list.innerHTML = '';
		// for(let item in obj.userList){
		// 	let newNode = document.createElement('li');
		// 	newNode.setAttribute('data-id',item);
		// 	newNode.innerText = item;
		// 	if(item == self.userId){
		// 		list.insertBefore(newNode,list.firstChild);
		// 	}else{
		// 		list.appendChild(newNode);
		// 	}
		// }
		console.log(obj.logoutId+'登出');
	},
	attackSendHandler:function(obj,self){
		console.log(obj.attackId+'发出对'+obj.targetId+'的攻击');
		if(obj.targetId == self.userId){
			setTimeout(function(){
				self.attackReceiveEmit(obj.attackId)
			},1000)
		}
	},
	attackReceiveHandler:function(obj,self){
		console.log(obj.message.user.id+'收到攻击');
		//玩家血量增减
		if(obj.attackId == self.userId){
			playerHp++;
		}else if(obj.targetId == self.userId){
			if(--playerHp<=0){
				socket.logoutEmit();
			}
		}
	}
})

if (scene[0].hasLoaded) {
    run();
} else {
    scene[0].addEventListener('loaded', run);
}

function run () {
    document.body.className = 'ready';
    setTimeout(function () {
        document.body.className = 'none';
    }, 600);
	let position;
	
	let targetId = 0;
	scene.on('cursor-mouseenter', '.userBox', function(){
		targetId = $(this).attr('id').replace('user', '');
		position = $(this).attr('position');
		position = [position.x, position.y, position.z + 1].join(' ');
		console.log(position);
		$('#menu').attr('position', position).attr('visible', true);
	}).on('cursor-mouseleave', '.userBox', function(){

	});
	menu.on('cursor-mouseenter', function(){
		menuHover = true;
		menuHoverTimer = setTimeout(function(){
			if(menuHover){
				$('#menu').attr('visible', false);
				menuHover = false;
				clearTimeout(menuHover);

				var shell = game.shot(game.userList[userId], game.userList[targetId]);

				scene.append(shotBox.replace('$position', shell.x + ' 0 ' + shell.y).replace('$id', shell.id));
				console.log(shell)
				// console.log(userId, targetId)
				// if ($('#shotBox').length) {
				//
				// } else {
				// 	scene.append(shotBox.replace('$position', position);
				// }
				
			}
		}, 1500);
	}).on('cursor-mouseleave', function(){
		$('#menu').attr('visible', false);
		menuHover = false;
		clearTimeout(menuHover);
	});
	game.start();
    socket.loginEmit();
}
