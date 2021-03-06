/*!
 * dejavu.js v 0.2.0
 * http://github.com/composite/Dejavu.js/
 *
 *
 * Copyright 2016 Ukjin 'Composite' Yang.
 * Released under the MIT license
 * http://github.com/composite/Dejavu.js/LICENSE
 *
 */
/*var Dejavu = */!function(){
    'use strict';
    var isf = function(f){return typeof f === 'function';};
    if(isf(window.CustomEvent))
        window.CustomEvent = function(type, params){
            params = params || { bubbles: false, cancelable: false, detail: void 0 };
            var b = !!params.bubbles, c = !!params.cancelable, d = params.detail, e;
            if(isf(document.createEvent)){
                e = document.createEvent('CustomEvent');
                e.initCustomEvent(type, b, c, d);
            }else{
                e = document.createEventObject();
                e.bubbles = b;
                e.cancelable = c;
                e.detail = d;
            }
            return e;
        };
    //global event and type name
    var vd = void 0,EVENT_FUNC = 'v' != '\v' ? 'addEventListener' : 'attachEvent', EVENT_ON = 'v' != '\v' ? '' : 'on',
        // is enumerable?
        isc = function(ar){return ar.length === [].slice.call(ar, 0).length;},
        // make element with function
        mkel = function(t, f){var el = document.createElement(t); if(isf(f)) f.call(el, t); return el;},
        // dejavu members
        ns   = {ev: 'DEJAVU_SCROLLEV', ch: 'DEJAVU_CHILDREN', op: 'DEJAVU_OPTION', po: 'DEJAVU_POSITION', on: 'DEJAVU_EVENT'}, DEJAVU_AFFECTED = [],
        // array indexof
        inA  = function(a, b, c){for(var i=0,l=a.length; a<l; a++) if(c ? a[i] === b : a[i] == b) return i; return -1;},
        // is string?
        isS  = function(s){return typeof s === 'string' || s instanceof String;},
        // get scroll position
        getS = function(){return {
                x: window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
                y: window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        };}, trace = function(m){if(window.Dejavu.debug) console.debug(m);},
        getXY = function(){
            var h = document.documentElement;
            return {
                x: Math.max(h.clientWidth, window.innerWidth || 0),
                y: Math.max(h.clientHeight, window.innerHeight || 0)
            };
        },
        scr = getXY(),
        fire = function(target, type, e){ return isf(target.dispatchEvent) ? target.dispatchEvent(e) : target.fireEvent(type, e); },
        // dejavu methods
        met  = {
            /**
             * enable or disable dejavu effect.
             * @param  {Boolean} b true if you want enable dejavu effect. false otherwise.
             * @return {Dejavu}    the dejavu object of current element.
             */
            enable: function(b){
                trace(this[ns.po].ENABLE = !!b);
                return this.dejavu;
            },
            /**
             * toggle random effect when argument set, or show random slide immediately.
             * @param  {Boolean} b true or false if you want random slide on or off. move to random slide if not set.
             * @return {Dejavu}    the dejavu object of current element.
             */
            random: function(b){
                if(b !== vd) trace(this[ns.po].RANDOM = !!b);
                else this.dejavu.render(~~(Math.random() * this[ns.po].LENGTH));
                return this.dejavu;
            },
            /**
             * move to next slide.
             * @return {Dejavu}    the dejavu object of current element.
             */
            next: function(){
                trace(this[ns.po].CURRENT++);
                if(this[ns.po].CURRENT == this[ns.po].LENGTH) this[ns.po].CURRENT = 0;
                return this.dejavu.render();
            },
            /**
             * move to previous slide.
             * @return {Dejavu}    the dejavu object of current element.
             */
            prev: function(){
                trace(this[ns.po].CURRENT--);
                if(this[ns.po].CURRENT < 0) this[ns.po].CURRENT = this[ns.po].LENGTH - 1;
                return this.dejavu.render();
            },
            /**
             * render slide position.
             * @param  {Number} n  the slide position. if not set, current position will be used.
             * @return {Dejavu}    the dejavu object of current element.
             */
            render: function(n){
                n = isNaN(n) ? this[ns.po].CURRENT : ~~n;
                for(var i=0,cs=this[ns.ch],len=cs.length;i<len;i++){
                    // if child node has been removed. update and rerun.
                    if(cs[i].parentNode != this){
                        trace('[DEJAVU] has been removed from parent. updating...');
                        this.dejavu.update();
                        return this.dejavu.prev();
                    }
                    if(i != n) cs[i].setAttribute('hidden', 'hidden');
                    else cs[i].removeAttribute('hidden');
                }
                return this.dejavu;
            },
            /**
             * shuffle slide queue.
             * @return {Dejavu}    the dejavu object of current element.
             */
            shuffle: function(){
                this[ns.ch].sort(function(){return ~~(Math.random() * 3) - 1;});
                return this.dejavu;
            },
            /**
             * sort slide queue if you want.
             * @param  {Function} fn [description]
             * @return {Dejavu}    the dejavu object of current element.
             */
            sort: function(fn){
                this[ns.ch].sort(fn);
                return this.dejavu;
            },
            /**
             * destroy Dejavu object and return to plain object.
             * @return {Element}    the current element.
             */
            destroy: function(){
                return window.Dejavu.destroy(this);
            },
            /**
             * update position for moved element position and children.
             * @param  {Boolean} b true if you want enable auto update when window resized. false to disable. update immediately if not set.
             * @return {Dejavu}    the dejavu object of current element.
             */
            update: function(b){

                if(b !== vd) this[ns.po].UPDATE = !!b;

                this[ns.ch].length = 0;
                for(var i=0, j=0,cs=this.childNodes,len=cs.length;i<len;i++){
                    if(cs[i].nodeType != 1) continue;

                    if(j != this[ns.po].CURRENT) cs[i].setAttribute('hidden', 'hidden');
                    else cs[i].removeAttribute('hidden');

                    this[ns.ch].push(cs[i]);
                    j++;
                }
                this[ns.po].LENGTH = this[ns.ch].length;
                trace('[DEJAVU] updated');

                var self = this;
                setTimeout(function(){
                    scr = getXY();
                    var rect = self.getBoundingClientRect(), sc = getS();
                    self[ns.po].MODEL = self[ns.po].MODEL || {};
                    self[ns.po].MODEL.top    = rect.top + sc.y;
                    self[ns.po].MODEL.bottom = rect.bottom + sc.y;
                    self[ns.po].MODEL.left   = rect.left + sc.x;
                    self[ns.po].MODEL.right  = rect.right + sc.x;
                    trace(self[ns.po].MODEL);
                }, 0);

                this.dejavu.emit('update');

                return this.dejavu;
            },
            /**
             * add dejavu event
             * @param  {[type]}   type [description]
             * @param  {Function} fn   [description]
             * @return {Dejavu}    the dejavu object of current element.
             */
            on: function(type, fn){
                if(type in this[ns.po].EVENT && isf(fn)){
                    this[ns.po].EVENT[type].push(fn);
                }
                return this.dejavu;
            },
            /**
             * remove dejavu event
             * @param  {[type]}   type [description]
             * @param  {Function} fn   [description]
             * @return {Dejavu}    the dejavu object of current element.
             */
            off: function(type, fn){
                var idx;
                if(type in this[ns.po].EVENT && ~(idx = inA(this[ns.po].EVENT[type], fn))){
                    this[ns.po].EVENT[type].splice(idx, 1);
                }
                return this.dejavu;
            },
            /**
             * trigger dejavu event
             * @param  {[type]}   type [description]
             */
            emit: function(type){
                if(type in this[ns.po].EVENT){
                    [].shift.call(arguments);
                    var self = this, args = arguments,
                        e = window.CustomEvent(ns.on, {
                            detail: {
                                args: args, type: type, position: this[ns.po].MODEL,
                                current: this[ns.po].CURRENT, length: this[ns.po].LENGTH,
                                inside: this[ns.po].STATUS, enable: this[ns.po].ENABLED
                            }
                        });
                    fire(this, EVENT_ON + ns.on, e);
                }
                return this.dejavu;
            },
            /**
             * returns a target dejavu element.
             * @return {HTMLElement}    the target element inside dejavu object.
             */
            target: function(){
                return this;
            }
        }

    //hidden property support for old browsers (IE < 11)
    if(typeof(document.hidden) === 'undefined')
        document.getElementsByTagName('head')[0].appendChild(mkel('style', function(){this.innerHTML = '*[hidden]{display:none;}'}));

    /**
     * Dejavu initialize function from any node you want.
     * @param  {mixed} root a node or nodes from any object. selector string.
     * @param  {object} op  options.
     * @return {mixed}      root
     */
    var Dejavu = function(root, op){

        if(!root) throw new Error('dejavu element(s) are not defined.');
        op = op || window.Dejavu.options;

        if(isS(root)) root = document.querySelectorAll(root) || document.getElementById(root);

        var _root = root, ext = function(a,p,m){a.dejavu[m] = function(){return p[m].apply(a, arguments)};};

        if(!isc(root)) root = [root];

        trace('[DEJAVU] Dejavu initialize');
        trace(root);trace(op);

        for(var idx = 0, max = root.length; idx < max; idx++){
            if(!root[idx] || ~inA(DEJAVU_AFFECTED, root[idx]) || root[idx].nodeType != 1) continue;

            root[idx][ns.ch] = [];
            root[idx][ns.op] = op;

            root[idx][ns.ev] = function(x, y){
                var po = this[ns.po];
                if(
                    (y + scr.y - po.MARGIN) > po.MODEL.top && (y + po.MARGIN) < po.MODEL.bottom &&
                    (x + scr.x - po.MARGIN) > po.MODEL.left && (x + po.MARGIN) < po.MODEL.right
                ){
                    if(!po.STATUS){
                        po.STATUS = true;
                        trace('[DEJAVU] in your eye side.');
                        trace([x,y,scr.x,scr.y,po.MARGIN,po.STATUS]);
                        trace(po.MODEL);
                        this.dejavu.emit('inside', x, y);
                    }
                }else{
                    if(po.STATUS){
                        po.STATUS = false;
                        trace('[DEJAVU] out of your eye side.');
                        trace([x,y,scr.x,scr.y,po.MARGIN,po.STATUS]);
                        trace(po.MODEL);
                        po.RANDOM ? this.dejavu.random() : this.dejavu.next();
                        this.dejavu.emit('outside', x, y);
                    }
                }
            };

            root[idx].dejavu = {};

            for(var m in met) ext(root[idx],met,m);
            for(var m in window.Dejavu.fn) ext(root[idx],window.Dejavu.fn,m);

            root[idx][ns.po] = {
                CURRENT: 0, LENGTH: 0, STATUS: false,
                ENABLED: 'enable' in op ? !!op.enable : window.Dejavu.options.enable,
                RANDOM:  'random' in op ? !!op.random : window.Dejavu.options.random,
                MARGIN:  !isNaN(op.margin) ? op.margin : window.Dejavu.options.margin,
                MODEL:   {top: 0, bottom: 0, right: 0, left: 0},
                UPDATE:  'update' in op ? !!op.update : window.Dejavu.options.update,
                EVENT:   {inside: [], outside: [], update: []}
            };

            for(var nm in root[idx][ns.po].EVENT)
                if(isf(op['on'+nm])) root[idx][ns.po].EVENT[nm].push(op['on'+nm]);

            root[idx].dejavu.update();
            root[idx].dejavu.render();

            !function(target){root[idx][EVENT_FUNC](EVENT_ON + ns.on, function(e){
                if(!e){
                    e = window.event;
                    e.currentTarget = target; 
                    e.preventDefault = function () { event.returnValue = false }; 
                    e.stopPropagation = function () { event.cancelBubble = true }; 
                    e.target = event.srcElement || target;
                }
                if(e.detail.type in target[ns.po].EVENT)
                    for(var i = 0, evs = target[ns.po].EVENT[e.detail.type], len = evs.length; i < len; i++){
                        !function(i, fn){
                            if(isf(fn)) fn.apply(target, e);
                        }(i, evs[i]);
                    }
            });}(root[idx]);

            DEJAVU_AFFECTED.push(root[idx]);
            if(isf(op.oninit)) op.oninit.call(root[idx], op);
        }

        return _root;
    };

    /**
     * destroy Dejavu object and return to plain object.
     * @param  {mixed} root a node or nodes from any object. selector string.
     * @return {mixed}      root
     */
    Dejavu.destroy = function(root){
        var _root = root;
        if(!isc(root)) root = [root];
        trace('[DEJAVU] Dejavu destroying');
        trace(root);
        for(var idx = 0, max = root.length; idx < max; idx++){
            if(!~inA(DEJAVU_AFFECTED, root[idx])) continue;
            for(var i=0,cs=root[idx].childNodes,len=cs.length;i<len;i++){
                if(cs.nodeType != 1) continue;

                cs[i].removeAttribute('hidden');
            }
            //delete root[idx].dejavu;
            root[idx].dejavu = vd;
            for(var x in ns) root[idx][ns[x]] = vd; //delete root[idx][ns[x]];
            DEJAVU_AFFECTED.splice(inA(root[idx]), 1);
        }
        return _root;
    };
    /**
     * dejavu options
     * enable: enable after initialze dejavu. default is true.
     * random: always move random slide when scroll outside element. default is false (move to next slide).
     * shuffle: shuffle slides afteer initialize dejavu. default is false.
     * update: always update when window resized. default is false.
     * oninit: additional initialize procedure if function set.
     * onoutside: emit event when client is not watch element completely.
     * oninside: emit event when client is starting for watch element.
     * onupdate: emit event when element position updated.
     * sort: the function that sort slide queue. default is null for not sort.
     * margin: when scrolling position is out of element position, allowed width of more out of position.
     * @type {Object}
     */
    Dejavu.options = {
        enable: true, random: false,
        shuffle: false, update: false,
        oninit: null,
        onoutside: null,
        oninside: null,
        onupdate: null,
        sort: null,
        margin: 10
    };
    /**
     * debug all dejavu objects.
     * @type {Boolean}
     */
    Dejavu.debug = false;
    /**
     * dejavu extension methods
     * @type {Object}
     */
    Dejavu.fn = {};

    //Dejavu global scroll event
    window[EVENT_FUNC](EVENT_ON + 'scroll', function(e){
        e = e || window.event;
        var sc = getS();
        for(var i=0,r=DEJAVU_AFFECTED,l=r.length;i<l;i++)
            r[i][ns.ev].call(r[i], sc.x, sc.y);
    });
    //Dejavu global resize event
    window[EVENT_FUNC](EVENT_ON + 'resize', function(){
        if(Dejavu.DEJAVU_RESIZE) clearTimeout(Dejavu.DEJAVU_RESIZE);
        Dejavu.DEJAVU_RESIZE = setTimeout(function(){
            for(var i=0,r=DEJAVU_AFFECTED,l=r.length;i<l;i++)
                if(r[i][ns.po].UPDATE) r[i].dejavu.update();
        }, 100);
    });

    //bind to global.
    return window.Dejavu = Dejavu;

}();
