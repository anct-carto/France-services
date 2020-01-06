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

/* -------------------------------------------------------------------------- */
/*                                SIDEBAR                                     */
/* -------------------------------------------------------------------------- */

let sidebar = L.control.sidebar({
    autopan: false,       // whether to maintain the centered map point when opening the sidebar
    closeButton: true,    // whether t add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'left',     // left or right
}).addTo(map);

window.addEventListener('DOMContentLoaded', () => {
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

var userid = 0
function addUser() {
  sidebar.addPanel({
    id: 'user' + userid++,
    tab: '<i data-feather="info" class="feather-icons"></i>',
    title: 'User Profile ' + userid,
    pane: '<p>user ipsum dolor sit amet</p>',
  });
}

feather.replace();

let trouvezMoiBtn = document.getElementById('trouvez-moi');

let searchField = document.getElementById('searchField');

searchField.addEventListener('enter', event => {
  event.preventDefault();
})


trouvezMoiBtn.addEventListener('click', () => {
  // ouvre le panneau latéral
  sidebar.open('autopan');
  // met le curseur sur la zone de texte 
  searchField.focus();
  searchField.select(); 
});

let maxZoom = 9;

/* -------------------------------------------------------------------------- */
/*                          COORDONNEES ESPACES                               */
/* -------------------------------------------------------------------------- */
/* marker init */

let customMarker = L.icon({
  iconUrl: 'img/picto_off1.png',
  iconSize: [23, 30],
  // iconAnchor: [12, 30]
});

console.log(customMarker);


fetch('data/france_services.geojson')
  .then(res => res.json())
  .then(res => {
    let france_services = new L.GeoJSON(res,{
      pointToLayer: (feature,latlng) => {
        return L.marker(latlng,
          { icon: customMarker})
      },
      onEachFeature: function (feature,layer) {
        layer.bindTooltip(feature.properties.lib_france_services);
        layer.on('click', function(e) {
          sidebar.open('autopan');
          map.flyTo(e.latlng,maxZoom,{animate:true, duration:1})
        })
      }
    }).addTo(map);

    listFeatures = res.features.map((e) => {
      return e.properties.lib_france_services;
    });

    console.log(listFeatures);
    new Awesomplete(searchField,{ //
      minChars: 1,
      list: listFeatures});

    searchField.addEventListener('awesomplete-selectcomplete', e => {
      let value = searchField.value;
      for (let i in listFeatures) {
        console.log(listFeatures[i]);     
        if (listFeatures[i].toLowerCase() == value.toLowerCase()) {
          let libCom = value.toString();
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

/* -------------------------------------------------------------------------- */
/*                          MARQUEUR PONCTUEL                                 */
/* -------------------------------------------------------------------------- */

