import type {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { apiRequest } from '../apiRequest';
import { NodeApiError } from 'n8n-workflow';

export const webhookMethods = {
	async checkExists(this: IHookFunctions): Promise<boolean> {
		const webhookData = this.getWorkflowStaticData('node');

		if (webhookData.webhookId === undefined) {
			// No webhook id is set so no webhook can exist
			return false;
		}

		try {
			await apiRequest.call(this, 'GET', `/api/workspace/n8n-webhooks/${webhookData.webhookId}`);
		} catch (error) {
			if (error.httpCode === '404') {
				// Webhook does not exist
				delete webhookData.webhookId;
				delete webhookData.webhookEvents;
				delete webhookData.webhookSecret;

				return false;
			}

			// Some error occured
			throw error;
		}

		// If it did not error then the webhook exists
		return true;
	},

	async create(this: IHookFunctions): Promise<boolean> {
		const webhookUrl = this.getNodeWebhookUrl('default');

		const events = this.getNodeParameter('events', []);

		const project = this.getNodeParameter('project', undefined, {
			extractValue: true,
		}) as string;

		const body = {
			name:`tidyhire-workflow-${this.getNode().id}`,
			url: webhookUrl,
			events: events,
			project: project,
			upsert :true
		};

		const { data } = await apiRequest.call(this, 'POST', '/api/workspace/n8n-webhooks/create', body);

		if (!data) {
			// Required data is missing so was not successful
			throw new NodeApiError(this.getNode(), data as JsonObject, {
				message: 'Webhook creation response did not contain the expected data.',
			});
		}

		const webhookData = this.getWorkflowStaticData('node');
		webhookData.webhookId = data._id as string;
		webhookData.events = data.events as string[];

		return true;
	},
	async delete(this: IHookFunctions): Promise<boolean> {
		const webhookData = this.getWorkflowStaticData('node');

		if (webhookData.webhookId !== undefined) {
			const body = {};

			try {
				await apiRequest.call(
					this,
					'POST',
					`/api/workspace/n8n-webhooks/${webhookData.webhookId}/delete`,
					body,
				);
			} catch (error) {
				return false;
			}

			// Remove from the static workflow data so that it is clear
			// that no webhooks are registered anymore
			delete webhookData.webhookId;
			delete webhookData.webhookEvents;
			delete webhookData.webhookSecret;
		}

		return true;
	},

	async execute(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const req = this.getRequestObject();

		const events = this.getNodeParameter('events', []) as string[];
		const eventType = bodyData.event as string | undefined;

		if (eventType === undefined || (!events.includes('*') && !events.includes(eventType))) {
			// If not eventType is defined or when one is defined but we are not
			// listening to it do not start the workflow.
			return {};
		}

		return {
			workflowData: [this.helpers.returnJsonArray(req.body as IDataObject)],
		};
	},
};
