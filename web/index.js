var V = {
	currentPage: "Home",
	homeInfoSections: [
		{
			title: "How do I get started?",
			icon: "fa-map-signs",
			content:
				"Enter your Zipcode to see your local daily energy costs and start saving today.",
			click: function() {
				document.getElementById("zI").focus();
			}
		},

		{
			title: "How does it help?",
			icon: "fa-globe-americas",
			content:
				"SurgeSaver saves the environment by reducing the use of peaker plants.",
			click: function() {
				V.currentPage = "FAQ";
			}
		},
		{
			title: "How does it work?",
			icon: "fa-bolt",
			content:
				"SurgeSaver will notify you during peak hours so you can modify your consumption schedule.",
			click: function() {
				V.currentPage = "About";
			}
		}
	],
	analyticsZipCode: "",
	analyticsZipCodeInput: "",
	validZipCodeInput: true,
	month: new Date().toLocaleString("default", { month: "long" }),
	phoneNumber: "",
	phoneNumberInput: "",
	validPhone: true,
	mobileMenuOpen: false
};

var fin = new Vue({
	el: "#surge",
	data: V,
	mounted() {
		updateGraphZ(V.analyticsZipCode);
		updateGraphM(V.analyticsZipCode, V.month);
	},
	updated() {
		if (V.currentPage === "Analytics") {
			updateGraphZ(V.analyticsZipCode);
			updateGraphM(V.analyticsZipCode, V.month);
		}
	},
	watch: {
		analyticsZipCode: function(val) {
			updateGraphZ(val);
			updateGraphM(val, V.month);
		},
		month: function(val) {
			updateGraphM(V.analyticsZipCode, val);
		}
	},
	methods: {
		changePage: function(page) {
			V.currentPage = page;
			V.mobileMenuOpen = false;
			dg();
			if (page === "Analytics") {
				cg();
			}
		},
		setZipcode: function() {
			V.analyticsZipCode = "";
			var code = V.analyticsZipCodeInput;
			if (code.length === 5 && /^\d+$/.test(code)) {
				V.analyticsZipCode = code;
			} else {
				V.validZipCodeInput = false;
				V.analyticsZipCode = "";
				setTimeout(function() {
					V.validZipCodeInput = true;
				}, 800);
			}
		},
		goToAnalytics: function() {
			this.changePage("Analytics");
			updateGraphZ(V.analyticsZipCode);
			updateGraphM(V.analyticsZipCode, V.month);
		},
		setPhoneNumber: function() {
			var number = V.phoneNumberInput;
			if (/^\+?(1?)\D?(\d{3})\D?(\d{3})\D?(\d{4})$/.test(number)) {
				number = number.replace(
					/^\+?(1?)\D?(\d{3})\D?(\d{3})\D?(\d{4})$/,
					"+1$2$3$4"
				);
				V.phoneNumber = number;
				window
					.fetch("https://api.surgesaver.com/surgesaver-api", {
						method: "POST",
						body: JSON.stringify({
							zipcode: V.analyticsZipCode,
							phoneNumber: V.phoneNumber,
							date: new Date().toISOString()
						}),
						headers: {
							"Content-Type": "application/json"
						}
					})
					.then(res => res.json())
					.then(function(x) {
						V.currentPage = "Analytics";
						updateGraphZ(V.analyticsZipCode);
						updateGraphM(V.analyticsZipCode, V.month);
					});
			} else {
				V.validPhone = false;
				setTimeout(function() {
					V.validPhone = true;
				}, 800);
			}
		},
		toggleMobileMenu: function() {
			V.mobileMenuOpen = !V.mobileMenuOpen;
		}
	}
});

window.onload = function() {
	// Onload Functions
	cg();
};
