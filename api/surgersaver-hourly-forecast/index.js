// IMPORTS
var dayjs = require("dayjs");
var request = require("request");
var fs = require("fs");
var zipmap = JSON.parse(fs.readFileSync("zipmap.json", "utf8"));

// CONSTANTS
const AccountAPIKey = "cf11637faf2d4c9faf82610151539de0";

// MAIN
exports.handler = (event, context, callback) => {
	var day = dayjs(event.date).format("M/D/YYYY");
	var zipcode = event.zipcode;
	var pnode_id = zipmap[zipcode];
	var endpoint = "https://api.pjm.com/api/v1/da_hrl_lmps";
	var request_body = {
		rowCount: 24,
		startRow: 1,
		filters: [
			{
				datetime_beginning_ept: day + " 00:00to" + day + " 23:00"
			},
			{
				pnode_id: pnode_id
			}
		],
		sort: "datetime_beginning_ept",
		order: 0,
		fields: ["total_lmp_da"]
	};
	var options = {
		url: endpoint,
		headers: { "Ocp-Apim-Subscription-Key": AccountAPIKey },
		json: request_body
	};
	request.post(options, function(error, response, body) {
		if (error) {
			callback({ error: "API ENDPOINT NOT RESPONDING" });
		} else if (response.statusCode === 200) {
			callback(
				null,
				body.items.map(x => x["total_lmp_da"])
			);
		} else {
			callback({ error: "API DATA MALFORMED" });
		}
	});
};
