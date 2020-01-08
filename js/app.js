/*

	@ File : app.js
	@ Author : HC, service cartographie de l'ANCT
	@ Created : 24/12/2019

	@ Project : Carte interactive des espaces France Services
	@ Main file : index.html

	@ Description : script de fonctionnement principal

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
  }).setView([46.5, 6.8], 5.5555,{animation: true});

// attribution
map.attributionControl.addAttribution("<a href = 'https://cartotheque.cget.gouv.fr/' target = '_blank'>Agence nationale de la cohésion des territoires</a>");

// position du conteneur
map.addControl(new L.Control.ZoomMin({position:'topright'}))

// éléments d'habillage

// styles des couches
let reg_style = {
  fillColor:'#ffeee0',
  // fillColor:'rgb(255, 237, 225)',
  color:'rgba(0, 0, 0, .4)',
  weight:'1'
};

let cercles_drom_style = {
  fillColor:'#ffeee0',
  color:'white',
  weight:'.5'
};

loadGeoJSON('cercles_drom',cercles_drom_style);
loadGeoJSON('reg',reg_style);

// files.forEach(file => { loadGeoJSON(file)})

function loadGeoJSON(geojson,style) {
  fetch('data/' + geojson + '.geojson')
    .then(res => res.json())
    .then(res => {
      new L.GeoJSON(res,{
        style:style
      }).addTo(map);
    });
};

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

// be notified when a panel is opened
sidebar.on('content', function (ev) {
    switch (ev.id) {
        case 'autopan':
        sidebar.options.autopan = true;
        searchField.focus();
        break;
        default:
          searchField.value = ''
          ficheInfo.innerHTML = '';
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
};

let trouvezMoiBtn = document.getElementById('trouvez-moi');

let searchField = document.getElementById('searchField');

searchField.addEventListener('coucou', event => {
  event.preventDefault();
})


trouvezMoiBtn.addEventListener('click', () => {
  // ouvre le panneau latéral
  sidebar.open('autopan');
  // met le curseur sur la zone de texte 
  searchField.focus();
  searchField.select(); 
});


/* -------------------------------------------------------------------------- */
/*                          COORDONNEES ESPACES                               */
/* -------------------------------------------------------------------------- */
/* marker init */

let customMarker = L.icon({
  iconUrl: './img/picto_off1_Plan de travail 1.png',
  iconSize: [23, 30],
  iconAnchor: [12, 30]
});

let listFs = [];
let france_services
fetch('data/france_services.geojson')
  .then(res => res.json())
  .then(res => {
    france_services = new L.GeoJSON(res,{
      pointToLayer: (feature,latlng) => {
        return L.marker(latlng,
          { icon: customMarker})
      },
      onEachFeature: function (feature,layer) {
        layer.bindTooltip(feature.properties.lib_com);
        layer.on('click', function(e) {
          showFiche(feature.properties);
          zoomTo(e.latlng);
        })
      }
    }).addTo(map);

    /* Création d'une liste vide pour accueillir les attributs des entités */
    let listFeatures = [];

    for (let i in res.features)  {
      let france_services = res.features[i];
      
      /* Remplacement des champs vides par l'attribut 'non renseigné' */
      for (let j in france_services.properties) {
        if (france_services.properties[j] == null) {
          france_services.properties[j] = 'Non renseigné'
        }
      };

      /* Remplissage de la liste par les propriétés des entités */
      listFeatures.push(france_services)
    }
    
  /* -------------------------------------------------------------------------- */
  /*                          CHAMP de RECHERCHE                                */
  /* -------------------------------------------------------------------------- */
    
    let listNouns = res.features.map((e) => {
      return e.properties.lib_com;
    });

    new Awesomplete(searchField,{ //
      minChars: 1,
      list: listNouns
    });
    
    searchField.addEventListener('awesomplete-selectcomplete', e => {  
      let value = searchField.value; 
      listNouns.forEach(com => {      
        if (com.toLowerCase() === value.toLowerCase()) {            
          let libCom = value.toString();
          console.log('trouvé'); // vérifier que la commune se trouve dans la liste
          listFeatures.forEach(feature => {         
            if (libCom === feature.properties.lib_com) {
              for (let i in feature) {
                /* affichage de la fiche info */                             
                showFiche(feature.properties);
                /* zoom sur l'entité */
                zoomTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);                
              }
            }
          })
        }  
      })
    });
  });

