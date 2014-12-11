function Bounds(canWidth, canHeight) {
    var pInf = Number.POSITIVE_INFINITY,
        nInf = Number.NEGATIVE_INFINITY;
    this.canHeight = canHeight;
    this.canWidth = canWidth;
    this._set = false;
    this.min = { x: pInf, y: pInf };
    this.max = { x: nInf, y: nInf };
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
}

Bounds.prototype.update = function(oldX, oldY, state) {
    this.min.x = Math.min(this.min.x, oldX, state.x);
    this.max.x = Math.max(this.max.x, oldX, state.x);
    this.min.y = Math.min(this.min.y, oldY, state.y);
    this.max.y = Math.max(this.max.y, oldY, state.y);
};

Bounds.prototype.getCb = function () {
    return this.update.bind(this);
};

Bounds.prototype.finalize = function () {
    var centerX = (this.min.x + this.max.x) / 2,
        centerY = (this.min.y + this.max.y) / 2,
        scaleX, scaleY;
    console.log(centerX, centerY);
    scaleX = (this.max.x - this.min.x) / this.canWidth;
    scaleY = (this.max.y - this.min.y) / this.canHeight;
    this.invScale = Math.max(scaleX, scaleY) || 1;
    this.scale = 1 / this.invScale;
    this.offsetX = centerX - this.invScale * this.canWidth / 2;
    this.offsetY = centerY - this.invScale * this.canHeight / 2;
};

function drawCback(ctx, b) {
    return function (oldX, oldY, state) {
        // TODO: Color
        var srcX = (oldX - b.offsetX) * b.scale,
            srcY = (oldY - b.offsetY) * b.scale,
            dstX = (state.x - b.offsetX) * b.scale,
            dstY = (state.y - b.offsetY) * b.scale;
        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.lineTo(dstX, dstY);
        ctx.stroke();
        ctx.closePath();
    };
}

function Turtle(cback) {
    this.state = {};
    this.state.x = 0;
    this.state.y = 0;
    this.state.angle = 0;
    this.state.color = 'black';
    this.stack = [];
    this.lineCback = cback;
}

Turtle.prototype.apply = function (cmd) {
    var oldX = this.state.x,
        oldY = this.state.y,
        draw = cmd.exec(this);
    if (draw === true && (oldX !== this.state.x || oldY !== this.state.y)) {
        this.lineCback(oldX, oldY, this.state);
    }
};

function findEnd(parts, i) {
    var c = 0;
    while (i < parts.length) {
        if (parts[i] == ')') {
            if (c === 0) {
                return i;
            }
            c--;
        } else if (parts[i] == '(') {
            c++;
        }
        i++;
    }
}

function nestParens(parts) {
    var i = 0, j, subExp;
    while (i < parts.length) {
        if (parts[i] == '(') {
            j = findEnd(parts, i + 1);
            if (j == parts.length) {
                throw new Error('Mismatched parens');
            }
            subExp = parts.splice(i, j - i);
            parts[i] = subExp.slice(1);
            nestParens(parts[i]);
        } else if (parts[i] == ')') {
            throw new Error('Mismatched parens');
        }
        i++;
    }
    return parts;
}

function tokenizeAndParse(text) {
    text = text.replace(/\(/g, ' ( ');
    text = text.replace(/\)/g, ' ) ');
    text = text.replace(/\t/g, ' ');
    var parts = text.split(' '), i, j;
    for (i = parts.length - 1; i >= 0; i--) {
        parts[i] = parts[i].trim();
        if (parts[i].length === 0) {
            parts.splice(i, 1);
        }
    }
    nestParens(parts);
    return parts;
}

function assertLen(args, len) {
    if (args.length !== len) {
        throw new Error('Illegal number of arguments');
    }
}

function EmptyCommand(args) {}

EmptyCommand.prototype.exec = function (turtle) {};

function clone(obj) {
    var ret = {}, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            ret[key] = obj[key];
        }
    }
    return ret;
}

function PushCommand(args) {
    assertLen(args, 0);
}

PushCommand.prototype.exec = function (turtle) {
    turtle.stack.push(clone(turtle.state));
};

function PopCommand(args) {
    assertLen(args, 0);
}

PopCommand.prototype.exec = function (turtle) {
    turtle.state = turtle.stack.pop();
};

function MoveCommand(args, forward) {
    assertLen(args, 1);
    this.disp = parseInt(args[0]);
    if (forward === false) {
        this.disp = -this.disp;
    }
}

MoveCommand.prototype.exec = function (turtle) {
    turtle.state.x += Math.sin(turtle.state.angle) * this.disp;
    turtle.state.y += Math.cos(turtle.state.angle) * this.disp;
    return true;
};


function ColorCommand(args) {
    assertLen(args, 1);
    this.color = args[0];
}

ColorCommand.prototype.exec = function (turtle) {
    turtle.state.color = this.color;
};

function RotateCommand(args, dir) {
    assertLen(args, 1);
    this.angle = dir * Math.PI / 180 * parseInt(args[0]);
}

RotateCommand.prototype.exec = function (turtle) {
    turtle.state.angle += this.angle;
};


function RepeatCommand(args) {
    assertLen(args, 2);
    this.times = parseInt(args[0]);
    this.cmd = getCommand(args[1]);
}

RepeatCommand.prototype.exec = function (turtle) {
    var i;
    for (i = 0; i < this.times; i++) {
        turtle.apply(this.cmd);
    }
};

function DoCommand(args) {
    var i;
    this.cmds = [];
    for (i = 0; i < args.length; i++) {
        this.cmds.push(getCommand(args[i]));
    }
}

DoCommand.prototype.exec = function (turtle) {
    var i;
    for (i = 0; i < this.cmds.length; i++) {
        turtle.apply(this.cmds[i]);
    }
};

function parseLogoCmd(text) {
    var repr = tokenizeAndParse(text);
    if (repr.length === 0) {
        throw new Error('Empty command');
    }
    return getCommand(repr);
}

function getCommand(repr) {
    var cmd, args;
    if (repr[0] instanceof Array && repr.length == 1) {
        getCommand(repr[0]);
    }
    cmd = repr[0];
    args = repr.slice(1);
    if (typeof cmd !== 'string') {
        throw new Error('Command not string!');
    }
    switch (cmd) {
        case 'PUSH': return new PushCommand(args);
        case 'POP': return new PopCommand(args);
        case 'FD': return new MoveCommand(args, true);
        case 'BK': return new MoveCommand(args, false);
        case 'COLOR': return new ColorCommand(args);
        case 'RT': return new RotateCommand(args, 1);
        case 'LT': return new RotateCommand(args, -1);
        case 'REPEAT': return new RepeatCommand(args);
        case 'DO': return new DoCommand(args);
        default:
            throw new Error('Unrecognized logo command, ' + cmd);
    }
}
