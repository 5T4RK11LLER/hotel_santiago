/* Datos de habitaciones — tarifas de referencia (Holiplus · Hotel Santiago), USD */
/* Fotos locales (carpeta img/): 472 doble · 513 y 645 king con vista · 914 y 926 suite dúplex */
const P = n => `img/hab-${n}.jpg`;
const GALLERY = {
  "estandar":[472,513,645], "junior":[513,645,914], "real":[645,472,513],
  "junior-real":[914,513,645], "grand":[926,914,513], "master":[914,926,645], "presidencial":[926,914,645]
};
 
/* cat: estandar | junior | real | suites */
const ROOMS = [
 {id:"estandar",name:"Habitación Estándar",cat:"estandar",units:null,guests:2,size:28,bed:"1 King o 2 dobles",from:38,
  desc:"Habitación luminosa y funcional, ideal para estancias cortas con la mejor relación calidad-precio.",
  plans:[["Oferta base (alojamiento)",38],["Alojamiento y desayuno",253.01],["Media pensión",354.22],["Alojamiento y desayuno · tramo alto",433.73],["Media pensión · tramo alto",534.94]]},
 {id:"junior",name:"Habitación Junior Suite",cat:"junior",units:15,guests:3,size:38,bed:"1 King + sofá cama",from:578.31,
  desc:"Espacio amplio con zona de estar integrada y vistas a la ciudad.",
  plans:[["Alojamiento y desayuno",578.31],["Media pensión",679.52]]},
 {id:"real",name:"Habitación The Level",cat:"real",units:44,guests:3,size:34,bed:"1 King",from:397.59,
  desc:"Atención personalizada y detalles de cortesía en una habitación elegante y tranquila.",
  plans:[["Alojamiento y desayuno",397.59],["Media pensión",498.80],["Alojamiento y desayuno · tramo alto",614.46],["Media pensión · tramo alto",715.66]]},
 {id:"junior-real",name:"Junior Suite The Level",cat:"junior",units:14,guests:3,size:42,bed:"1 King + sofá cama",from:650.60,
  desc:"Junior Suite de la categoría The Level: sala independiente y atención preferente.",
  plans:[["Alojamiento y desayuno",650.60],["Media pensión",751.81]]},
 {id:"grand",name:"Grand Suite The Level",cat:"suites",units:2,guests:4,size:60,bed:"1 King + 2 individuales",from:795.18,
  desc:"Suite de gran formato con salón, comedor y baño de lujo.",
  plans:[["Alojamiento y desayuno",795.18],["Media pensión",896.39]]},
 {id:"master",name:"Master Suite The Level",cat:"suites",units:1,guests:4,size:75,bed:"1 King",from:954.22,
  desc:"Una única suite master con espacios diferenciados y máxima privacidad.",
  plans:[["Alojamiento y desayuno",954.22],["Media pensión",1055.42]]},
 {id:"presidencial",name:"Suite Presidencial The Level",cat:"suites",units:1,guests:5,size:110,bed:"1 King + 2 camas",from:1200,
  desc:"La máxima categoría del hotel. Tarifa sujeta a cotización: consúltanos para confirmar disponibilidad.",
  plans:[["Cotización referencial (alojamiento y desayuno)",1200],["Cotización referencial (media pensión)",1300]],quote:true}
];
ROOMS.forEach(r=>r.imgs=GALLERY[r.id].map(P));
 
const AMENITIES=[["📺","TV por cable"],["🚿","Ducha"],["🔐","Caja fuerte"],["📶","WiFi gratis"],["🖥️","Escritorio"],["🧊","Refrigerador"],["🌇","Balcón"],["🛁","Bañera"],["🏙️","Vista a la ciudad"]];
const FEATURES=["<b>WiFi:</b> alta velocidad de cortesía","<b>Clima:</b> aire acondicionado y calefacción individual","<b>Entretenimiento:</b> TV pantalla plana con cable","<b>Trabajo:</b> escritorio ergonómico","<b>Seguridad:</b> caja fuerte en la habitación","<b>Comunicación:</b> teléfono directo con buzón","<b>Comodidad:</b> despertador, plancha y tabla"];
/* unit: night = por habitación y noche · stay = por habitación y estancia */
const EXTRAS=[{id:"buffet",n:"Desayuno buffet",p:12,unit:"night"},{id:"park",n:"Parqueo",p:8,unit:"night"},{id:"late",n:"Late Check-Out",p:20,unit:"stay"},{id:"spa",n:"Acceso a Spa",p:25,unit:"stay"}];
const FILTERS=[["all","Todos"],["estandar","Estándar"],["junior","Junior Suite"],["real","The Level"],["suites","Suites"]];
 