window.onload = function() {
    const phone = "3280874675";

    // Label WA message.
    var lblMessage = "Ciao\, ti scrivo riguardo a: " + window.location.href;
    sendWAMessageUrl('wa-label-link', phone, lblMessage);
};

// WA send message helper.
function sendWAMessageUrl( elementId, phone, message ) {
    var url = "https://api.whatsapp.com/send?";
    url += "phone=39" + phone;
    url += "&text=" + message;
    var e = document.getElementById( elementId );
    e.setAttribute("href", url);
}