/* -------------------------------------------------------------------------- */
/*                                FICHE INFO                                  */
/* -------------------------------------------------------------------------- */

/* Fonction permettant de mettre plusieurs attributs en une fois */
Element.prototype.setAttributes = function (attrs) {
  for (var idx in attrs) {
    if ((idx === 'styles' || idx === 'style') && typeof attrs[idx] === 'object') {
      for (var prop in attrs[idx]) { this.style[prop] = attrs[idx][prop]; }
    } else if (idx === 'html') {
      this.innerHTML = attrs[idx];
    } else {
      this.setAttribute(idx, attrs[idx]);
    }
  }
};

/* 1. Création du conteneur accueillant les infos */
let contentPanel = document.getElementById('autopan');
let ficheInfo = document.createElement('div')
ficheInfo.setAttribute('id','ficheInfo');

function showFiche(point) {
  /* initialisation de la fiche */
  ficheInfo.innerHTML = '';

  /* création du séparateur */
  hr = document.createElement('hr');
  
  /* Nom de l'espace France services */
  nomEspace = document.createElement('h3');
  nomEspace.innerText = point.lib_france_services;

  let toto = point.result_label.split(' ');

  /* Ligne adresse */
  let adresse = createPictoInfo('p',point.result_label, 'map-pin');

  /* Création de la table des horaires */
  ficheHoraire = document.createElement('table');
  /* Header de la table 'Horaires' */
  
  thead = createPictoInfo('thead','Horaires','clock')
  // thead.appendChild(clock);
  thead.style.fontWeight = 'bold'
  
  /* corps de la table */
  tbody = document.createElement('tbody');
  
  for (let i in point) {
    
    if (i[0] == "h") {
      tr = document.createElement('tr');
      
      tdJour = document.createElement('td');
      tdHoraire = document.createElement('td');
      
      jour = i[2].toUpperCase() + i.substring(3, i.length);
      
      tdJour.innerText = jour;
      tdHoraire.innerText = point[i];
      
      tr.appendChild(tdJour);
      tr.appendChild(tdHoraire);
      tbody.appendChild(tr);
    }
  };
  /* Ajout de l'entête et des lignes */
  ficheHoraire.appendChild(thead);
  ficheHoraire.appendChild(tbody);

  /* Contact */
  contact = createPictoInfo('p','Contact','send');
  
  /* Stockage de tous les éléments de la fiche dans une liste */
  elementsFiche = [hr, nomEspace, adresse, ficheHoraire, contact];

  /* Ajout au conteneur ficheInfo */
  elementsFiche.forEach(e => {
    ficheInfo.appendChild(e)
  });

  contentPanel.appendChild(ficheInfo);

  /* 3. Ajout des infos */
  if (sidebar.open('autopan') == true) {  
      contentPanel.appendChild(ficheInfo);
  } else {
    sidebar.open('autopan');
    contentPanel.appendChild(ficheInfo);
  };
};


function zoomTo(latlng) {
  let maxZoom = 9;
  map.flyTo(latlng, maxZoom, { animate: true, duration: 1 })
};

/* Générer l'affichage des données accompagné de pictos */

function createPictoInfo(tag_html,text,svgPic) {
  
  // 1. import du pictogramme
  picto = document.createElement('img');
  picto.setAttributes({
    'src': 'img/' + svgPic + '.svg',
    'class': 'picto-fiche'
  });
    
  // 2. Génération du texte
  p = document.createElement(tag_html);
  text = document.createTextNode(text);

  // 3. Fusion texte et picto
  [picto, text].forEach(e => {
    p.appendChild(e);
  });

  return p;
}

feather.replace();

let refreshBtn = document.querySelector('button#refresh');

refreshBtn.addEventListener('click', event => {
  event.preventDefault();
  searchField.value = ''
  ficheInfo.innerHTML = '';
  resetView();
})

function resetView() {
  map.setView([46.5, 6.8], 5.5555, { animation: true })
}
