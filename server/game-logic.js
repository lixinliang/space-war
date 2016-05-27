// lodash
var _ = require('lodash');

//window._ = _;

/**
 * Function: 游戏逻辑
 * Author: yangweiye
 */
function Logic() {
    // 初始化选项
    this.opts = {
        size: 1000,
        hitHappen: function() {},
        delHappen: function() {}
    };
    // 计时器
    this.timer = null;
    // 炮弹的初始设定
    this.config = {
        initShellSpeed: 2, // 炮弹的初始速度
        modelSize: 3, // 模型大小
        vrbox: 16, // 虚拟场景盒子的个数
    };
    // 游戏场景大小
    this.scene = {
        width: 0,
        height: 0
    };
    // 用户虚拟场景数组, 用于计算优化, 16格
    this.userListVR = [];
    // 用户对象列表, 用hash排序, 快速查找
    this.userList = {};
    // 用户对象
    this.user = {
        id: 0, // id
        x: 0, // 坐标系 x
        y: 0, // 坐标系 y
        life: 100, // 生命值
        shot: 5, // 射击次数
        wait: 5, // 射击间隔
        shellLevel: 1, // 炮弹等级,
        modelSize: 3, // 模型大小
    };
    // 炮弹对象列表
    this.shellList = {};
    // 炮弹对象
    this.shell = {
        id: 0,
        x: 0,
        y: 0,
        scene: this.scene,
        speed: 0, // 炮弹的速度
        moveX: 0, // 炮弹的角度, 转化为x的位移
        moveY: 0, // 炮弹的角度, 转化为y的位移
        owner: 0, // 炮弹发射者
        modelSize: 1, // 模型大小
        move: function(list) {
            this.x += this.moveX;
            this.y += this.moveY;
            if (this.x <= 0 || this.y <= 0 || this.x >= this.scene.width || this.y >= this.scene.height) this.del(list);
        },
        del: function(list) {
            delete(list[this.id]);
        }
    };
    // 武器升级包对象列表
    this.levelUpPackageList = {};
    // 武器升级包对象
    this.levelUpPackage = {
        x: 0,
        y: 0,
        up: 0, // 武器升级包 提升效果
    };
    // 生命补给包对象列表
    this.lifePackageList = {};
    // 生命补给包对象
    this.lifePackage = {
        x: 0,
        y: 0,
        up: 0, // 生命补给包 提升效果
    };

    //this.init(1000);

    /*for (var i = 0; i < 10; i++) {
        this.addUser(1000 + i, this.createUser(1000 + i));
        this.addLifePackage(this.createLifePackage())
        this.addLevelUpPackage(this.createLevelUpPackage())
    }

    this.start();

    this.shot(this.userList[1000], this.userList[1002])
    this.shot(this.userList[1000], this.userList[1002])
    this.shot(this.userList[1000], this.userList[1002])
    this.shot(this.userList[1000], this.userList[1002])*/

}

