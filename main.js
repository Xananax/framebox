//see
//http://benvinegar.github.com/seamless-talk/
//https://developer.mozilla.org/en-US/docs/DOM/window.postMessage
//http://ejohn.org/blog/cross-window-messaging/

(function (name, deps, context, definition, i) {
  if (typeof define == 'function' && define.amd){
    define(deps,definition);
  }
  else if (typeof module != 'undefined' && module.exports){
    for(i=0; i<deps.length;i++){deps[i] = require[deps[i]] || null;}
    module.exports = definition.apply(context,deps);
  }
  else{
    for(i=0; i<deps.length;i++){deps[i] = context[deps[i]] || null;}
    (context.jQuery || context.ender || context.$ || context)[name] = definition.apply(context,deps);
  }
})('FrameBox', ['Route'], this, function(Route){

  var FrameBox = function(){
    this._iframes = {};
    this._callbacks = {};
    this._ids = 0;
    this.id;
    this.window = window;
    this.head = window.head;
    this._route;
    this._appendTo = document.body;
    this._origin = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    this.location = this._origin+location.pathname;
    //this._router = new Route();
  }

  FrameBox.prototype = {
    constructor: FrameBox
  , setup:function(iframes,routes,appendTo){
      this.register(iframes);
      this.on(routes);
      this._appendTo = appendTo;
      return this;
    }
  , isParent:function(){
      return this.id == 'parent';
    }
  , route:function(){
      if(!this._route){this._route = new Route();}
      return this._route;
    }
  , on:function(path,fn,name){
      if(typeof path != 'string'){
        for(var n in path){
          this.on(n,path[n]);
        }
        return this;
      }
      if((!name || name=='*')|| name == this.id){this.route().add(path,fn);}
      return this;
    }
  , trigger:function(path,properties,n){
      if(!n || n == '*'){
        for(var n in this._iframes){
          this.trigger(path,properties,n);
        }
        return this;
      }
      if(this._iframes[n]){
        this._iframes[n](path,properties);
      }
      return this;
    }
  , register:function(iframes){
      var scripts,l,i,title;
      l = (scripts = document.getElementsByTagName('script')).length;
      if(!l){return false;}
      for(i=0;i<l;i++){
        title = scripts[i].getAttribute('data-frame-title');
        if(title){break;}
      }
      if(!title){return false;}
      this.id = title;
      if(this.id == 'parent'){
        this.registerParent(iframes);
      }else{
        this.registerChild();
      }
    }
  , handshake:function(id,frame){
      frame.parent = this;
      frame.parentWindow = window;
      frame.setLinksTargets();
      this._iframes[id] = function(path,properties){
        frame.route().trigger(path,properties,frame);
      };
    }
  , setLinksTargets:function(){
      if(!this._baseSet){
        var base = '<BASE href="'+this.parent.location+'" target="_parent" />';
        console.log(base)
        document.body.innerHTML+=base;
        this._baseSet = true;
      }
      return this;
      /**
      var i, links = document.querySelectorAll('a:not([target]):not([class="frame-processed"])');
      if(i = links.length){
        for(i;i--;){
          links[i].className+=' frame-processed';
          links[i].setAttribute('target','_parent');
          console.log(links[i]);
        }
      }
      **/
    }
  , registerParent:function(iframes){
      var n,iframe,that = this,total;
      for(n in iframes){
        if(!(iframes[n] instanceof HTMLElement)){
          iframe = document.createElement("iframe");
          iframe.setAttribute('data-src',iframes[n]);
          iframe.orphan = true;
          iframe.seamless = true;
          iframes[n] = iframe;
        }else{
          iframe = iframes[n];
        }
        iframe.src = iframe.getAttribute('data-src');
        iframe.setAttribute('data-frame-title',n);
        iframe._register = function(id,el){
            el.contentWindow.postMessage('handshake','*')
        };
        total++;
      }
      for(n in iframes){
        if(iframes[n].orphan){
          this._appendTo.appendChild(iframes[n]);
        }
      }
    }
  , registerChild:function(){
      var that = this;
      var id = window.frameElement.getAttribute('data-frame-title');
      this.id = id;
      var handshake = function(e){
        window.removeEventListener('message',handshake);
        if(e.data == 'handshake'){e.source.FrameBox.handshake(id,that)}
      }
      window.addEventListener('message',handshake,false);
      window.frameElement._register(id,window.frameElement);
    }
  }

  return new FrameBox();

});