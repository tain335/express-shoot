module.exports = (function() {
	"use strict";
	return {
		mixin: function(to, from) {
			for(var key in from) {
				if(!(key in to)) {
					to[key] = from[key];
				}
			}
		}
	}
})();