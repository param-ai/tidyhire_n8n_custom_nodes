import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import {
	TIDYHIRE_BASE_API_PRODUCTION_URL,
	TIDYHIRE_BASE_API_STAGING_URL,
} from '../nodes/apiRequest';

export class TidyhireApi implements ICredentialType {
	name = 'tidyhireApi';

	displayName = 'Tidyhire API';

	icon: Icon = 'file:tidyhire.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Staging',
					value: 'staging',
				},
			],
			default: 'production',
			description: 'Choose the environment for the api',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Api-Key {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{ $credentials.environment === "production" ? "' +
				TIDYHIRE_BASE_API_PRODUCTION_URL +
				'" : "' +
				TIDYHIRE_BASE_API_STAGING_URL +
				'" }}',
			url: '/auth/test-api-key',
			json: true,
			ignoreHttpStatusErrors: true,
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'success',
					value: false,
					message: 'Invalid API Key, Contact Tidyhire Support.',
				},
			},
		],
	};
}
