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

// initialisation de la carte
let map = L.map('mapid', {
  zoomSnap: 0.25,
  zoomControl: false,
  renderer: L.canvas(),
}).setView([46.5, 2.55], 5.5555,{animation: true});

let carto_db = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: ' Fond cartographique &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
  minZoom:5.55
}).addTo(map);

// attribution
map.attributionControl
   .addAttribution("| <a href = 'https://cartotheque.cget.gouv.fr/' target = '_blank'>ANCT</a>");

// échelle
L.control.scale({ position: 'bottomright' }).addTo(map);

// position du conteneur
map.addControl(new L.Control.ZoomMin({position:'topright'}));

// supprimer tous les marqueurs au clic
// map.addEventListener('click',resetView())

let zoomMin = document.querySelectorAll('.leaflet-control-zoom-min');
console.log(zoomMin);

zoomMin[0].addEventListener('click', () => {
  resetView();
})

// éléments d'habillage
// styles des couches
let reg_style = {
  fillColor:'#ffeee0',
  color:'rgba(0, 0, 0, .4)',
  weight:'1'
};

let cercles_drom_style = {
  fillColor:'#ffeee0',
  color:'white',
  weight:'.5'
};


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
/*                                ZOOM DROM                                   */
/* -------------------------------------------------------------------------- */

let liste_drom = document.getElementById("goTo");

liste_drom.addEventListener('change', (e) => {
  option = e.target.selectedOptions[0];
  switch (option.value) {
    case "met":
      return map.flyTo([46.5, -3.55], 5.5555, { animation: true, duration: 1 });     
      // break;
    case "glp":
      return map.setView([16.25, -61.706], 10, { animation: true });
    case "mtq":
      return map.setView([14.68, -61.2], 10, { animation: true });
    case "guf":
      return map.setView([3.92, -54.5], 7.855, { animation: true });
    case "reu":
      return map.setView([-21.11, 55.28], 10, { animation: true });
    case "myt":
      return map.setView([-12.81, 45.06], 11, { animation: true });
    default:
      return map.setView([46.5, 0], 5.5555, { animation: true })
      // break;
  }
});



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
searchField.addEventListener('keydown', field => {
  if (field.value != '') {
    resetSearchBtn.style.display = 'block'
  } else {
    resetSearchBtn.style.display = 'none'    
  }
});

trouvezMoiBtn.addEventListener('click', () => {
  // ouvre le panneau latéral
  sidebar.open('autopan');
  // met le curseur sur la zone de texte 
  searchField.focus();
});

/* -------------------------------------------------------------------------- */
/*                          MARQUEURS PONCTUELS                               */
/* -------------------------------------------------------------------------- */

/* marker init */
let markerOff = L.icon({
  iconUrl: './img/picto_off.png',
  iconSize: [11,11]
});

let markerOver = L.icon({
  iconUrl: './img/picto_over.png',
  iconSize: [25,25]
});

let markerClicked = L.icon({
  iconUrl: './img/picto_clicked.png',
  iconSize: [35,35]
});

let marker = {};


function addClickedMarker(lat,long,lib_com) {
  removeClickedMarker();
  marker = L.marker([lat, long], { icon: markerClicked })
            .bindTooltip(lib_com,{
              direction:'center',
              permanent:true,
              className:'leaflet-tooltip-clicked'})
            .addTo(map);
  zoomTo([lat, long])
}

function removeClickedMarker() {
  if (marker != undefined) {
    map.removeLayer(marker)
  };
};


/* -------------------------------------------------------------------------- */
/*                          AFFICHAGE DES POINTS                              */
/* -------------------------------------------------------------------------- */

let france_services; 

