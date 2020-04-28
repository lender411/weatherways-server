import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import * as MarkersRepository from "../models/entities/MarkersModel";
import { CommandResponse, Markers, MarkersSaveRequest } from "../../typeDefinitions";
import { MarkersModel } from "../models/entities/MarkersModel";


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

	const request = require("request");
	const openWeatherKey = "80f0f7a1ea95a376129420c77fe45bb9";
	const url = `http://api.openweathermap.org/data/2.5/weather?lat=${saveMarkersRequest.Latitude}&lon=${saveMarkersRequest.Longitude}&appid=${openWeatherKey}&units=imperial`;
	var json = ""; //not a const anymore

	json = Promise((reslove, reject) => {
		request(url, function (err, response, body) {
			if (err) {
				console.log("error:", err);
				reject(err);
			} else {
				reslove(body);
				console.log("\n\nbody:", body);
			}
		});
	});

	console.log("\n\njson:", json);
	const weather = JSON.parse(json);

	const markerToCreate: MarkersModel = <MarkersModel>{
		id:saveMarkersRequest.id,
		Temperature: weather.main.temp,
		MarkerID: saveMarkersRequest.MarkerID,
		precipChance: weather.clouds.all,
		Latitude: saveMarkersRequest.Latitude,
		Longitude: saveMarkersRequest.Longitude,
		location: saveMarkersRequest.location,
		ArrivalTime: saveMarkersRequest.ArrivalTime

	};

	let createTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction() 
		.then((createdTransaction: Sequelize.Transaction): Promise<MarkersModel | null> => {
			createTransaction = createdTransaction;

			return MarkersRepository.queryByMarkerID(
				saveMarkersRequest.MarkerID,
				createTransaction);
		}).then((existingMarker: (MarkersModel | null)): Promise<MarkersModel> => {
			if (existingMarker != null) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 409,
					message: ErrorCodeLookup.EC2029
				});
			}

			return MarkersModel.create(
				markerToCreate,
				<Sequelize.CreateOptions>{
					transaction: createTransaction
				});
		}).then((createdMarker: MarkersModel): Promise<CommandResponse<Markers>> => {
			createTransaction.commit();

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 201,
				data: <Markers>{
					id: createdMarker.id,
					MarkerID: createdMarker.MarkerID,
					location: createdMarker.location,
					ArrivalTime: Helper.formatDate(createdMarker.ArrivalTime),
					Longitude: createdMarker.Longitude,
					Latitude: createdMarker.Latitude,
					Temperature: createdMarker.Temperature,
					precipChance: createdMarker.precipChance
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
