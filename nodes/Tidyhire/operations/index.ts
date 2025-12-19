import type { INodeProperties } from 'n8n-workflow';

// All Operations
import * as getCandidatesByStage from './getCandidatesByStage.operation';
import * as moveCandidatesToSpecificStage from './moveCandidatesToSpecificStage.operation';
import * as setCustomFieldsInCandidates from './setCustomFieldsInCandidates.operation';
import * as getCandidateDetails from './getCandidateDetails.operation';
import * as getProjectDetails from './getProjectDetails.operation';
import * as addCandidates from './addCandidates.operation';

export {
	getCandidatesByStage,
	moveCandidatesToSpecificStage,
	setCustomFieldsInCandidates,
	getCandidateDetails,
	getProjectDetails,
	addCandidates,
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get the project details',
				value: 'getProjectDetails',
				action: 'Get project details',
			},
			{
				name: 'Get all candidates by stage',
				value: 'getCandidatesByStage',
				action: 'Get all candidates by stage',
			},
			{
				name: 'Get the candidate details',
				value: 'getCandidateDetails',
				action: 'Get candidate details',
			},
			{
				name: 'Move candidate to specific stage in pipeline',
				value: 'moveCandidatesToSpecificStage',
				action: 'Move candidates to Specific Stage',
			},
			{
				name: 'Set custom fields in candidates',
				value: 'setCustomFieldsInCandidates',
				action: 'Set custom fields in candidates',
			},
			{
				name: 'Add candidates to project',
				value: 'addCandidates',
				action: 'Add candidates to project',
			},
		],
		default: 'getCandidatesByStage',
	},
	...getCandidatesByStage.description,
	...moveCandidatesToSpecificStage.description,
	...setCustomFieldsInCandidates.description,
	...getCandidateDetails.description,
	...getProjectDetails.description,
	...addCandidates.description,
];