var _ = require('lodash');
var debug = require('debug')('planfix-api');
var crypto = require('crypto');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var xml2js = Promise.promisifyAll(require('xml2js'));
var js2xmlparser = require('js2xmlparser');
var assert = require('assert');

var BASE_URL = 'https://api.planfix.ru/xml/';
var STATUS_OK = 'ok';

var methods = [
	'auth.login',
	'task.add',
	'user.getList',
	'project.getList',
	'contact.getList', 'contact.add'
];

module.exports = function createApiClient (opts) {
	assert(opts.privateKey, 'privateKey param is required');
	assert(opts.apiKey, 'apiKey param is required');
	assert(opts.account, 'account param is required');

	// Used for requests auth
	var sid = null;

	var client = {};
	// Build methods
	methods.forEach(function (methodName) {
		_.set(client, methodName, createMethod(methodName));
	});

	function createMethod (methodName) {
		return function apiMethod (params) {
			params = _.extend({ account: opts.account }, params);

			var requestObject = _.extend({
				'@': { method: methodName }
			}, params);

			if (sid) {
				requestObject.sid = sid;
				params.sid = sid;
			}

			requestObject.signature = sign(methodName, params, opts.privateKey);

			var xmlRequest = js2xmlparser('request', requestObject);
			debug('xml request', xmlRequest);

			return request({
				url: BASE_URL,
				body: xmlRequest,
				auth: {
					user: opts.apiKey,
					password: 'x' // ignored by server
				}
			}).then(function (res) {
				debug('xml response', res.body);
				return xml2js.parseStringAsync(res.body, { trim: true, explicitRoot: false, explicitArray: false });
			}).then(function (res) {
				// In case of auth request - save sid
				if (res.sid) {
					sid = res.sid;
				}

				return res;
			});
		}
	}

	return client;
}

function sign (methodName, params, key) {
	return crypto.createHash('md5')
		.update(methodName + implodeElements(params) + key)
		.digest('hex');
}

function implodeElements(obj) {
	var result = '';
	var keys = Object.keys(obj);
	keys.sort();

	keys.forEach(function (key) {
		switch (true) {
			case Array.isArray(obj[key]):
				result += obj[key].map(implodeElements).join('');
			break;

			case typeof obj[key] === 'object':
				result += implodeElements(obj[key]);
			break;

			default:
				result += obj[key];
		}
	});

	return result;
}
