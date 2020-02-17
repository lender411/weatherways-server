import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import * as ProductRepository from "../models/entities/productModel";
import { CommandResponse, Markers, MarkersSaveRequest } from "../../typeDefinitions";
import { MarkersModel } from "../models/entities/productModel";

const validateSaveRequest = (saveMarkersRequest: MarkersSaveRequest): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };

	if ((saveMarkersRequest.location == null) || (saveMarkersRequest.location.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2026;
	} else if ((saveMarkersRequest.MarkerID == null) || isNaN(saveMarkersRequest.MarkerID)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if (saveMarkersRequest.MarkerID < 0) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	} else if (saveMarkersRequest.id == null) {
        validationResponse.status = 422;
        validationResponse.message = ErrorCodeLookup.EC2028B;
    }

	return validationResponse;
};

export const execute = async (saveMarkersRequest: MarkersSaveRequest): Promise<CommandResponse<Markers>> => {
	const validationResponse: CommandResponse<Markers> = validateSaveRequest(saveMarkersRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	const productToCreate: MarkersModel = <MarkersModel>{
		id:saveMarkersRequest.id,
		Temperature: saveMarkersRequest.Temperature,
		MarkerID: saveMarkersRequest.MarkerID,
		precipChance: saveMarkersRequest.precipChance,
		Latitude: saveMarkersRequest.Latitude,
		Longitude: saveMarkersRequest.Longitude,
		location: saveMarkersRequest.location,
		ArrivalTime: saveMarkersRequest.ArrivalTime

	};

	let createTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction() 
		.then((createdTransaction: Sequelize.Transaction): Promise<MarkersModel | null> => {
			createTransaction = createdTransaction;

			return ProductRepository.queryByLookupCode( 
				saveMarkersRequest.MarkerID,
				createTransaction);
		}).then((existingProduct: (MarkersModel | null)): Promise<MarkersModel> => {
			if (existingProduct != null) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 409,
					message: ErrorCodeLookup.EC2029
				});
			}

			// return ProductRepository.create(productToCreate, createTransaction);
			return MarkersModel.create(
				productToCreate,
				<Sequelize.CreateOptions>{
					transaction: createTransaction
				});
		}).then((createdProduct: MarkersModel): Promise<CommandResponse<Markers>> => {
			createTransaction.commit();

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 201,
				data: <Markers>{
					id: createdProduct.id,
					MarkerID: createdProduct.MarkerID,
					location: createdProduct.location,
					ArrivalTime: Helper.formatDate(createdProduct.ArrivalTime),
					Longitude: createdProduct.Longitude,
					Latitude: createdProduct.Latitude,
					Temperature: createdProduct.Temperature,
					precipChance: createdProduct.precipChance
				}
			});
		}).catch((error: any): Promise<CommandResponse<Markers>> => {
			if (createTransaction != null) {
				createTransaction.rollback();
			}

			return Promise.reject(<CommandResponse<Markers>>{
				status: (error.status || 500),
				message: (error.message || ErrorCodeLookup.EC1002)
			});
		});
};