Logic.prototype = {
    // 游戏实例初始化
    init: function(opts) {
        _.assign(this.opts, opts);
        this.createScene(this.opts.size);
        for (var i = 0; i < this.config.vrbox; i++) {
            this.userListVR.push({});
        }
    },
    // 创建游戏场景
    createScene: function(size) {
        this.scene.width = this.scene.height = size;
    },
    // 创建的用户对象
    createUser: function(id, x, y) {
        return _.assign({}, this.user, {
            id: id || 0,
            x: x || _.random(this.scene.width),
            y: y || _.random(this.scene.height),
        });
    },
    // 添加用户到对象列表
    addUser: function(id, user) {
        this.userList[id] = user;
        if (this.checkVRBox(user) > 0) {
            this.userListVR[this.checkVRBox(user)][id] = user;
        }
    },
    // 从用户对象列表中移除一个用户
    delUser: function(id) {
        delete(this.userList[id]);
    },
    hitUser: function(id) {
        this.userList[id].life -= 30;
        console.log(this.userList[id].life)
        if (this.userList[id].life <= 0) {
            this.delUser(id);
            this.opts.delHappen && this.opts.delHappen(id);
            _.forEach(this.userListVR, function(list) {
                if (list[id]) delete(list[id]);
            });
        }
    },
    // 创建一个炮弹
    createShell: function(x, y, speed, moveX, moveY, owner) {
        // if (!x || !y || !speed || !moveX || !moveY || !owner) return null;
        return _.assign({}, this.shell, {
            x: x,
            y: y,
            speed: speed,
            moveX: moveX,
            moveY: moveY,
            owner: owner
        });
    },
    // 添加炮弹到对象列表
    addShell: function(shell) {
        var id = new Date().getTime() + _.random(10000);
        shell.id = id;
        this.shellList[id] = shell;
    },
    // 删除炮弹
    delShell: function(shellId) {
        delete(this.shellList[shellId]);
    },
    // 创建一个武器升级包
    createLevelUpPackage: function(x, y, up) {
        return _.assign({}, this.levelUpPackage, {
            x: x || _.random(this.scene.width),
            y: y || _.random(this.scene.height),
            up: up || _.random(1, 3)
        });
    },
    // 添加武器升级包到对象列表
    addLevelUpPackage: function(levelUpPackage) {
        this.levelUpPackageList[new Date().getTime() + _.random(10000)] = levelUpPackage;
    },
    // 删除武器升级包
    delLevelUpPackage: function(levelUpPackageId) {
        delete(this.levelUpPackageList[levelUpPackageId]);
    },
    // 创建一个生命补给包
    createLifePackage: function(x, y, up) {
        return _.assign({}, this.lifePackage, {
            x: x || _.random(this.scene.width),
            y: y || _.random(this.scene.height),
            up: up || _.random(10, 30)
        });
    },
    // 添加生命补给包到对象列表
    addLifePackage: function(lifePackage) {
        this.lifePackageList[new Date().getTime() + _.random(10000)] = lifePackage;
    },
    // 删除生命补给包
    delLifePackage: function(lifePackageId) {
        delete(this.lifePackageList[lifePackageId]);
    },
    // 射击事件, userA -> userB
    shot: function(userA, userB) {
        // 直角的边长
        var x = Math.abs(userA.x - userB.x);
        var y = Math.abs(userA.y - userB.y);
        // 斜边长
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        // 正弦
        var sin = x / z;
        // 余弦
        var cos = y / z;
        // 炮弹的速度
        var speed = userA.shellLevel * this.config.initShellSpeed;
        var moveX = sin * speed * (userA.x >= userB.x ? -1 : 1);
        var moveY = cos * speed * (userA.y >= userB.y ? -1 : 1);

        this.addShell(this.createShell(userA.x, userA.y, speed, moveX, moveY, userA.id));

        // 弧度
        // var radina = Math.acos(cos);
        // 角度
        // var angle = 180 / (Math.PI / radina);
    },
    // 发生碰撞事件
    hitHappen: function(type, message) {
        if (type == 1) {
            // 炮弹击中用户
            this.delShell(message.shell.id);
            this.hitUser(message.user.id);
        }
        this.opts.hitHappen && this.opts.hitHappen(type, message);
    },
    // 判断一个对象是否在一个虚拟盒子场景中
    checkVRBox: function(object) {
        var num = Math.sqrt(this.config.vrbox);
        var boxSize = {
            width: this.scene.width / num,
            height: this.scene.height / num
        };
        var index = -1;
        for (var i = 0; i < this.config.vrbox; i++) {
            var inX = false;
            var inY = false;
            if (_.inRange(object.x, boxSize.width * (i % num), boxSize.width * (i % num + 1))) inX = true;
            if (_.inRange(object.y, boxSize.height * Math.floor(i / num), boxSize.height * (Math.floor(i / num) + 1))) inY = true;
            if (inX && inY) index = i;
        }
        return index;
    },
    // 碰撞检测
    circleCollision: function(p1, p2, r1, r2) {
        var x = Math.abs(p1.x - p2.x);
        var y = Math.abs(p1.y - p2.y);
        var b = Math.sqrt(x * x + y * y) <= (r1 + r2) ? true : false;
        return b;
    },
    // 游戏循环体
    ticker: function() {
        // todo
        var self = this;
        this.main();
        this.timer = setTimeout(function() {
            self.ticker();
        }, 1000 / 60);
    },
    // 游戏主逻辑
    main: function() {
        var self = this;
        _.forEach(this.shellList, function(shell, key) {
            shell.move(self.shellList);
            var boxIndex = self.checkVRBox(shell);
            if (boxIndex > 0) {
                _.forEach(self.userListVR[boxIndex], function(user, key) {
                    var collision = self.circleCollision({
                        x: shell.x,
                        y: shell.y
                    }, {
                        x: user.x,
                        y: user.y
                    }, shell.modelSize, user.modelSize);
                    if (collision && shell.owner != user.id) {
                        // 炮弹发生碰撞并且不是与自身发生碰撞
                        self.hitHappen(1, {
                            shell: shell,
                            user: user
                        });
                    }
                });
            }

            // console.log(self.userListVR[boxIndex])
            // console.log(shell)
        });
    },
    // 游戏开始
    start: function() {
        this.ticker();
        //console.log(this.userList[1000], this.userList[1002])
    },
    // 游戏结束
    stop: function() {
        this.timer = null;
    },
    // 生成随机数
    random: function(start, end) {
        !end && (end = start, start = 0);
        return Math.round(Math.random() * (end - start)) + start;
    }
};

Logic.prototype.constructor = Logic;

module.exports = new Logic();
