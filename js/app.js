/*

	@ File : map_init.js
	@ Author : HC, Service cartographie du CGET
	@ Date : 24/2019

	@ For : France Services - Carte interactive des contrats et zonages de politiques publiques
	@ Main file : index.html

	@ Description : script d'initialisation du conteneur et de la carte Leaflet.

*/

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
    renderer: L.canvas()
  }).setView([46.5, 6.8], 5.5555,{ animation: true });

// position du conteneur
L.control.zoom({position:'topright'}).addTo(map)

// éléments d'habillage
let files = ['cercles_drom','reg','dep']

loadGeoJSON('reg');
loadGeoJSON('cercles_drom');

function loadGeoJSON(geojson) {
  fetch('data/'+geojson+'.geojson')
    .then(res => res.json())
    .then(res => {
      new L.GeoJSON(res,{
        style:{
          fillColor:'#ffeee0',
          color:'#02419a',
          weight:'1'
        }
      }).addTo(map);
    });
}

fetch('data/reg.geojson')
  .then(res => res.json())
  .then(res => {
    reg = new L.GeoJSON(res,{
      style:{
        fillColor:'#ffeee0',
        color:'blue',
        weight:'1'
      }
    }).addTo(map);
  });

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
sidebar
    .addPanel({
        id:   'js-api',
        tab:  '<i data-feather="info" class="feather-icons"></i>',
        title: 'JS API',
        pane: '<p>The Javascript API allows to dynamically create or modify the panel state.<p/><p><button onclick="sidebar.enablePanel(\'mail\')">enable mails panel</button><button onclick="sidebar.disablePanel(\'mail\')">disable mails panel</button></p><p><button onclick="addUser()">add user</button></b>',
    })
    // add a tab with a click callback, initially disabled
    .addPanel({
        id:   'mail',
        tab:  '<i class="fa fa-envelope"></i>',
        title: 'Messages',
        button: function() { alert('opened via JS callback') },
        disabled: true,
    })

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
        id:   'user' + userid++,
        tab:  '<i data-feather="info" class="feather-icons"></i>',
        title: 'User Profile ' + userid,
        pane: '<p>user ipsum dolor sit amet</p>',
    });
}


feather.replace();
