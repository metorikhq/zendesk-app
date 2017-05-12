var client = ZAFClient.init();
client.invoke('resize', { width: '100%', height: '400px' });

var app = new Vue({
	el: '#app',

	data: {
		apiUrl: 'http://metorik-app.dev', //https://app.metorik.com',
		user: {},
		loading: true,
		error: false,
		metorikError: false,
		tokenError: false,
		metorik: {
			data: false
		},
		showAllItems: false
	},

	mounted: function() {
		this.getUserData();
	},

	methods: {
		getUserData: function() {
			let self = this;
			client.get('ticket.requester.id').then(function(data) {
				var user_id = data['ticket.requester.id'];
				var settings = {
					url: '/api/v2/users/' + user_id + '.json',
					type:'GET',
					dataType: 'json',
				};

				client.request(settings).then(
					function(data) {
						self.user = data.user;
						self.getMetorikData();
					},
					function(response) {
						self.error = true;
					}
				);
			});
		},

		getMetorikData: function() {
			let self = this;
			let email = this.user.email;

			// token from settings
			client.metadata().then(function(metadata) {
			  	let token = metadata.settings.token;

			  	// no token? error
			  	if (! token) {
			  		self.loading = false;
			  		self.tokenError = true;
			  		return;
			  	}

				// get data from metorik
				self.$http.get(self.apiUrl + '/api/store/external/zendesk?token=' + token + '&email=' + encodeURIComponent(email)).then(function(response) {
					self.loading = false;
					// handle response
					if (response.data.success) {
						self.metorik.data = response.data;
					} else {
						self.metorikError = response.data.reason;
					}
				}, function(error) {
					self.error = true;
				});
			});
		},

		dateFormat: function(date, format = 'LL') {
			return moment(date).format(format);
		},

		numberFormat: function(amount, precision = 2) {
            return accounting.formatNumber(amount, precision);
		},

        /**
         * Number of decimals for a total items count. Handles possiblity
         * that there are decimals, and if so, will give 2 Otherwise 0.
         */
        totalItemsDecimals: function(items) {
            return items % 1 != 0 ? 2 : 0;
        },

		moneyFormat: function(amount, precision = 2) {
			// use current store's current
            currency = this.metorik.data.store.currency;

            // get symbol for given currency code
            const symbol = this.getCurrencySymbol(currency);

            // format with accounting js and return
            // note - if invalid symbol/currency, uses $
            return accounting.formatMoney(amount, symbol, precision);
		},

		pluralWord: function(count, single = 'item', plural = 'items') {
			if (count == 1) {
				return single;
			}

			return plural;
		},

		subscriptionPeriod(subscription) {
			let period = subscription.billing_interval == 1 ? subscription.billing_period : this.ordinal(subscription.billing_interval) + ' ' + subscription.billing_period;
			let amount = this.moneyFormat(subscription.order.total, 2) + ' / ' + period;
			return amount;
		},

        /**
         * Ordinal of a number.
         * @param n
         * @returns {string}
         */
        ordinal: function(n) {
            var s=["th","st","nd","rd"],
                v=n%100;
            return n+(s[(v-20)%10]||s[v]||s[0]);
        },

		statusAttribute: function(status) {
        	let color;
        	let icon;

        	switch(status) {
        		case 'completed':
        			color = '#27AE60'; // green
        			icon = 'fa-check';
        			break;
				case 'active':
        			color = '#27AE60'; // green
        			icon = 'fa-calendar-check-o';
					break;
        		case 'processing':
        			color = '#FECF39'; // yellow
        			icon = 'fa-ellipsis-h';
        			break;
        		case 'pending':
        			color = '#ff7418'; // lighter orange
        			icon = 'fa-clock-o';
        			break;
        		case 'on-hold':
        			color = '#D35400'; // orange
        			icon = 'fa-pause-circle';
        			break;
    			case 'cancelled':
    				color = '#C0392B'; // darker red
    				icon = 'fa-ban';
    				break;
				case 'refunded':
					color = '#E74C3C'; // red
					icon = 'fa-refresh';
					break;
				case 'failed':
					color = '#222C3C'; // dark blue
					icon = 'fa-exclamation';
					break;
				default:
					color = '#222'; // black
					icon = 'fa-circle';
					break;
        	}

        	return {
        		color,
        		icon
        	}
		},

		getCurrencySymbol: function(code) {
			let symbols = {
				"AED": "د.إ",
				"AFN": "؋",
				"ALL": "L",
				"ANG": "ƒ",
				"AOA": "Kz",
				"ARS": "$",
				"AUD": "$",
				"AWG": "ƒ",
				"AZN": "₼",
				"BAM": "KM",
				"BBD": "$",
				"BDT": "৳",
				"BGN": "лв",
				"BHD": ".د.ب",
				"BIF": "FBu",
				"BMD": "$",
				"BND": "$",
				"BOB": "Bs.",
				"BRL": "R$",
				"BSD": "$",
				"BTN": "Nu.",
				"BWP": "P",
				"BYR": "p.",
				"BZD": "BZ$",
				"CAD": "$",
				"CDF": "FC",
				"CHF": "Fr.",
				"CLP": "$",
				"CNY": "¥",
				"COP": "$",
				"CRC": "₡",
				"CUC": "$",
				"CUP": "₱",
				"CVE": "$",
				"CZK": "Kč",
				"DJF": "Fdj",
				"DKK": "kr",
				"DOP": "RD$",
				"DZD": "دج",
				"EEK": "kr",
				"EGP": "£",
				"ERN": "Nfk",
				"ETB": "Br",
				"EUR": "€",
				"FJD": "$",
				"FKP": "£",
				"GBP": "£",
				"GEL": "₾",
				"GGP": "£",
				"GHC": "₵",
				"GHS": "GH₵",
				"GIP": "£",
				"GMD": "D",
				"GNF": "FG",
				"GTQ": "Q",
				"GYD": "$",
				"HKD": "$",
				"HNL": "L",
				"HRK": "kn",
				"HTG": "G",
				"HUF": "Ft",
				"IDR": "Rp",
				"ILS": "₪",
				"IMP": "£",
				"INR": "₹",
				"IQD": "ع.د",
				"IRR": "﷼",
				"ISK": "kr",
				"JEP": "£",
				"JMD": "J$",
				"JPY": "¥",
				"KES": "KSh",
				"KGS": "лв",
				"KHR": "៛",
				"KMF": "CF",
				"KPW": "₩",
				"KRW": "₩",
				"KYD": "$",
				"KZT": "₸",
				"LAK": "₭",
				"LBP": "£",
				"LKR": "₨",
				"LRD": "$",
				"LSL": "M",
				"LTL": "Lt",
				"LVL": "Ls",
				"MAD": "MAD",
				"MDL": "lei",
				"MGA": "Ar",
				"MKD": "ден",
				"MMK": "K",
				"MNT": "₮",
				"MOP": "MOP$",
				"MUR": "₨",
				"MVR": "Rf",
				"MWK": "MK",
				"MXN": "$",
				"MYR": "RM",
				"MZN": "MT",
				"NAD": "$",
				"NGN": "₦",
				"NIO": "C$",
				"NOK": "kr",
				"NPR": "₨",
				"NZD": "$",
				"OMR": "﷼",
				"PAB": "B/.",
				"PEN": "S/.",
				"PGK": "K",
				"PHP": "₱",
				"PKR": "₨",
				"PLN": "zł",
				"PYG": "Gs",
				"QAR": "﷼",
				"RMB": "￥",
				"RON": "lei",
				"RSD": "Дин.",
				"RUB": "₽",
				"RWF": "R₣",
				"SAR": "﷼",
				"SBD": "$",
				"SCR": "₨",
				"SDG": "ج.س.",
				"SEK": "kr",
				"SGD": "$",
				"SHP": "£",
				"SLL": "Le",
				"SOS": "S",
				"SRD": "$",
				"SSP": "£",
				"STD": "Db",
				"SVC": "$",
				"SYP": "£",
				"SZL": "E",
				"THB": "฿",
				"TJS": "SM",
				"TMT": "T",
				"TND": "د.ت",
				"TOP": "T$",
				"TRL": "₤",
				"TRY": "₺",
				"TTD": "TT$",
				"TVD": "$",
				"TWD": "NT$",
				"TZS": "TSh",
				"UAH": "₴",
				"UGX": "USh",
				"USD": "$",
				"UYU": "$U",
				"UZS": "лв",
				"VEF": "Bs",
				"VND": "₫",
				"VUV": "VT",
				"WST": "WS$",
				"XAF": "FCFA",
				"XBT": "Ƀ" ,
				"XCD": "$",
				"XOF": "CFA" ,
				"XPF": "₣" ,
				"YER": "﷼",
				"ZAR": "R",
				"ZWD": "Z$"
			}

			return symbols[code];
		}
	},

	watch: {
		// listen to all error changes and resize client so it's not so big
		metorikError: function(error) {
			if (error) {
				client.invoke('resize', { width: '100%', height: '150px' });
			}
		},
		error: function(error) {
			if (error) {
				client.invoke('resize', { width: '100%', height: '150px' });
			}
		},
		tokenError: function(error) {
			if (error) {
				client.invoke('resize', { width: '100%', height: '150px' });
			}
		},
		// listen for the user being a guest and resize so not so big
		"metorik.data": function(metorik) {
			if (metorik.guest) {
				client.invoke('resize', { width: '100%', height: '350px' });
			}
		}
	}		
});