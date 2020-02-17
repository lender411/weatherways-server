import * as Helper from "../helpers/helper";
import { CommandResponse, Markers } from "../../typeDefinitions";
import * as ProductRepository from "../models/entities/productModel";
import { MarkersModel } from "../models/entities/productModel";

export const query = async (): Promise<CommandResponse<Markers[]>> => {
	return ProductRepository.queryAll()
		.then((existingProducts: MarkersModel[]): Promise<CommandResponse<Markers[]>> => {
			return Promise.resolve(<CommandResponse<Markers[]>>{
				status: 200,
				data: existingProducts.map<Markers>((existingProduct: MarkersModel) => {
					return <Markers>{
						id: existingProduct.id,
						MarkerID: existingProduct.MarkerID,
						Latitude: existingProduct.Latitude,
						ArrivalTime: Helper.formatDate(existingProduct.ArrivalTime),
						Longitude: existingProduct.Longitude,
						Temperature: existingProduct.Temperature,
						precipChance: existingProduct.precipChance,
						location: existingProduct.location
					};
				})
			});
		});
};
