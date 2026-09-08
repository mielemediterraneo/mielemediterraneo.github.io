function setElementValue(elementId, newValue) {
    var s = document.getElementById(elementId);
    s.setAttribute("value", newValue);
}

function updatePickupFormParams() {

    // Get order data from storage.
    var cart = JSON.parse(sessionStorage['pam-cart']);
    var cart_items = cart['items'];
    var details_json = [];
    for (var i = 0; i < cart_items.length; ++i) {
        details_json[i] = {
            prod_name: cart_items[i]['product'],
            prod_lot: cart_items[i]['lotto'],
            prod_grams: cart_items[i]['grammi'],
            prod_price: cart_items[i]['price'],
            prod_qty: cart_items[i]['qty']
        }
    }
    var subtotal = parseFloat(sessionStorage['pam-subtotal']);
    var detailsJSON = {
        items: details_json,
        subtotal: subtotal
    };

    // Get customer data from input.
    var customer_name = $("input[name=name]").val();
    var customer_surname = $("input[name=surname]").val();
    var customer_email = $("input[name=_replyto]").val();
    var customer_phone = $("input[name=phone]").val();
    var customerJSON = {
        name: customer_name,
        surname: customer_surname,
        email: customer_email,
        phone: customer_phone
    };

    // Get pickup point data from input.
    var pp_raw = $("input[name=pickup-points]:checked").val();
    var ppJSON = JSON.parse(pp_raw);

    // Merge all in a single Json object.
    var orderJSON = {
        'customer': customerJSON,
        'details': detailsJSON,
        'pp': ppJSON
    };
    var orderJSONString = JSON.stringify(orderJSON);

    setElementValue('order', orderJSONString);
}

function updateShippingFormParams() {
    var name = $("input[name=name]").val();
    var surname = $("input[name=surname]").val();
    var email = $("input[name=_replyto]").val();
    var phone = $("input[name=phone]").val();
    var date = $("input[name=date]").val();
    var shipping_comune = $("input[name=comune]").val();
    var shipping_frazione = $("input[name=frazione]").val();
    var shipping_prov = $("input[name=prov]").val();
    var shipping_cap = $("input[name=cap]").val();
    var shipping_indirizzo = $("input[name=indirizzo]").val();
    var shipping_address = name + ' ' + surname + '\r\n';
    shipping_address += shipping_indirizzo + '\r\n';
    shipping_address += shipping_cap + ' ';
    if (shipping_frazione != '') {
        shipping_address += shipping_frazione + ', ';
    }
    shipping_address += shipping_comune;
    shipping_address += ' (' + shipping_prov + ')';

    // Get order data from storage.
    var cart = JSON.parse(sessionStorage['pam-cart']);
    var cart_items = cart['items'];
    var content = '';
    for (var i = 0; i < cart_items.length; ++i) {
        content += cart_items[i]['qty'] + ' x ' + cart_items[i]['product'] + ' = ' + cart_items[i]['price'] * cart_items[i]['qty'] + ' €\r\n';
    }
    var subtotal = parseFloat(sessionStorage['pam-subtotal']);
    var shipping_rates = parseFloat(sessionStorage['pam-shipping-rates']);
    var total = parseFloat(sessionStorage['pam-total']);
    content += 'Subtotale: ' + subtotal + ' €\r\n';
    content += 'Imballaggio e spedizione: ' + shipping_rates + ' €\r\n';

    var code = 'SP' + getRandomInt(10000, 99999);

    var summary =
        'Codice ordine: ' + code + '\r\n' +
        'Data e ora: ' + date + '\r\n' +
        'Nome e cognome: ' + name + ' ' + surname + '\r\n' +
        'Email: ' + email + '\r\n' +
        'Tel: ' + phone + '\r\n\r\n' +
        'Indirizzo spedizione: \r\n' + shipping_address + '\r\n\r\n' +
        'Dettagli: ' + '\r\n' + content +
        'Totale: ' + total + ' €\r\n';

    var pset = {
        nome: name,
        cognome: surname,
        email: email,
        tel: phone,
        data: date,
        indirizzospedizione: shipping_address,
        dettagli: content,
        totale: total,
        code: code,
        mode: 'shipping'
    };
    var purl = "/pagamento?" + serialize(pset);

    var eset = {
        nome: name,
        cognome: surname,
        email: email,
        tel: phone,
        data: date,
        indirizzospedizione: shipping_address,
        dettagli: content,
        totale: total,
        code: code,
        purl: purl,
        mode: 'shipping'
    };

    var eurl = window.location.protocol + '//' + window.location.host + "/email?" + serialize(eset);
    setElementValue('summary', summary);
    setElementValue('eurl', eurl);
}

