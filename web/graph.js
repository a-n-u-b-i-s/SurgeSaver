var lmp_array = [];
var month_array = [];
var scaling = {
	scales: {
		yAxes: [
			{
				display: true,
				ticks: {
					suggestedMin: 0,
					beginAtZero: true
					// max: 70
				}
			}
		]
	}
};
function zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}
let range = n => Array.from(Array(n).keys());

function dg() {
	var n24CC = document.getElementById("next24ChartContainer");
	n24CC.innerHTML = "";
	var n24CCM = document.getElementById("next24ChartContainerM");
	n24CCM.innerHTML = "";
	var m24CC = document.getElementById("month24ChartContainer");
	m24CC.innerHTML = "";
	var m24CCM = document.getElementById("month24ChartContainerM");
	m24CCM.innerHTML = "";
}

function cg() {
	var n24CC = document.getElementById("next24ChartContainer");
	n24CC.innerHTML =
		"<canvas class='onlyDesktop' id='next24Chart' width ='400' height='350'></canvas>";
	var n24CCM = document.getElementById("next24ChartContainerM");
	n24CCM.innerHTML =
		"<canvas class='onlyMobile' id='next24ChartM' width ='400' height='200'></canvas>";

	var m24CC = document.getElementById("month24ChartContainer");
	m24CC.innerHTML =
		"<canvas class='onlyDesktop' id='month24Chart' width ='400' height='350'></canvas>";
	var m24CCM = document.getElementById("month24ChartContainerM");
	m24CCM.innerHTML =
		"<canvas class='onlyMobile' id='month24ChartM' width ='400' height='200'></canvas>";

	var hour_labels = range(24).map(x => zeroPad(x, 2) + ":00");
	var next24chartdata = [
		{
			data: lmp_array,
			label: "Forecasted Hourly LMP",
			borderColor: "#F9922A",
			fill: true,
			backgroundColor: "#F9922A25"
		},
		{
			data: lmp_array.map((x, i) => (i - 1 < new Date().getHours() ? x : null)),
			label: "Past Hourly LMPs",
			borderColor: "#F9922A",
			fill: true,
			backgroundColor: "#F9922A70"
		}
	];
	var next24ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		onResize: function() {
			next24Chart.canvas.parentNode.style.height = "350px";
			next24ChartM.canvas.parentNode.style.height = "200px";
		},
		title: {
			display: true,
			text:
				new Date().toDateString() +
				" " +
				zeroPad(new Date().getHours(), 2) +
				":" +
				zeroPad(new Date().getMinutes(), 2)
		},
		legend: {
			display: false
		},
		...scaling
	};
	var month24chartdata = [
		{
			data: month_array,
			label: "Average Hourly LMP",
			borderColor: "#F7DC33",
			fill: true,
			backgroundColor: "#F7DC3325"
		}
	];
	var month24ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		onResize: function() {
			month24Chart.canvas.parentNode.style.height = "350px";
			month24ChartM.canvas.parentNode.style.height = "200px";
		},
		title: {
			display: true,
			text: V.month
		},
		legend: {
			display: false
		},
		...scaling
	};
	var next24ChartSelector = document
		.getElementById("next24Chart")
		.getContext("2d");
	var next24ChartSelectorM = document
		.getElementById("next24ChartM")
		.getContext("2d");
	var next24Chart = new Chart(next24ChartSelector, {
		type: "line",
		data: {
			labels: hour_labels,
			datasets: next24chartdata
		},
		options: next24ChartOptions
	});

	var next24ChartM = new Chart(next24ChartSelectorM, {
		type: "line",
		data: {
			labels: hour_labels,
			datasets: next24chartdata
		},
		options: next24ChartOptions
	});

	var month24ChartSelector = document
		.getElementById("month24Chart")
		.getContext("2d");
	var month24ChartSelectorM = document
		.getElementById("month24ChartM")
		.getContext("2d");
	var month24Chart = new Chart(month24ChartSelector, {
		type: "line",
		data: {
			labels: hour_labels,
			datasets: month24chartdata
		},
		options: month24ChartOptions
	});

	var month24ChartM = new Chart(month24ChartSelectorM, {
		type: "line",
		data: {
			labels: hour_labels,
			datasets: month24chartdata
		},
		options: month24ChartOptions
	});
}

function updateGraphZ(analyticsZipCode) {
	window
		.fetch("https://api.surgesaver.com/surgesaver-api", {
			method: "POST",
			body: JSON.stringify({
				zipcode: analyticsZipCode,
				date: new Date().toISOString()
			}),
			headers: {
				"Content-Type": "application/json"
			}
		})
		.then(res => res.json())
		.then(function(x) {
			if (Array.isArray(x) && x.length === 24) {
				lmp_array = x;
				cg();
			} else if (V.analyticsZipCode) {
				V.currentPage = "Home";
				V.validZipCodeInput = false;
				V.analyticsZipCode = "";
				setTimeout(function() {
					V.validZipCodeInput = true;
				}, 800);
			}
		});
}

function updateGraphM(analyticsZipCode, month) {
	window
		.fetch("https://api.surgesaver.com/surgesaver-api", {
			method: "POST",
			body: JSON.stringify({
				zipcode: analyticsZipCode,
				month: month
			}),
			headers: {
				"Content-Type": "application/json"
			}
		})
		.then(res => res.json())
		.then(function(x) {
			if (Array.isArray(x) && x.length === 24) {
				month_array = x;
				cg();
			} else if (V.analyticsZipCode) {
				V.currentPage = "Home";
				V.validZipCodeInput = false;
				V.analyticsZipCode = "";
				setTimeout(function() {
					V.validZipCodeInput = true;
				}, 800);
			}
		});
}
