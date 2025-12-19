import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import * as whatsapp from './Whatsapp/operations';
import * as tidyhire from './Tidyhire/operations';
import * as openai from './OpenAI/operations';
import * as AICall from './AICall/operations';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	let returnData: INodeExecutionData[] = [];

	const operation = this.getNodeParameter('operation', 0);

	try {
		switch (operation) {
			case 'getTemplates':
			case 'getTemplate':
			case 'sendTemplate':
			case 'sendSessionMessage':
			case 'sendAlert':
				returnData = await whatsapp[operation].execute.call(this);
				break;
			case 'startCall':
				returnData = await AICall[operation].execute.call(this);
				break;
			case 'getProjectDetails':
			case 'getCandidatesByStage':
			case 'moveCandidatesToSpecificStage':
			case 'setCustomFieldsInCandidates':
			case 'getCandidateDetails':
			case 'addCandidates':
				returnData = await tidyhire[operation].execute.call(this);
				break;
			case 'askChatgpt':
			case 'askAssistant':
			case 'extractStructuredData':
				returnData = await openai[operation].execute.call(this);
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	} catch (error) {
		if (
			error.description &&
			(error.description as string).includes('cannot accept the provided value')
		) {
			error.description = `${error.description}. Consider using 'Typecast' option`;
		}
		throw error;
	}
	console.log(returnData);
	return [returnData];
}