// Js fill payment page.
function fillOrderDetails() {
    var purl = document.location.href;

    // Get parameter and decoding it!
    var mode = getParameterByName('mode', purl);
    //console.log('mode: ' + mode);
    var data = getParameterByName('data', purl);
    //console.log('data: ' + data);
    var codice = getParameterByName('code', purl);
    //console.log('codice: ' + codice);
    var nome = getParameterByName('nome', purl);
    //console.log('nome: ' + nome);
    var cognome = getParameterByName('cognome', purl);
    //console.log('cognome: ' + cognome);
    var email = getParameterByName('email', purl);
    //console.log('email: ' + email);
    var tel = getParameterByName('tel', purl);
    //console.log('tel: ' + tel);
    var dettagli_ordine = getParameterByName('dettagli', purl);
    //console.log('dettagli_ordine: ' + dettagli_ordine);
    var totale = getParameterByName('totale', purl);
    //console.log('totale: ' + totale);

    var momentOrderDatetime = moment(data, "YYYY-MM-DD HH:mm");
    var momentCurrentDatetime = moment().utcOffset(1);
    var momentExpiringDatetime = moment(data, "YYYY-MM-DD HH:mm");
    momentExpiringDatetime.add(1, 'h');

    var hideAllData = false;
    var order_expiration = document.getElementById('order-expiration');
    if (mode === 'pickuppoint' && momentCurrentDatetime.isAfter(momentExpiringDatetime)) {
        hideAllData = true;
        order_expiration.innerHTML =
            "Ciao " + nome + ",<br/>" +
            "il tempo a disposizione per il pagamento dell'ordine <b>" + codice + "</b> è scaduto.<br/>Crea un <b><a href='/miele.html'>nuovo ordine</a></b>.";
    } else if (mode === 'pickuppoint' && !momentCurrentDatetime.isAfter(momentExpiringDatetime)) {
        // Print countdown.
        order_expiration = document.getElementById('order-expiration');
        order_expiration.innerText = 'Per completare il pagamento ti restano ';
        countdown(momentExpiringDatetime);
    }

    var htmlDettagliOrdine = dettagli_ordine.replace(/\r\n/g, "<br/>");
    var html =
        "<b>Dettagli ordine</b><br/>" +
        "Codice ordine: " + codice + "<br/>" +
        "Data e ora ordine: " + momentOrderDatetime.format('DD/MM/YYYY HH:mm') + "<br/>" +
        htmlDettagliOrdine +
        "Totale: " + totale + " &euro;<br/>";

    html +=
        "<br/><b>Dati cliente</b><br/>" +
        "Nome e Cognome: " + nome + " " + cognome + "<br/>" +
        "Email: " + email + "<br/>" +
        "Telefono: " + tel + "<br/>";

    if (mode === 'pickuppoint') {
        pp_nome = getParameterByName('puntoritironome', purl);
        pp_indirizzo = getParameterByName('puntoritiroindirizzo', purl);
        pp_orari = getParameterByName('puntoritiroorari', purl);
        html += "<br/><b>Punto di ritiro</b><br/>" +
            pp_nome + "<br/>" +
            pp_indirizzo + "<br/>" +
            pp_orari + "<br/>";
        var bankTransferMode = document.getElementById('bank-transfer');
        bankTransferMode.style.display = "none";
    }

    if (mode === 'shipping') {
        var indirizzo = getParameterByName('indirizzospedizione', purl);
        var htmlIndirizzo = indirizzo.replace(/\r\n/g, "<br/>");
        html += "<br/>" + "<b>Indirizzo di spedizione</b><br/>" + htmlIndirizzo + "<br/>";
    }

    var s = document.getElementById('payment-order-details');
    s.innerHTML = html;

    // Inserisci totale ordine in info modalità pagamento.
    var pr = document.getElementsByClassName('order-amount');
    for (var i = 0; i < pr.length; ++i) {
        pr[i].innerText = totale;
    }

    // Inserisci il codice ordine in info modalità pagamento.
    var cd = document.getElementsByClassName('order-code');
    for (var j = 0; j < cd.length; ++j) {
        cd[j].innerText = codice;
    }

    // Inserisci il last step nelle info modalità pagamento.
    var ls = document.getElementsByClassName('order-last-step');
    for (var x = 0; x < ls.length; ++x) {
        if (mode === 'pickuppoint') {
            ls[x].innerText = "In breve tempo riceverai una mail con la quale potrai ritirare il tuo miele!";
        }
        if (mode === 'shipping') {
            ls[x].innerText = "In poche ore riceverai una mail con il numero di tracking del tuo pacco.";
        }
    }

    if (hideAllData) {
        var dte = document.getElementsByClassName('data-to-show');
        for (var k = 0; k < dte.length; ++k) {
            dte[k].style.display = "none";
        }
    }
}

// Js query string parser.
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Js query string builder.
function serialize(obj, prefix) {
    var str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                serialize(v, k) :
            encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Payment page:
if (document.location.pathname.indexOf('/pagamento') === 0) {
    if (getParameterByName('code', document.location.href)) {
        fillOrderDetails();
    } else {
        window.location.replace('/miele.html');
    }
}

// Coming from an external/address-bar url:
if (document.referrer == '') {
    sessionStorage.clear();
}

function countdown(datetime) {
// Set the date we're counting down to
    countDownDate = new Date(datetime).getTime();

// Update the count down every 1 second
    var x = setInterval(function () {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="countdown".
        var countdownText = '';
        if (days > 0) {
            countdownText += "<b>" + days + "</b>&nbsp;giorni&nbsp;";
        }
        if (hours > 0) {
            countdownText += "<b>" + hours + "</b>&nbsp;ore&nbsp;";
        }
        if (minutes > 0) {
            countdownText += "<b>" + minutes + "</b>&nbsp;minuti&nbsp;";
        }
        if (seconds > 0) {
            countdownText += "e&nbsp;<b>" + seconds + "</b>&nbsp;secondi.";
        }

        document.getElementById("countdown").innerHTML = countdownText;

        // If the count down is finished, write some text.
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("countdown").innerHTML = "Ordine scaduto.";
        }
    }, 1000);
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
};