fetch('data/france_services.geojson')
  .then(res => res.json())
  .then(res => {
    console.log(res);
    
    res.features.forEach(feature => {
      lat = feature.properties.LATITUDE;
      long = feature.properties.LONGITUDE;

      marker = new L.marker([lat,long],{
         icon: markerOff 
      }).bindTooltip(feature.properties.lib_com, {
        direction: 'center',
        className: 'leaflet-tooltip'
      }).on('mouseover', e => {
        if (e.target.className != 'clicked') {
          e.target.setIcon(markerOver)
        } else {
          e.target.setIcon(markerClicked, { className: 'clicked' })
        }
      }).on('mouseout', e => {
        if (e.target.className != 'clicked') {
          e.target.setIcon(markerOff)
        } else {
          e.target.setIcon(markerClicked, { className: 'clicked' })
        }
      }).on('click', e => {
        showFiche(feature.properties);
      }).addTo(map)      
    });
    
    /* Création d'une liste vide pour accueillir les attributs des entités */
    let listFeatures = [];
    
    for (let i in res.features)  {
      let france_services = res.features[i];
      
      /* Remplacement des champs vides par l'attribut 'non renseigné' */
      for (let j in france_services.properties) {
        if (france_services.properties[j] == "") {
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
      return e.properties.lib_com + ' (' + e.properties.code_postal + ')';
    });

    new Awesomplete(searchField,{ //
      minChars: 2,
      list: listNouns
    });
    
    searchField.addEventListener('awesomplete-selectcomplete', e => {  
      let value = searchField.value; 
      listNouns.forEach(com => {
        if (com.toLowerCase() === value.toLowerCase()) {            
          let libCom = value.toString();
          listFeatures.forEach(feature => {
            result = feature.properties.lib_com + ' (' + feature.properties.code_postal + ')';         
            if (libCom === result) {
              for (let i in feature) {
                /* affichage de la fiche info */                             
                showFiche(feature.properties);
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

// bouton réinitialiser la recherche
let resetSearchBtn = document.getElementById('resetSearch');

resetSearchBtn.addEventListener('click', event => {
  event.preventDefault();
  resetSearchBtn.style = { display: 'none' }
  searchField.value = ''
  ficheInfo.innerHTML = '';
  resetView();
  removeClickedMarker()
})



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
  addClickedMarker(point.LATITUDE, point.LONGITUDE, point.lib_com)
  /* initialisation de la fiche */
  ficheInfo.innerHTML = '';

  /* création du séparateur */
  hr = document.createElement('hr');
  
  /* Nom de l'espace France services */
  nomEspace = document.createElement('h2');
  nomEspace.innerText = point.lib_france_services;

  /* Ligne adresse */
  let adresse = writeInfo('p', point.ADRESSE + ' ' + isNotEmpty(point["COMPLEMENT.D.ADRESSE"]) + ' ' + point.code_postal + ' ' + point.lib_com, 'map-pin');

  /* Création de la table des horaires */
  ficheHoraire = document.createElement('table');
  /* Header de la table 'Horaires' */
  
  thead = writeInfo('thead','Horaires','clock')
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

  /* mel */
  mail = writeInfo('p', point["CONTACT.MAIL"], 'mail');
  /* tel */
  tel = writeInfo('p', point["TELEPHONE"], 'phone')
  
  /* Stockage de tous les éléments de la fiche dans une liste */
    elementsFiche = [hr, nomEspace, adresse, ficheHoraire, mail, tel];

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
  let maxZoom = 15;
  map.panTo(latlng, maxZoom, { animate: true, duration: 2 })
};

/* Concaténer information (exemple : adresse) avec picto associé (pin) */
function writeInfo(tag_html,text,svgPic) {
  /* dictionnaire des variables :
   1. tag_html = élément html à créer (exemple : 'p' pour balise <p></p>) 
   2. text = texte (en format texte) à afficher dans le texte 
   3. svgPic = nom du fichier .svg à importer */
   
 // 1. Génération du texte
 p = document.createElement(tag_html);
 text = document.createTextNode(text);

  // 2. import du pictogramme
  picto = document.createElement('img');
  picto.setAttributes({
    'src': 'img/' + svgPic + '.svg',
    'class': 'picto-fiche'
  });

  // 3. Fusion texte et picto
  [picto, text].forEach(e => {
    p.appendChild(e);
  });

  return p;
};

function resetView() {
  map.setView([46.5, 0], 5.5555, { animation: true })
}

function isNotEmpty(field) {
  if (field != "Non renseigné") {
    return field;
  } else {
    return ''
  }
}


feather.replace();
