/**
 * XMLHttpRequest cover class.
 * 
 * @module $http
 */

import * as $common from "./common";
import * as $location from "./location";

/**
 * Request types.
 *
 * @property {Object}
 * @param {Number} JSON
 * @param {Number} FORM_DATA
 */
export const POST_TYPES = {
	JSON: 1,
	FORM_DATA: 2
};

/**
 * Http methods.
 *
 * @property {Object}
 * @param {String} POST
 * @param {String} GET
 * @param {String} DELETE
 * @param {String} PATCH
 */
export const METHOD = {
	POST: "POST",
	GET: "GET",
	DELETE: "DELETE",
	PATCH: "PATCH"
};

/**
 * Create new XHR request, returns promise.
 *
 * @param  {Object} config
 * @param  {String} config.url URL
 * @param  {String} [config.method] Method from $http.METHOD
 * @param  {String} [config.postType] Post type from $http.POST_TYPES
 * @param  {Object|Array} [config.getData] Data, which will be send in the url (GET)
 * @param  {Object|FormData} [config.postData] Post data
 * @param  {Object} [config.headers] Additional headers
 * @return {Promise}
 */
export function createRequest(config) {
	return new Promise((resolve, reject) => {
		config = config || {};

		let request = new XMLHttpRequest();
		let method = config.method || METHOD.GET;
		let url = config.url || "";

		if (!url) {
			reject();
			return;
		}

		url = _updateURL(url, config.getData);

		request.onerror = (err) => { reject(err); };
		request.open(method, url, true);
		request.onreadystatechange = () => {
			if (request.readyState == 4) {
				let responseData = request.responseText || "";
				let responseType = request.getResponseHeader("Content-Type") || "";
				let promiseData = null;

				if (responseType.indexOf("application/json") != -1) {
					promiseData = responseData.length ? JSON.parse(responseData) : {};
				}
				else {
					promiseData = responseData;
				}
				
				let promiseObj = {
					status: request.status,
					data: promiseData,
					url: url,
					method: method
				};

				// 200 ok
				// 201 created
				// 204 succesfully deleted
				// 403 unautorized
				if (request.status >= 200 && request.status < 300) {
					resolve(promiseObj);
				}
				else {
					reject(promiseObj);
				}
			}
		};

		try {
			// add headers
			let headers = config.headers;
			
			if ($common.isObject(headers)) {
				Object.keys(headers).forEach(headerName => {
					request.setRequestHeader(headerName, headers[headerName]);
				});
			}

			if (method == METHOD.GET) {
				request.setRequestHeader('Accept', 'application/json');
			}

			let type = config.postType || POST_TYPES.JSON;

			if (config.postData && type == POST_TYPES.JSON) {
				request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
				request.send(JSON.stringify(config.postData));
			}
			else if (config.postData && type == POST_TYPES.FORM_DATA) {
				request.send(_preparePostData(config.postData));
			}
			else {
				request.send();
			}
		}
		catch (err) {
			reject(err);
		}
	});
};

export default createRequest;

/**
 * https://developer.mozilla.org/en-US/docs/Web/Guide/Using_FormData_Objects.
 * Prepare post data.
 *
 * @param  {Object|Array} data { name, value }
 * @return {Object}
 * @private
 */
function _preparePostData(data) {
	let formData = new FormData();

	if (data) {
		if (Array.isArray(data)) {
			data.forEach(item => {
				formData.append(item.name, item.value);
			});
		}
		else {
			Object.keys(data).forEach(key => {
				formData.append(key, data[key]);
			});
		}
	}

	return formData;
};

/**
 * Update URL using get data.
 *
 * @param  {String} url
 * @param  {Array} data { name, value }
 * @return {String}
 * @private
 */
function _updateURL(url, data) {
	let getURL = $location.objToURL(data);

	if (getURL) {
		url += (url.indexOf("?") == -1 ? "?" : "") + getURL;
	}

	return url;
};
