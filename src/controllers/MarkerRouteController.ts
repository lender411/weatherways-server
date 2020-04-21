import * as restify from "restify";
import * as MarkerQuery from "./commands/markers/MarkerQuery";

import { ParameterLookup, ErrorCodeLookup } from "./lookups/stringLookup";
import * as MarkerCreateCommand from "./commands/markers/MarkerCreateCommand";
import * as MarkerDeleteCommand from "./commands/markers/MarkerDeleteCommand";
import * as MarkerUpdateCommand from "./commands/markers/MarkerUpdateCommand";
import * as MarkersQueryCommand from "./commands/markers/MarkersQueryCommand";
import * as MarkersQueryAllCommand from "./commands/markers/MarkersQueryAllCommand";
import { CommandResponse, Markers, MarkersSaveRequest } from "./typeDefinitions";

export const queryMarkers = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	MarkersQueryCommand.query()
		.then((markersQueryCommandResponse: CommandResponse<Markers[]>) => {
			res.send(
				markersQueryCommandResponse.status,
				markersQueryCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC2001));

			return next();
		});
};

export const queryByUserId = (req: restify.Request, res: restify.Response, next: restify.Next) => {
	MarkersQueryAllCommand.queryAllbyUserID(req.params[ParameterLookup.id])
		.then((markerQueryCommandResponse: CommandResponse<Markers[]>) => {
			res.send(
				markerQueryCommandResponse.status,
				markerQueryCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC2002));

			return next();
		});
};
export const getAllUserId = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	MarkerQuery.queryAllID(req.params[ParameterLookup.id])
		.then((markerQueryCommandResponse: CommandResponse<Markers>) => {
			res.send(
				markerQueryCommandResponse.status,
				markerQueryCommandResponse.data);
			return next();
		}, (error: any) => {
			res.send(
				(error.stats || 500),
				(error.message || ErrorCodeLookup.EC2002));
			return next();
		});
};
export const queryMarkersByMarkerID = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	MarkerQuery.queryByMarkerID(req.params[ParameterLookup.MarkerID])
		.then((markerQueryCommandResponse: CommandResponse<Markers>) => {
			res.send(
				markerQueryCommandResponse.status,
				markerQueryCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC2002));

			return next();
		});
};

const saveMarker = async (
	req: restify.Request,
	res: restify.Response,
	next: restify.Next,
	performSave: (markerSaveRequest: MarkersSaveRequest) => Promise<CommandResponse<Markers>>): Promise<void> => {
	performSave(req.body)
		.then((markerSaveCommandResponse: CommandResponse<Markers>) => {
			res.send(
				markerSaveCommandResponse.status,
				markerSaveCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC1002));

			return next();
		});
};

export const createMarker = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	saveMarker(req, res, next, MarkerCreateCommand.execute);
};

export const updateMarker = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	saveMarker(req, res, next, MarkerUpdateCommand.execute);
};

export const deleteMarker = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	MarkerDeleteCommand.execute(req.params[ParameterLookup.id])
		.then((markerDeleteCommandResponse: CommandResponse<void>) => {
			res.send(markerDeleteCommandResponse.status);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC1003));

			return next();
		});
};
