(function(){var root=this;var array=[];var push=array.push;var slice=array.slice;var splice=array.splice;var Backbone;if(typeof exports!=="undefined"){Backbone=exports}else{Backbone=root.Backbone={}}Backbone.VERSION="1.0.0";var _=root._;if(!_&&typeof require!=="undefined")_=require("underscore");var Events=Backbone.Events={on:function(name,callback,context){if(!eventsApi(this,"on",name,[callback,context])||!callback)return this;this._events||(this._events={});var events=this._events[name]||(this._events[name]=[]);events.push({callback:callback,context:context,ctx:context||this});return this},once:function(name,callback,context){if(!eventsApi(this,"once",name,[callback,context])||!callback)return this;var self=this;var called=false;var once=function(){if(called)return;called=true;self.off(name,once);callback.apply(this,arguments)};once._callback=callback;return this.on(name,once,context)},off:function(name,callback,context){var retain,ev,events,names,i,l,j,k;if(!this._events||!eventsApi(this,"off",name,[callback,context]))return this;if(!name&&!callback&&!context){this._events={};return this}names=name?[name]:Object.keys(this._events);for(i=0,l=names.length;i<l;i++){name=names[i];if(events=this._events[name]){this._events[name]=retain=[];if(callback||context){for(j=0,k=events.length;j<k;j++){ev=events[j];if(callback&&callback!==ev.callback&&callback!==ev.callback._callback||context&&context!==ev.context){retain.push(ev)}}}if(!retain.length)delete this._events[name]}}return this},trigger:function(name){if(!this._events)return this;var args=slice.call(arguments,1);if(!eventsApi(this,"trigger",name,args))return this;var events=this._events[name];var allEvents=this._events.all;if(events)triggerEvents(events,args);if(allEvents)triggerEvents(allEvents,arguments);return this},stopListening:function(obj,name,callback){var listeners=this._listeners;if(!listeners)return this;var deleteListener=!name&&!callback;if(typeof name==="object")callback=this;if(obj)(listeners={})[obj._listenerId]=obj;for(var id in listeners){listeners[id].off(name,callback,this);if(deleteListener)delete this._listeners[id]}return this}};var eventSplitter=/\s+/;var eventsApi=function(obj,action,name,rest){if(!name)return true;if(typeof name==="object"){for(var key in name){obj[action].apply(obj,[key,name[key]].concat(rest))}return false}if(eventSplitter.test(name)){var names=name.split(eventSplitter);for(var i=0,l=names.length;i<l;i++){obj[action].apply(obj,[names[i]].concat(rest))}return false}return true};var triggerEvents=function(events,args){var ev,i=-1,l=events.length;while(++i<l)(ev=events[i]).callback.apply(ev.ctx,args)};Events.bind=Events.on;Events.unbind=Events.off;Object.assign(Backbone,Events);var isEqual=function(a,b,aStack,bStack){if(a===b)return a!==0||1/a===1/b;if(a==null||b==null)return a===b;var className=toString.call(a);if(className!==toString.call(b))return false;switch(className){case"[object RegExp]":case"[object String]":return""+a===""+b;case"[object Number]":if(+a!==+a)return+b!==+b;return+a===0?1/+a===1/b:+a===+b;case"[object Date]":case"[object Boolean]":return+a===+b}var areArrays=className==="[object Array]";if(!areArrays){if(typeof a!="object"||typeof b!="object")return false;var aCtor=a.constructor,bCtor=b.constructor;if(aCtor!==bCtor&&!(typeof aCtor==="function"&&aCtor instanceof aCtor&&typeof bCtor==="function"&&bCtor instanceof bCtor)&&("constructor"in a&&"constructor"in b)){return false}}aStack=aStack||[];bStack=bStack||[];var length=aStack.length;while(length--){if(aStack[length]===a)return bStack[length]===b}aStack.push(a);bStack.push(b);if(areArrays){length=a.length;if(length!==b.length)return false;while(length--){if(!isEqual(a[length],b[length],aStack,bStack))return false}}else{var keys=Object.keys(a),key;length=keys.length;if(Object.keys(b).length!==length)return false;while(length--){key=keys[length];if(!(b.hasOwnProperty(key)&&isEqual(a[key],b[key],aStack,bStack)))return false}}aStack.pop();bStack.pop();return true};var Model=Backbone.Model=function(attributes,options){var defaults;var attrs=attributes||{};options||(options={});this.cid=_.uniqueId("c");this.attributes={};this.url=options.url||this.url;this.urlRoot=options.urlRoot||this.urlRoot;if(options.parse)attrs=this.parse(attrs,options)||{};defaults=typeof this.defaults==="function"?this.defaults():this.defaults;if(defaults){for(var prop in defaults){if(attrs[prop]===undefined){attrs[prop]=defaults[prop]}}}this.set(attrs,options);this.changed={};this.initialize.apply(this,arguments)};Object.assign(Model.prototype,Events,{changed:null,validationError:null,idAttribute:"id",initialize:function(){},toJSON:function(options){return Object.assign({},this.attributes)},sync:function(){return Backbone.sync.apply(this,arguments)},get:function(attr){return this.attributes[attr]},has:function(attr){return this.get(attr)!=null},set:function(key,val,options){var attr,attrs,unset,changes,silent,changing,prev,current;if(key==null)return this;if(typeof key==="object"){attrs=key;options=val}else{(attrs={})[key]=val}options=Object.assign({},options||{});if(!this._validate(attrs,options))return false;unset=options.unset;silent=options.silent;changes=[];changing=this._changing;this._changing=true;if(!changing){this._previousAttributes=Object.assign({},this.attributes);this.changed={}}current=this.attributes,prev=this._previousAttributes;if(this.idAttribute in attrs)this.id=attrs[this.idAttribute];for(attr in attrs){val=attrs[attr];if(!isEqual(current[attr],val))changes.push(attr);if(!isEqual(prev[attr],val)){this.changed[attr]=val}else{delete this.changed[attr]}unset?delete current[attr]:current[attr]=val}if(!silent){if(changes.length)this._pending=true;for(var i=0,l=changes.length;i<l;i++){this.trigger("change:"+changes[i],this,current[changes[i]],options)}}if(changing)return this;if(!silent){while(this._pending){this._pending=false;this.trigger("change",this,options)}}this._pending=false;this._changing=false;return this},unset:function(attr,options){return this.set(attr,void 0,Object.assign({},options,{unset:true}))},clear:function(options){var attrs={};for(var key in this.attributes)attrs[key]=void 0;return this.set(attrs,Object.assign({},options,{unset:true}))},fetch:function(options){options=options?Object.assign({},options):{};if(options.parse===void 0)options.parse=true;var model=this;var success=options.success;options.success=function(resp){if(!model.set(model.parse(resp,options),options))return false;if(success)success(model,resp,options);model.trigger("sync",model,resp,options)};wrapError(this,options);return this.sync("read",this,options)},save:function(key,val,options){var attrs,method,xhr,attributes=this.attributes;if(key==null||typeof key==="object"){attrs=key;options=val}else{(attrs={})[key]=val}if(attrs&&(!options||!options.wait)&&!this.set(attrs,options))return false;options=Object.assign({validate:true},options);if(!this._validate(attrs,options))return false;if(attrs&&options.wait){this.attributes=Object.assign({},attributes,attrs)}if(options.parse===void 0)options.parse=true;var model=this;var success=options.success;options.success=function(resp){model.attributes=attributes;var serverAttrs=model.parse(resp,options);if(options.wait)serverAttrs=Object.assign(attrs||{},serverAttrs);if(typeof serverAttrs==="object"&&!model.set(serverAttrs,options)){return false}if(success)success(model,resp,options);model.trigger("sync",model,resp,options)};wrapError(this,options);method=this.isNew()?"create":options.patch?"patch":"update";if(method==="patch")options.attrs=attrs;xhr=this.sync(method,this,options);if(attrs&&options.wait)this.attributes=attributes;return xhr},destroy:function(options){options=options?Object.assign({},options):{};var model=this;var success=options.success;var destroy=function(){model.trigger("destroy",model,options)};options.success=function(resp){if(options.wait||model.isNew())destroy();if(success)success(model,resp,options);if(!model.isNew())model.trigger("sync",model,resp,options)};if(this.isNew()){options.success();return false}wrapError(this,options);var xhr=this.sync("delete",this,options);if(!options.wait)destroy();return xhr},url:function(){var urlRoot=typeof this.urlRoot==="function"?this.urlRoot():this.urlRoot;var base=urlRoot||urlError();if(this.isNew())return base;return base+(base.charAt(base.length-1)==="/"?"":"/")+encodeURIComponent(this.id)},parse:function(resp,options){return resp},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return this.id==null},isValid:function(options){return this._validate({},Object.assign(options||{},{validate:true}))},_validate:function(attrs,options){if(!options.validate||!this.validate)return true;attrs=Object.assign({},this.attributes,attrs);var error=this.validationError=this.validate(attrs,options)||null;if(!error)return true;this.trigger("invalid",this,error,Object.assign(options||{},{validationError:error}));return false}});Backbone.sync=function(method,model,options){var type=methodMap[method];options=options||{};var params={type:type,dataType:"json"};if(!options.url){var url=typeof model.url==="function"?model.url():model.url;params.url=url||urlError()}if(options.data==null&&model&&(method==="create"||method==="update"||method==="patch")){params.contentType="application/json";params.data=JSON.stringify(options.attrs||model.toJSON(options))}if(params.type!=="GET"){params.processData=false}var xhr=options.xhr=Backbone.ajax(Object.assign(params,options));model.trigger("request",model,xhr,options);return xhr};var methodMap={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};Backbone.ajax=function(){throw new Error("Please specify an Ajax lib for Backbone.ajax")};var extend=function(protoProps,staticProps){var parent=this;var child;if(protoProps&&protoProps.hasOwnProperty("constructor")){child=protoProps.constructor}else{child=function(){return parent.apply(this,arguments)}}Object.assign(child,parent,staticProps);var Surrogate=function(){this.constructor=child};Surrogate.prototype=parent.prototype;child.prototype=new Surrogate;if(protoProps)Object.assign(child.prototype,protoProps);child.__super__=parent.prototype;return child};Model.extend=extend;var urlError=function(){throw new Error('A "url" property or function must be specified')};var wrapError=function(model,options){var error=options.error;options.error=function(resp){if(error)error(model,resp,options);model.trigger("error",model,resp,options)}}}).call(this);
//# sourceMappingURL=backbone-min.map