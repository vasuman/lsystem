function Symbol(rep) {
    this.rep = rep;
    this.logoCmd = new EmptyCommand();
}

function Set() {
    this._map = {};
}

Set.prototype.addOrGet = function (item) {
    if (this.has(item)) {
        return this.get(item);
    }
    var sym = new Symbol(item);
    this._map[item] = sym;
    return sym;
};

Set.prototype.has = function (item) {
    return this._map.hasOwnProperty(item);
};

Set.prototype.get = function (item) {
    return this._map[item];
};

Set.prototype.getItems = function() {
    var items = [], key, i;
    for (key in this._map) {
        i = this._map[key];
        if (i instanceof Symbol) {
            items.push(i);
        }
    }
    return items;
};

function flatten (rep) {
    var res = [], i;
    for (i = 0; i < rep.length; i++) {
        if (rep[i] instanceof Array) {
            res.push.apply(res, flatten(rep[i]));
        } else {
            res.push(rep[i]);
        }
    }
    return res;
}

function RewriteRule(startSym, expansion) {
    this.start = startSym;
    this.exp = expansion;
}

RewriteRule.prototype.consume = function (cStr) {
    var i, ret = [], self = this;
    return cStr.map(function (term) {
        if (term === self.start) {
            return self.exp;
        }
        return term;
    });
};

function Lsystem(syms, rules, axiom) {
    this.syms = syms;
    this.rules = rules;
    this.axiom = axiom;
    this._string = axiom;
}

Lsystem.prototype.iterate = function () {
    var nextString = this._string;
    this.rules.forEach(function (rule) {
        nextString = rule.consume(nextString);
    });
    this._string = flatten(nextString);
};

function stringNotEmpty(str) {
    return str.length !== 0;
}

function isValidSym(str) {
    return str.match(/^\w[\w\d]*$/) !== null;
}

function parseLsys(axiomTxt, rulesTxt, drawsTxt) {
    var syms = new Set(), rules, axiom;
    function toSymArr(str) {
        var toks = str.replace(/\s/g, ' ').split(' ').filter(stringNotEmpty);
        return toks.map(function (tok) {
            if (!isValidSym(tok)) {
                throw new Error('Invalid symbol ' + tok);
            }
            return syms.addOrGet(tok);
        });
    }
    function parseRule(ruleTxt) {
        var parts = ruleTxt.split(':'), startStr, startSym, exp;
        if (parts.length !== 2) {
            throw new Error('Invalid rule, ' + ruleTxt);
        }
        startStr = parts[0].trim();
        if (!isValidSym(startStr)) {
            throw new Error('Invalid start symbol, ' + startStr);
        }
        startSym = syms.addOrGet(startStr);
        exp = toSymArr(parts[1]);
        return new RewriteRule(startSym, exp);
    }
    function parseDrawTxt(drawCmd) {
        var parts = drawCmd.split('='),
            sym;
        if (parts.length !== 2) {
            throw new Error('Invalid draw command, ' + drawCmd);
        }
        sym = syms.addOrGet(parts[0].trim());
        sym.logoCmd = parseLogoCmd(parts[1]);
    }
    axiom = toSymArr(axiomTxt);
    rules = rulesTxt.map(parseRule);
    drawsTxt.forEach(parseDrawTxt);
    return new Lsystem(syms, rules, axiom);
}
