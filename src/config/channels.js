export const TNT_CHANNELS = [
  { uuid: 'uuid-webtv-612', name: 'TF1', number: 1 },
  { uuid: 'uuid-webtv-201', name: 'France 2', number: 2 },
  { uuid: 'uuid-webtv-202', name: 'France 3', number: 3 },
  { uuid: 'uuid-webtv-203', name: 'France 5', number: 5 },
  { uuid: 'uuid-webtv-613', name: 'M6', number: 6 },
  { uuid: 'uuid-webtv-204', name: 'Arte', number: 7 },
  { uuid: 'uuid-webtv-372', name: 'C8', number: 8 },
  { uuid: 'uuid-webtv-373', name: 'W9', number: 9 },
  { uuid: 'uuid-webtv-497', name: 'TMC', number: 10 },
  { uuid: 'uuid-webtv-374', name: 'TFX', number: 11 },
  { uuid: 'uuid-webtv-375', name: 'NRJ 12', number: 12 },
  { uuid: 'uuid-webtv-376', name: 'France 4', number: 14 },
  { uuid: 'uuid-webtv-400', name: 'BFM TV', number: 15 },
  { uuid: 'uuid-webtv-679', name: 'CNews', number: 16 },
  { uuid: 'uuid-webtv-678', name: 'CStar', number: 17 },
  { uuid: 'uuid-webtv-677', name: 'Gulli', number: 18 },
  { uuid: 'uuid-webtv-993', name: 'TF1 SF', number: 19 },
  { uuid: 'uuid-webtv-994', name: "L'Equipe", number: 21 },
  { uuid: 'uuid-webtv-995', name: '6ter', number: 22 },
  { uuid: 'uuid-webtv-996', name: 'RMC Story', number: 23 },
  { uuid: 'uuid-webtv-997', name: 'RMC Découverte', number: 24 },
];

export const CHANNEL_MAP = Object.fromEntries(
  TNT_CHANNELS.map((ch) => [ch.uuid, ch])
);
