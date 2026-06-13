export const MEMBRES = ["Papa", "Maman", "Sara", "Karim", "Lina"];
export const COULEURS_MEMBRES = { Papa:"#E8A838",Maman:"#E86B8A",Sara:"#5BC4BF",Karim:"#7B8CDE",Lina:"#A8E86B" };
export const PIECES_DEFAUT = [
  { id:"huile",nom:"Huile moteur",icone:"🛢️",intervalleKm:5000,intervalleMois:6 },
  { id:"filtre_air",nom:"Filtre à air",icone:"💨",intervalleKm:15000,intervalleMois:12 },
  { id:"filtre_hab",nom:"Filtre habitacle",icone:"🌬️",intervalleKm:15000,intervalleMois:12 },
  { id:"bougies",nom:"Bougies d'allumage",icone:"⚡",intervalleKm:30000,intervalleMois:24 },
  { id:"courroie",nom:"Courroie de distribution",icone:"⚙️",intervalleKm:60000,intervalleMois:48 },
  { id:"freins_av",nom:"Plaquettes avant",icone:"🔴",intervalleKm:40000,intervalleMois:36 },
  { id:"freins_ar",nom:"Plaquettes arrière",icone:"🔴",intervalleKm:50000,intervalleMois:48 },
  { id:"pneus",nom:"Pneus",icone:"🔵",intervalleKm:40000,intervalleMois:48 },
  { id:"liquide_fr",nom:"Liquide de frein",icone:"🧪",intervalleKm:0,intervalleMois:24 },
  { id:"antifreeze",nom:"Liquide refroidissement",icone:"❄️",intervalleKm:0,intervalleMois:24 },
  { id:"batterie",nom:"Batterie",icone:"🔋",intervalleKm:0,intervalleMois:48 },
  { id:"amortisseurs",nom:"Amortisseurs",icone:"🔩",intervalleKm:80000,intervalleMois:60 },
];
export const KM_DEFAUT = 315000;
export const CONFIG_EMAIL_DEFAUT = { serviceId:"",templateId:"",publicKey:"",emailTo:"",notifUrgent:true,notifBientot:true };
export const ICONES_DISPONIBLES = ["🔧","⚙️","🛢️","💨","🌬️","⚡","🔴","🔵","🧪","❄️","🔋","🔩","🪛","🔑","💡","🚿","🛞","🪝"];
