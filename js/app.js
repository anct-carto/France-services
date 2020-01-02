/*

	@ File : map_init.js
	@ Author : HC, service cartographie de l'ANCT
	@ Date : 24/2019

	@ Project : Carte interactive des espaces France Services
	@ Main file : index.html

	@ Description : script d'initialisation du conteneur et de la carte Leaflet.

*/

/* -------------------------------------------------------------------------- */
/*                                INIT MAP                                    */
/* -------------------------------------------------------------------------- */

// bloquer le défilement infini de la carte
let soutWest = L.latLng(55, -23);
let northEast = L.latLng(37, 26);
let bounds = L.latLngBounds(soutWest, northEast);

// initialisation de la carte
let map = L.map('mapid', {
    maxBounds: bounds,
    maxZoom: 11,
    minZoom: 5.5555,
    zoomSnap: 0.25,
    zoomControl: false,
    renderer: L.canvas(),
    // attributionControl: true,
    // addAttribution:'ANCT'
  }).setView([46.5, 6.8], 5.5555,{animation: true});
map.attributionControl.addAttribution("<a href = 'https://cartotheque.cget.gouv.fr/' target = '_blank'>Agence nationale de la cohésion des territoires</a>");
// position du conteneur
map.addControl(new L.Control.ZoomMin({position:'topright'}))

let zoomMinImg = document.querySelector('.leaflet-control-zoom-min');
zoomMinImg.innerHTML = '<i data-feather="map-pin" class = "feather-icons"></i>'

// éléments d'habillage
let files = ['cercles_drom','reg']

// styles des couches
let reg_style = {
  fillColor:'#ffeee0',
  color:'#02419a',
  weight:'1'
};

let cercles_drom_style = {
  fillColor:'#ffeee0',
  color:'#02419a',
  weight:'1'
}

files.forEach(file => { loadGeoJSON(file)})

function loadGeoJSON(geojson) {
  fetch('data/' + geojson + '.geojson')
    .then(res => res.json())
    .then(res => {
      new L.GeoJSON(res,{
        style:geojson+"_style"
      }).addTo(map);
    });
}

function refresh() {
  map.setView([lat, lon], 6);
}
/* -------------------------------------------------------------------------- */
/*                                SIDEBAR                                     */
/* -------------------------------------------------------------------------- */

let sidebar = L.control.sidebar({
    autopan: false,       // whether to maintain the centered map point when opening the sidebar
    closeButton: true,    // whether t add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'left',     // left or right
}).addTo(map);

window.addEventListener('DOMContentLoaded', function () {
  sidebar.open('home');
})

// add panels dynamically to the sidebar
// sidebar
//     .addPanel({
//         id:   'js-api',
//         tab:  '<i data-feather="info" class="feather-icons"></i>',
//         title: 'JS API',
//         pane: '<p>The Javascript API allows to dynamically create or modify the panel state.<p/><p><button onclick="sidebar.enablePanel(\'mail\')">enable mails panel</button><button onclick="sidebar.disablePanel(\'mail\')">disable mails panel</button></p><p><button onclick="addUser()">add user</button></b>',
//     })

// be notified when a panel is opened
sidebar.on('content', function (ev) {
    switch (ev.id) {
        case 'autopan':
        sidebar.options.autopan = true;
        break;
        default:
        sidebar.options.autopan = true;
    }
});

let trouvezMoi = document.getElementById('trouvez-moi');
trouvezMoi.addEventListener('click', () => {
  sidebar.open('autopan')
})


var userid = 0
function addUser() {
    sidebar.addPanel({
        id:   'user' + userid++,
        tab:  '<i data-feather="info" class="feather-icons"></i>',
        title: 'User Profile ' + userid,
        pane: '<p>user ipsum dolor sit amet</p>',
    });
}

feather.replace();


let maxZoom = 9;

/* -------------------------------------------------------------------------- */
/*                          COORDONNEES ESPACES                               */
/* -------------------------------------------------------------------------- */

// loadGeoJSON('france_services')
let searchField = document.getElementById('searchField');

fetch('data/france_services.geojson')
  .then(res => res.json())
  .then(res => {
    let france_services = new L.GeoJSON(res,{
      style:"_style",
      onEachFeature: function (feature,layer) {
        layer.bindTooltip(feature.properties.lib_france_services);
        layer.on('click', function(e) {
          sidebar.open('autopan');
          map.flyTo(e.latlng,maxZoom,{animate:true, duration:1})
        })
      }
    }).addTo(map);

    listFeatures = res.features.map((e) => {
      return e.properties;
    });

    console.log(listFeatures);
    new Awesomplete(searchField,{ //
      minChars: 1,
      list: listFeatures});

    searchField.addEventListener('awesomplete-selectcomplete', e => {
      let value = searchField.value;
      for (let i in listFeatures) {
        if (listFeatures[i].properties.lib_com.toLowerCase() == value.toLowerCase()) {
          let libCom = com.toString();
          console.log('trouvé'); // vérifier que la commune se trouve dans la liste

        }
      }
    })

  });

/* -------------------------------------------------------------------------- */
/*                          CHAMP de RECHERCHE                                */
/* -------------------------------------------------------------------------- */
// let searchButton = document.getElementById('searchButton');

// // prevent refresh
// searchButton.addEventListener('click', function(event){
//   event.preventDefault();
// });
