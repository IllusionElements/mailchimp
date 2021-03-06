import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

class MailChimpAPI {
	constructor() {
		const { apiKey } = Meteor.settings.private.mailChimp;
		this.apiKey = apiKey;
		this.methods = {
			lists: {
				subscribe({ list_id, subscriber_hash }) {
					return { type: 'PUT', endpoint: `/lists/${list_id}/members/${subscriber_hash}`};
				},
			},
		};
	}

	buildRequestArguments(type, options) {
		const payload = { auth: `mailchimp:${this.apiKey}` };

		if (type === 'GET') {
			payload.params = options || {};
		} else {
			payload.data = options || {};
		}

		return payload;
		}

	request(action, options) {
		const type = action.type;
		const url = `https://us9.admin.mailchimp.com/3.0${action.endpoint}`;
		const args = this.buildRequestArguments(type, options) 
		const request = HTTP.call(type, url, args);

		if (request.error) return request.error;
		return request;
	}

	action(action, method, params) {
		const methodToCall = this.methods[action][method](params);
		return this.request(methodToCall, params);
	}

	lists(method, params) {
		return this.action('lists', method, params);
	}
}

export const MailChimp = new MailChimpAPI();