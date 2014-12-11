var can, ctx, lsys, count = 0;


function sI(id) {
    return document.getElementById(id);
}

function turtleExec(cb) {
    var turtle = new Turtle(cb);
    lsys._string.forEach(function (sym) {
        turtle.apply(sym.logoCmd);
    });
}
function draw() {
    ctx.clearRect(0, 0, 800, 600);
    var bounds = new Bounds(800, 600);
    log('Calculating bounds');
    turtleExec(bounds.getCb());
    bounds.finalize();
    log('Drawing to canvas');
    turtleExec(drawCback(ctx, bounds));
    lsys.iterate();
    log('Iteration ' + count);
    count += 1;
}

function parse() {
    var axiomTxt = sI('axiom-txt').value,
        rulesTxt = sI('grammar-txt').value.split('\n').filter(stringNotEmpty),
        drawsTxt = sI('draw-txt').value.split('\n').filter(stringNotEmpty);
    try {
        lsys = parseLsys(axiomTxt, rulesTxt, drawsTxt);
        count = 0;
        sI('iterate-button').disabled = false;
        log('Parse OK');
    } catch (e) {
        log(e, true);
    }
}

function log(txt, err) {
    var lA = sI('log-area');
    if (err === true) {
        lA.className = 'error';
    } else {
        lA.className = '';
    }
    lA.innerHTML = txt;
}

function init() {
    can = sI('main-canvas');
    can.width = 800;
    can.height = 600;
    ctx = can.getContext('2d');
    sI('parse-button').onclick = parse;
    sI('iterate-button').disabled = true;
    sI('iterate-button').onclick = draw;
    sI('load-preset-btn').onclick = loadPreset;
    addPresets();
}


function addPresets() {
    function set(grammar, draw, axiom) {
        return function () {
            sI('grammar-txt').value = grammar;
            sI('draw-txt').value = draw;
            sI('axiom-txt').value = axiom;
        };
    }
    function addOption(name, func) {
        var opt = document.createElement('option');
        opt.text = name;
        opt.triggerFunc = func;
        sI('preset-select').add(opt);
    }
    addOption('Tree',
        set('A : A A\nB : A X B Y B',
        'X = DO (PUSH) (RT 45)\nY = DO (POP) (LT 45)\nA = FD 10\nB = FD 10',
        'B')
    );
    addOption('Koch',
        set('F : F A F B F B F A F',
        'F = FD 10\nA = RT 90\nB = LT 90',
        'F')
    );
    addOption('Sierpinski triangle',
        set('A : B R A R B\nB : A L B L A',
        'A = FD 10\nB = FD 10\nR = RT 60\nL = LT 60',
        'A')
    );
}

function loadPreset() {
    var slt = sI('preset-select'),
        opt = slt.options[slt.selectedIndex];
    if (opt === undefined) {
        return;
    }
    opt.triggerFunc();
}

window.onload = init;
