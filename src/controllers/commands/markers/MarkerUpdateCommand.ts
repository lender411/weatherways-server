import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import * as MarkersRepository from "../models/entities/MarkerEntity";
import { CommandResponse, Markers, MarkersSaveRequest } from "../../typeDefinitions";
import { MarkerEntity } from "../models/entities/MarkerEntity";

const validateSaveRequest = (saveMarkerRequest: MarkersSaveRequest): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };

	if (saveMarkerRequest.id == null) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2025;
	} else if ((saveMarkerRequest.MarkerID == null) || isNaN(saveMarkerRequest.MarkerID)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if (saveMarkerRequest.MarkerID < 0) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	}

	return validationResponse;
};

export const execute = async (saveMarkersRequest: MarkersSaveRequest): Promise<CommandResponse<Markers>> => {
	const validationResponse: CommandResponse<Markers> = validateSaveRequest(saveMarkersRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	let updateTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((startedTransaction: Sequelize.Transaction): Promise<MarkerEntity[]> => {
			updateTransaction = startedTransaction;

			return MarkersRepository.queryById(<string>saveMarkersRequest.id, updateTransaction);
		}).then((queriedMarker: (MarkerEntity[] | null)): Promise<MarkerEntity> => {
			if (queriedMarker == null) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 404,
					message: ErrorCodeLookup.EC1001
				});
			}
			const request = require("request");
			const openWeatherKey = "80f0f7a1ea95a376129420c77fe45bb9";
			const url = `http://api.openweathermap.org/data/2.5/weather?lat=${saveMarkersRequest.Latitude}&lon=${saveMarkersRequest.Longitude}&appid=${openWeatherKey}`;
			let json = "";

			request(url, function (err, response, body) {
				if(err) {
					console.log("error:", err);
				} else {
					json = body;
					console.log("body:", body);
				}
			});

			const weather = JSON.parse(json);

			return queriedMarker.update(
				<Object>{

					Temperature: weather.main.temp,
					Longitude: saveMarkersRequest.Longitude,
					Latitude: saveMarkersRequest.Latitude,
					ArrivalTime: saveMarkersRequest.ArrivalTime,
					precipChance: weather.clouds.all

				},
				<Sequelize.InstanceUpdateOptions>{ transaction: updateTransaction });
		}).then((updatedMarker: MarkerEntity): Promise<CommandResponse<Markers>> => {
			updateTransaction.commit();

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 200,
				data: <Markers>{
					id: updatedMarker.id,
					MarkerID: updatedMarker.MarkerID,
					Latitude:updatedMarker.Latitude,
					ArrivalTime: Helper.formatDate(updatedMarker.ArrivalTime),
					Longitude:updatedMarker.Longitude,
					Temperature: updatedMarker.Temperature,
					precipChance: updatedMarker.precipChance,
					location: updatedMarker.location
				}
			});
		}).catch((error: any): Promise<CommandResponse<Markers>> => {
			if (updateTransaction != null) {
				updateTransaction.rollback();
			}

			return Promise.reject(<CommandResponse<Markers>>{
				status: (error.status || 500),
				message: (error.messsage || ErrorCodeLookup.EC1002)
			});
		});
};
