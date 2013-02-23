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
})('Route', [], this, function(){

	var slice = Array.prototype.slice;

	var Route = function(){
		this._paths = [];
		this._regexes = [];
		this._fns = [];
		this._keys = [];
	}

	Route.prototype = {
		constructor: Route
	,   pathToRegexp: function(path, keys, options) {
			options = options || {};
			keys = keys || [];
			var sensitive = options.sensitive
			,   strict = options.strict;

			if (path instanceof RegExp) return path;
			if (path instanceof Array) path = '(' + path.join('|') + ')';

			path = path
				.concat(strict ? '' : '/?')
				.replace(/\/\(/g, '(?:/')
				.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
					keys.push({ name: key, optional: !! optional });
					slash = slash || '';
					return ''
						+ (optional ? '' : slash)
						+ '(?:'
						+ (optional ? slash : '')
						+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
						+ (optional || '')
						+ (star ? '(/*)?' : '');
				})
				.replace(/([\/.])/g, '\\$1')
				.replace(/\*/g, '(.*)');
			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		}
	,   add: function(path,fn){
			var keys, i = this._paths.indexOf(path)
			if(i<0){
				i = this._paths.push(path) - 1;
				this._regexes.push(this.pathToRegexp(path,keys=[]));
				this._keys.push(keys);
			}
			(this._fns[i] = this._fns[i] || []).push(fn);
			return this;
		}
	,   trigger:function(path,props,context){
			var isMatch
			,   result
			,   parts
			,   u
			,   i = 0
			,   r = this._regexes
			,   l = r.length;
			for(i;i<l;i++){
				isMatch = r[i].test(path)
				if(isMatch){
					parts = {_full:path};
					result = r[i].exec(path);
					keys = this._keys[i];
					keysN = keys.length
					fns = this._fns[i];
					for(u=0;u<keysN;u++){
						parts[keys[u].name] = result[u+1] || '';
					}
					for(u=0;u<fns.length;u++){
						fns[u].call(context,props,parts);
					}
				}
			}
			return this;
		}
	}

	return Route;

})