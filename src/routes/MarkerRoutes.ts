import * as restify from "restify";
import { RouteLookup } from "../controllers/lookups/stringLookup";
import * as MarkerRouteController from "../controllers/MarkerRouteController";

function markerRoute(server: restify.Server) {
	server.get({ path: (RouteLookup.API + RouteLookup.Markers), version: "0.0.1" }, MarkerRouteController.queryMarkers);

	// server.get({ path: (RouteLookup.API + RouteLookup.Markers + RouteLookup.idParameter), version: "0.0.1" }, MarkerRouteController.queryByUserId);

	server.get({ path: RouteLookup.API + RouteLookup.Markers + RouteLookup.AllUserID, version: "0.0.1"}, MarkerRouteController.getAllUserId);

	server.get({ path: (RouteLookup.API + RouteLookup.Markers + RouteLookup.ByMarkerID + RouteLookup.MarkersIdParameter), version: "0.0.1" }, MarkerRouteController.queryMarkersByMarkerID);

	server.get({ path: (RouteLookup.API + RouteLookup.Markers + RouteLookup.Search + RouteLookup.MarkersIdParameter), version: "0.0.1" }, MarkerRouteController.searchMarkers);

	server.post({ path: (RouteLookup.API + RouteLookup.Markers + RouteLookup.ADD), version: "0.0.1" }, MarkerRouteController.createMarker);

	server.put({ path: (RouteLookup.API + RouteLookup.Markers + RouteLookup.idParameter), version: "0.0.1" }, MarkerRouteController.updateMarker);

	server.del({ path: (RouteLookup.API + RouteLookup.Markers + RouteLookup.idParameter), version: "0.0.1" }, MarkerRouteController.deleteMarker);

	server.get({ path: (RouteLookup.API + RouteLookup.Test + RouteLookup.Markers), version: "0.0.1" }, (req: restify.Request, res: restify.Response, next: restify.Next) => {
		res.send(200, "Successful test. (Marker routing).");
		return next();
	});
}

module.exports.routes = markerRoute;
