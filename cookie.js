/**
 * Functionality over browser cookies.
 *
 * @module $cookie
 */

import * as $date from "./date";

/**
 * $cookie constants.
 * 
 * @private
 */
const _CONST = {
	EXPIRES: {
		MAX: "Fri, 31 Dec 9999 23:59:59 GMT",
		MIN: "Thu, 01 Jan 1970 00:00:00 GMT"
	}
};

/**
 * Set cookie. Default expiration is 30 days from creation.
 *
 * @param  {String} name
 * @param  {String} value
 * @param  {Object} [optsArg]
 * @param  {Number|String|Date} [optsArg.expiration=null] Cookie expiration
 * @param  {String} [optsArg.path=""] Cookie path
 * @param  {String} [optsArg.domain=""] Cookie domain
 * @param  {String} [optsArg.secure=""] Cookie secure
 * @return {Boolean}
 */
export function set(name, value, optsArg) {
	if (!name || /^(?:expires|max\-age|path|domain|secure)$/i.test(name)) { return false; }

	let opts = {
		expiration: $date.addDays(new Date(), 30),
		path: "",
		domain: "",
		secure: ""
	};

	let expires = "";
	
	if (opts.expiration) {
		switch (opts.expiration.constructor) {
			case Number:
				expires = opts.expiration === Infinity ? "; expires=" + _CONST.EXPIRES.MAX : "; max-age=" + opts.expiration;
				break;

			case String:
				expires = "; expires=" + opts.expiration;
				break;

			case Date:
				expires = "; expires=" + opts.expiration.toUTCString();
				break;
		}
	}

	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + (opts.domain ? "; domain=" + opts.domain : "") 
					+ (opts.path ? "; path=" + opts.path : "") + (opts.secure ? "; secure" : "");
	return true;
};

/**
 * Get cookies by her name.
 *
 * @param  {String} name
 * @return {String}
 */
export function get(name) {
	name = name || "";

	let cookieValue = null;

	if (document.cookie && document.cookie != '') {
		let cookies = document.cookie.split(';');

		cookies.every(cookie => {
			cookie = cookie.trim();

			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

				return false;
			}
			else return true;
		});
	}

	return cookieValue;
};

/**
 * Remove cookie.
 *
 * @param  {String} name Cookie name
 * @param  {String} [domain] Cookie domain
 * @param  {String} [path] Cookie path
 * @return {Boolean}
 */
export function remove(name, domain, path) {
	if (!contains(name)) {
		return false;
	}

	document.cookie = encodeURIComponent(name) + "=; expires=" + _CONST.EXPIRES.MIN + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "");

	return true;
};

/**
 * Document contains cookie?
 *
 * @param  {String} name Cookie name
 * @return {Boolean}
 */
export function contains(name) {
	if (!name) return false;

	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
};
