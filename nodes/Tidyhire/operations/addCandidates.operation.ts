import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	updateDisplayOptions,
} from 'n8n-workflow';
import { projectProperties } from '../../common.descriptions';

import { apiRequest } from '../../apiRequest';

/* -------------------------------------------------------------------------- */
/*                                tidyhire:addCandidates                      */
/* -------------------------------------------------------------------------- */

const properties: INodeProperties[] = [
	...projectProperties,
	{
		displayName: 'Candidates',
		name: 'candidates',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Candidate',
		options: [
			{
				name: 'candidateValues',
				displayName: 'Candidate',
				values: [
					{
						displayName: 'Full Name',
						name: 'fullName',
						type: 'string',
						default: '',
						required: true,
						description: 'Full name of the candidate',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
						required: true,
						description: 'Email address of the candidate',
					},
					{
						displayName: 'Phone Number',
						name: 'phoneNumber',
						type: 'string',
						default: '',
						required: true,
						description: 'Phone number of the candidate (e.g., +91 7873476062)',
					},
				],
			},
		],
	},
];

const displayOptions = {
	show: {
		operation: ['addCandidates'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	try {
		const project_id = this.getNodeParameter('project', 0, undefined, {
			extractValue: true,
		});

		const candidatesInput = this.getNodeParameter('candidates', 0) as IDataObject;
		const candidateValues = (candidatesInput.candidateValues as IDataObject[]) || [];

		const candidates = candidateValues.map((candidate) => ({
			full_name: candidate.fullName as string,
			email: candidate.email as string,
			phone_number: candidate.phoneNumber as string,
		}));

		const payload: IDataObject = {
			candidates: candidates,
			source: 'csv',
		};

		const responseData = await apiRequest.call(
			this,
			'POST',
			`/api/project/${project_id}/pipeline/candidates/import-from-impler`,
			payload,
		);

		// Transform response to extract only key fields
		const transformedData = (responseData.data || []).map((item: IDataObject) => {
			const profile = item.profile as IDataObject;
			const contactInfo = profile?.contact_info as IDataObject;
			const phoneNumbers = (contactInfo?.phone_numbers as IDataObject[]) || [];

			return {
				_id: item._id,
				project: item.project,
				full_name: profile?.full_name,
				first_name: profile?.first_name,
				last_name: profile?.last_name,
				email: contactInfo?.recommended_email,
				phone_number: phoneNumbers[0]?.number || null,
				current_stage: item.current_stage,
				current_sub_stage: item.current_sub_stage,
			};
		});

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(transformedData),
			{ itemData: { item: 0 } },
		);
		returnData.push(...executionData);
	} catch (error) {
		if (this.continueOnFail()) {
			returnData.push({ json: { message: error.message, error } });
		}
		throw error;
	}

	return returnData;
}