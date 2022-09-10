(function ($) {
    $.Shop = function (element) {
        this.$element = $(element);
        this.init();
    };

    $.Shop.prototype = {
        init: function () {

            // Routing
            this.cartPage = "/miele.html"; // Cart page
            this.cartPageShort = "/miele"; // Cart page shortened
            this.pickupPageShort = "/ritiro-a-mano"; // Pickup page shortened
            this.shippingPageShort = "/spedizione"; // Shipping page shortened

            // Properties
            this.cartPrefix = "pam-"; // Prefix string to be prepended to the cart's name in the session storage
            this.cartName = this.cartPrefix + "cart"; // Cart name in the session storage
            this.shippingRates = this.cartPrefix + "shipping-rates"; // Shipping rates key in the session storage
            this.estimatedWeight = this.cartPrefix + "weight"; // Estimated parcel weight key in the session storage
            this.total = this.cartPrefix + "total"; // Total key in the session storage
            this.subtotal = this.cartPrefix + "subtotal"; // Total key in the session storage
            this.njars = this.cartPrefix + "njars"; // Total number of jars in the session storage
            this.cartEmpty = this.cartPrefix + "empty-status"; // Cart status
            this.storage = sessionStorage; // shortcut to the sessionStorage object

            this.$emptyCartAction = this.$element.find("#empty-cart-action"); // Action that delete all products from cart
            this.$goToPickupFormAction = this.$element.find("#go-to-pickup-action"); // Action that redirect to pickup page
            this.$goToShippingFormAction = this.$element.find("#go-to-shipping-action"); // Action that redirect to shipping page
            this.$formAddToCart = this.$element.find("form.add-to-cart"); // Forms for adding items to the cart
            this.$cartElement = this.$element.find(".shopping-cart"); // Shopping cart form
            this.$shipping = this.$element.find("#sshipping"); // Element that displays the shipping rates
            this.$subTotal = this.$element.find("#stotal"); // Element that displays the subtotal charges
            this.$fTotal = this.$element.find("#ftotal"); // Element that displays the total charges
            this.$emptyCartBtn = this.$element.find("#empty-cart"); // Empty cart button

            this.currency = "&euro;"; // HTML entity of the currency to be displayed in the layout
            this.currencyString = "€"; // Currency symbol as textual string

            // Object containing patterns for form validation
            this.requiredFields = {
                expression: {
                    value: /^([\w-\.]+)@((?:[\w]+\.)+)([a-z]){2,4}$/
                },
                str: {
                    value: ""
                }
            };

            // Method invocation
            this.createCart();
            this.handleAddToCartForm();
            this.emptyCart();
            this.displayCart();
            this.checkInput();
        },

        // Public methods

        // Creates the cart keys in the session storage

        createCart: function () {
            if (this.storage.getItem(this.cartName) == null) {

                var cart = {};
                cart.items = [];

                this.storage.setItem(this.cartName, this._toJSONString(cart));
                this.storage.setItem(this.shippingRates, "0");
                this.storage.setItem(this.estimatedWeight, "0");
                this.storage.setItem(this.total, "0");
                this.storage.setItem(this.subtotal, "0");
                this.storage.setItem(this.njars, "0");
                this.storage.setItem(this.cartEmpty, "1");
            }
        },

        // Displays the shopping cart

        displayCart: function () {
            if (this.$cartElement.length) {
                var cart = this._toJSONObject(this.storage.getItem(this.cartName));
                var nJars = this._convertString(this.storage.getItem(this.njars));
                var items = cart.items;
                var $tableCart = this.$cartElement;
                var $emptyCartAction = this.$emptyCartAction;
                var $goToPickupFormAction = this.$goToPickupFormAction;
                var $goToShippingFormAction = this.$goToShippingFormAction;
                var $tableCartHead = $tableCart.find("thead");
                var $tableCartBody = $tableCart.find("tbody");

                // Visualizzazione link in base al numero di vasetti.
                if (items.length == 0) {
                    // Stato CARRELLO VUOTO.
                    $tableCartBody.html("Il carrello è vuoto.");
                    if (this._onPage(this.cartPageShort)) {
                        $emptyCartAction[0].style.display = "none";
                        $goToPickupFormAction[0].style.display = "none";
                        $goToShippingFormAction[0].style.display = "none";
                    }
                } else {
                    if (this._onPage(this.cartPageShort) && nJars < 10) {
                        // Il carrello contiene meno di 10 vasetti, nascondi link spedizione.
                        $goToShippingFormAction[0].style.display = "none";
                    }
                    if (this._onPage(this.cartPageShort) && nJars >= 10) {
                        // Il carrello contiene più di 9 vasetti, nascondi link ritiro a mano.
                        $goToPickupFormAction[0].style.display = "none";
                    }

                    // Stampa elementi del carrello.
                    var $tableCartHeadHtml = "<tr><th scope='col'>Qtà</th>";
                    if (this._onPage(this.pickupPageShort) || this._onPage(this.shippingPageShort)) {
                        // Nelle pagine di checkout aggiungo l'immagine dei vasetti.
                        $tableCartHeadHtml += "<th>Img</th>";
                    }
                    $tableCartHeadHtml += "<th scope='col'>Articolo</th><th scope='col'>SubTot</th></tr>";
                    $tableCartHead.html($tableCartHeadHtml);

                    // Genero le row di ogni singolo prodotto.
                    for (var i = 0; i < items.length; ++i) {
                        var item = items[i];
                        var html = "<tr><td>" + item.qty + "&nbsp;&times;&#32;</td>";
                        if (this._onPage(this.pickupPageShort) || this._onPage(this.shippingPageShort)) {
                            html += "<td class='cart-prod-image'><img src=" + item.imageurl + " alt=" + item.product + " height='auto' width='60'></td>";
                        }
                        html += "<td class='pname'>" + item.product + "<sup><span style='color:darkgoldenrod;'>" + item.crist + "</span></sup></td><td class='subtot'>&#32;" + this.currency + "&nbsp" + item.price * item.qty + "</td></tr>";
                        $tableCartBody.html($tableCartBody.html() + html);
                    }
                }

                // Stampa del subtotale carrello.
                var subtotal = this.storage.getItem(this.subtotal);
                this.$subTotal[0].innerHTML = this.currency + " " + subtotal;

                if (location.pathname.indexOf(this.shippingPageShort) === 0) {

                    // Stampa delle spese di imballaggio e spedizione.
                    var delivery = this.storage.getItem(this.shippingRates);
                    this.$shipping[0].innerHTML = this.currency + " " + delivery;

                    // Stampa delle spese di imballaggio e spedizione.
                    var total = this.storage.getItem(this.total);
                    this.$fTotal[0].innerHTML = this.currency + " " + total;
                }
            }
        },

        // Empties the cart by calling the _emptyCart() method
        // @see $.Shop._emptyCart()
        emptyCart: function () {
            var self = this;
            if (self.$emptyCartBtn.length) {
                self.$emptyCartBtn.on("click", function () {
                    self._emptyCart();
                    this.storage.setItem(this.cartEmpty, "1");
                });
            }
        },


        // Adds items to the shopping cart
        handleAddToCartForm: function () {
            var self = this;
            self.$formAddToCart.each(function () {
                var $form = $(this);
                var $product = $form.parent();
                var price = self._convertString($product.data("price"));
                var name = $product.data("name");
                var lotto = $product.data("lotto");
                var grammi = $product.data("grammi");
                var crist = $product.data("crist");
                var imageurl = $product.data("imageurl");

                $form.on("submit", function () {
                    var qty = self._convertString($form.find(".qty").val());

                    // Add items to cart.
                    self._addToCart({
                        product: name,
                        lotto: lotto,
                        grammi: grammi,
                        crist: crist,
                        imageurl: imageurl,
                        price: price,
                        qty: qty
                    });
                    self.storage.setItem(self.cartEmpty, "0");

                    // Calculate #jars and cart subtotal.
                    var cart = self._toJSONObject(self.storage.getItem(self.cartName));
                    var items = cart.items;
                    var subtot = 0;
                    var nJars = 0;
                    for (var i = 0; i < items.length; i++) {
                        subtot += items[i].qty * items[i].price;
                        nJars += self._convertString(items[i].qty);
                    }

                    // Calculate shipping fee.
                    var weightAndFees = self._calculateShipping(nJars);

                    // Calculate total.
                    var total = subtot + weightAndFees[1];

                    // Update session data.
                    self.storage.setItem(self.subtotal, subtot);
                    self.storage.setItem(self.njars, nJars);
                    self.storage.setItem(self.estimatedWeight, weightAndFees[0]);
                    self.storage.setItem(self.shippingRates, weightAndFees[1]);
                    self.storage.setItem(self.total, total);
                });
            });
        },


        checkInput: function () {
            var cartEmpty = this.storage.getItem(this.cartEmpty);

            // Number input should not be empty.
            const numInputs = document.querySelectorAll('input[type=number]');
            numInputs.forEach(function (input) {
                input.addEventListener('change', function (e) {
                    if (e.target.value == '') {
                        e.target.value = 1
                    }
                })
            });

            // Back to shop page if cart is empty.
            var path = location.pathname;
            if ((path.indexOf(this.pickupPageShort) === 0 || path.indexOf(this.shippingPageShort) === 0)
                && cartEmpty === '1') {
                window.location.replace(this.cartPage);
            }
        },

        /////////////////////
        // Private methods //
        /////////////////////

        // Empties the session storage
        _emptyCart: function () {
            this.storage.clear();
        },

        // Check if current page is $page.
        _onPage: function (page) {
            return location.pathname.indexOf(page) === 0;
        },

        /* Format a number by decimal places
         * @param num Number the number to be formatted
         * @param places Number the decimal places
         * @returns n Number the formatted number
         */
        _formatNumber: function (num, places) {
            var n = num.toFixed(places);
            return n;
        },

        /* Extract the numeric portion from a string
         * @param element Object the jQuery element that contains the relevant string
         * @returns price String the numeric string
         */
        _extractPrice: function (element) {
            var self = this;
            var text = element.text();
            var price = text.replace(self.currencyString, "").replace(" ", "");
            return price;
        },

        /* Converts a numeric string into a number
         * @param numStr String the numeric string to be converted
         * @returns num Number the number
         */
        _convertString: function (numStr) {
            var num;
            if (/^[-+]?[0-9]+\.[0-9]+$/.test(numStr)) {
                num = parseFloat(numStr);
            } else if (/^\d+$/.test(numStr)) {
                num = parseInt(numStr, 10);
            } else {
                num = Number(numStr);
            }

            if (!isNaN(num)) {
                return num;
            } else {
                console.warn(numStr + " cannot be converted into a number");
                return false;
            }
        },

        /* Converts a number to a string
         * @param n Number the number to be converted
         * @returns str String the string returned
         */
        _convertNumber: function (n) {
            var str = n.toString();
            return str;
        },

        /* Converts a JSON string to a JavaScript object
         * @param str String the JSON string
         * @returns obj Object the JavaScript object
         */
        _toJSONObject: function (str) {
            var obj = JSON.parse(str);
            return obj;
        },

        /* Converts a JavaScript object to a JSON string
         * @param obj Object the JavaScript object
         * @returns str String the JSON string
         */
        _toJSONString: function (obj) {
            var str = JSON.stringify(obj);
            return str;
        },

        /* Add an object to the cart as a JSON string
         * @param values Object the object to be added to the cart
         * @returns void
         */
        _addToCart: function (values) {
            var cart = this.storage.getItem(this.cartName);
            var currentCart = this._toJSONObject(cart);
            var items = currentCart.items;

            // Remove product if present in cart.
            this._removeItemByName(values.product, items);

            // Add product and qty.
            items.push(values);

            this.storage.setItem(this.cartName, this._toJSONString(currentCart));
        },

        /*
         * Remove a product from the current cart if present.
         * @param productName String name of the product
         * @returns void
         */
        _removeItemByName: function (productName, array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].product === productName) {
                    array.splice(i, 1);
                    i--;
                }
            }
        },

        /* Custom shipping rates calculation based on the total quantity of items in the cart
         * @param qty Number the total quantity of items
         * @returns shipping Number the shipping rates
         */
        _calculateShipping: function (qty) {
            var rate = 1.6; // 3 kg packaging every 5 kg of honey.
            var weight = qty / 2; // kg of honey
            var estimatedWeight = rate * weight;
            var shipping = 0;

            if (estimatedWeight <= 10) {
                shipping = 15;
            }

            if (estimatedWeight > 10 && estimatedWeight <= 20) {
                shipping = 18;
            }

            if (estimatedWeight > 20 && estimatedWeight <= 30) {
                shipping = 21;
            }

            if (estimatedWeight > 30 && estimatedWeight <= 40) {
                shipping = 28;
            }

            if (estimatedWeight > 40 && estimatedWeight <= 50) {
                shipping = 31;
            }

            if (estimatedWeight > 50 && estimatedWeight <= 70) {
                shipping = 39;
            }

            if (estimatedWeight > 70) {
                shipping = 51;
            }

            return [estimatedWeight, shipping];
        },

        /* Validates the checkout form
         * @param form Object the jQuery element of the checkout form
         * @returns valid Boolean true for success, false for failure
         */
        _validateForm: function (form) {
            var self = this;
            var fields = self.requiredFields;
            var $visibleSet = form.find("fieldset:visible");
            var valid = true;

            form.find(".message").remove();

            $visibleSet.each(function () {

                $(this).find(":input").each(function () {
                    var $input = $(this);
                    var type = $input.data("type");
                    var msg = $input.data("message");

                    if (type == "string") {
                        if ($input.val() == fields.str.value) {
                            $("<span class='message'/>").text(msg).
                                insertBefore($input);

                            valid = false;
                        }
                    } else {
                        if (!fields.expression.value.test($input.val())) {
                            $("<span class='message'/>").text(msg).
                                insertBefore($input);

                            valid = false;
                        }
                    }

                });
            });

            return valid;

        },

        /* Save the data entered by the user in the ckeckout form
         * @param form Object the jQuery element of the checkout form
         * @returns void
         */
        _saveFormData: function (form) {
            var self = this;
            var $visibleSet = form.find("fieldset:visible");

            $visibleSet.each(function () {
                var $set = $(this);
                if ($set.is("#fieldset-billing")) {
                    var name = $("#name", $set).val();
                    var email = $("#email", $set).val();
                    var city = $("#city", $set).val();
                    var address = $("#address", $set).val();
                    var zip = $("#zip", $set).val();
                    var country = $("#country", $set).val();

                    self.storage.setItem("billing-name", name);
                    self.storage.setItem("billing-email", email);
                    self.storage.setItem("billing-city", city);
                    self.storage.setItem("billing-address", address);
                    self.storage.setItem("billing-zip", zip);
                    self.storage.setItem("billing-country", country);
                } else {
                    var sName = $("#sname", $set).val();
                    var sEmail = $("#semail", $set).val();
                    var sCity = $("#scity", $set).val();
                    var sAddress = $("#saddress", $set).val();
                    var sZip = $("#szip", $set).val();
                    var sCountry = $("#scountry", $set).val();

                    self.storage.setItem("shipping-name", sName);
                    self.storage.setItem("shipping-email", sEmail);
                    self.storage.setItem("shipping-city", sCity);
                    self.storage.setItem("shipping-address", sAddress);
                    self.storage.setItem("shipping-zip", sZip);
                    self.storage.setItem("shipping-country", sCountry);

                }
            });
        }
    };

    $(function () {
        var shop = new $.Shop("body");
        console.log(shop.storage);
    });

})(jQuery);
