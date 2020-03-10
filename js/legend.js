let legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info-legende');
    labels = ['<strong>Type de structure</strong>'],
        categories = ['France Services', 
        'France Services itinérante', 
        'Antenne', 
        'Antenne itinérante'];

    for (var i = 0; i < categories.length; i++) {

        div.innerHTML +=
            labels.push(
                '<img src="img/legende/' + categories[i] + '.png" class = "picto_legende"> ' +
                (categories[i] ? categories[i] : '+'));

    }
    div.innerHTML = labels.join('<br>');
    return div;
};
legend.addTo(map);