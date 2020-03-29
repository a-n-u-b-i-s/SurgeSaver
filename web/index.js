var V = {
	currentPage: "Home"
};

// if (document.cookie.includes("prbns=")) {}

var fin = new Vue({
	el: "#surge",
	data: V,
	mounted() {
		V.currentBank = V.homeBankNames[0];
		V.bankDataSource = V.banks.filter(x => V.homeBankNames.includes(x.name));
	},
	methods: {
		changePage: function(page) {
			V.currentPage = page;
		}
	}
});

window.onload = function() {
	// Onload Functions
};
