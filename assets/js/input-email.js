// Js fill email page.
function fillEmailDetails() {
    var eurl = document.location.href;

    // Get parameter and decode it!
    var purl = getParameterByName('purl', eurl);
    var data = getParameterByName('data', eurl);
    var codice = getParameterByName('code', eurl);
    var nome = getParameterByName('nome', eurl);
    var cognome = getParameterByName('cognome', eurl);
    var email = getParameterByName('email', eurl);
    var tel = getParameterByName('tel', eurl);
    var dettagli_ordine = getParameterByName('dettagli', eurl);
    var totale = getParameterByName('totale', eurl);

    var htmlDettagliOrdine = dettagli_ordine.replace(/\r\n/g, "<br/>");
    var html =
        "<b>Dettagli ordine</b><br/>" +
        "Codice ordine: " + codice + "<br/>" +
        "Data e ora ordine: " + data + "<br/>" +
        htmlDettagliOrdine +
        "Totale: " + totale + " &euro;<br/><br/>";

    html +=
        "<b>Dati cliente</b><br/>" +
        "Nome e Cognome: " + nome + " " + cognome + "<br/>" +
        "Email: " + email + "<br/>" +
        "Telefono: " + tel + "<br/>";

    var indirizzo = getParameterByName('indirizzospedizione', eurl);
    var htmlIndirizzo = indirizzo.replace(/\r\n/g, "<br/>");
    html += "<br/>" + "<b>Indirizzo di spedizione</b><br/>" + htmlIndirizzo + "<br/>";

    var s = document.getElementById('email-payment-details');
    s.innerHTML = html;

    var p = document.getElementById('email-payment-link');
    p.href = purl;
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

// Email page:
if (document.location.pathname.indexOf('/email') === 0) {
    if (getParameterByName('mode', document.location.href) === 'shipping') {
        fillEmailDetails();
    } else {
        window.location.replace('/miele.html');
    }
}

// Coming from an external/address-bar url:
if (document.referrer == '') {
    sessionStorage.clear();
}
