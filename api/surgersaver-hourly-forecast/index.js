// IMPORTS
var dayjs = require("dayjs");
var request = require("request");
var fs = require("fs");
var zipmap = JSON.parse(fs.readFileSync("zipmap.json", "utf8"));

// CONSTANTS
const AccountAPIKey = "cf11637faf2d4c9faf82610151539de0";
const accountSid = "AC7d16462147c7cf8fa2aaccf4d8218dbd";
const authToken = "e117e43139747ae6c8ab77e68b29016e";
const client = require("twilio")(accountSid, authToken);

// Helper
function zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

// MAIN
exports.handler = (event, context, callback) => {
	var zipcode = event.zipcode;
	var pnode_id = zipmap[zipcode];
	var endpoint = "https://api.pjm.com/api/v1/da_hrl_lmps";
	var day0 = dayjs().format("M/D/YYYY");
	var day1 = dayjs().format("M/D/YYYY");
	if (event.month) {
		day0 = dayjs(event.month + "-01-" + (new Date().getFullYear() - 1)).format(
			"M/D/YYYY"
		);
		day1 = dayjs(event.month + "-01-" + (new Date().getFullYear() - 1))
			.add(1, "M")
			.format("M/D/YYYY");
	} else {
		day0 = dayjs(event.date).format("M/D/YYYY");
		day1 = dayjs(event.date).format("M/D/YYYY");
	}
	var request_body = {
		rowCount: 24,
		startRow: 1,
		filters: [
			{
				datetime_beginning_ept: day0 + " 00:00to" + day1 + " 23:00"
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
			if (event.month) {
				var average_lmps = [
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				];
				var all_lmps = body.items.map(x => x["total_lmp_da"]);
				for (var x = 0; x < all_lmps.length; x += 1) {
					average_lmps[x % 24] += all_lmps[x];
				}
				callback(
					null,
					average_lmps.map(x => x / (all_lmps.length / 24))
				);
			} else {
				var lmp_array = body.items.map(x => x["total_lmp_da"]);
				if (event.phoneNumber) {
					var maxhour = zeroPad(lmp_array.indexOf(Math.max(...lmp_array)), 2);
					client.messages
						.create({
							body:
								"SurgeSaver alert - electricity prices in " +
								event.zipcode +
								" will surge around " +
								maxhour +
								":00 today. Avoid running major appliances at that time.",
							from: "+18184655954",
							to: event.phoneNumber
						})
						.then(function(message) {
							callback(null, message);
						});
				} else {
					callback(null, lmp_array);
				}
			}
		} else {
			callback({ error: "API DATA MALFORMED" });
		}
	});
};
