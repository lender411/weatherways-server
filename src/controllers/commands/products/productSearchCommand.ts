import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { CommandResponse, Markers } from "../../typeDefinitions";
import * as ProductRepository from "../models/entities/productModel";
import { MarkersModel } from "../models/entities/productModel";
import * as Helper from "../helpers/helper";

const validation = (validationQuery: string): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };

	if ((validationQuery == null) || (validationQuery.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2026B;
	}
	return validationResponse;
};

export const search = async (query: string): Promise<CommandResponse<Markers[]>> => {
	const validationResponse = validation(query);
	if (validationResponse.status !== 200)	{
		return Promise.reject(validationResponse);
	}

	return ProductRepository.searchAll(query)
		.then((existingProducts: MarkersModel[]): Promise<CommandResponse<Markers[]>> => {
			return Promise.resolve(<CommandResponse<Markers[]>>{
				status: 200,
				data: existingProducts.map<Markers>((existingProduct: MarkersModel) => {
					return <Markers>{
						id: existingProduct.id,
						MarkerID: existingProduct.MarkerID,
						Latitude:existingProduct.Latitude,
						ArrivalTime: Helper.formatDate(existingProduct.ArrivalTime),
						Longitude:existingProduct.Longitude,
						Temperature: existingProduct.Temperature,
						precipChance: existingProduct.precipChance,
						location: existingProduct.location
					};
				})
			});
		});
};