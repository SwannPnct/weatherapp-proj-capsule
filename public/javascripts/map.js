var mymap = L.map('worldmap').setView([48.866667, 2.333333], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '(c) <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

var customIcon = L.icon({
    iconUrl: '../images/leaf-green.png',
    shadowUrl: '../images/leaf-shadow.png',

    iconSize:     [38, 95], 
    shadowSize:   [50, 64], 

    iconAnchor:   [22, 94], 
    shadowAnchor: [4, 62],  

    popupAnchor:  [-3, -76]
});


$("#custom_list").children("li").each(function() {
    L.marker([$(this).data("lat"), $(this).data("lon")],{icon: customIcon}).addTo(mymap).bindPopup($(this).first().text());
})