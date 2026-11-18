// Sample CALABARZON destinations + quiz questions.
// Photos and panoramas use picsum.photos placeholders so the app looks complete on first run.
// Admins can replace them with real images from Admin > Destinations > Edit.
// Question tuple: [question, options, correctIndex, explanation]
export const SEED_DESTINATIONS = [
  {
    "name": "Rizal Shrine",
    "address": "Rizal Street, Calamba City, Laguna",
    "category": "Heritage",
    "description": "A reconstruction of the ancestral house where Dr. José Rizal, the national hero, was born. The house is a museum of his family life, childhood and writings.\n\nJosé Rizal was born in Calamba on June 19, 1861, the seventh of eleven children of Francisco Mercado and Teodora Alonso. The original stone-and-wood house was damaged over the years, and the present structure was rebuilt to resemble it. Rizal later wrote the novels Noli Me Tangere and El Filibusterismo, which helped awaken Filipino nationalism.\n\nThe shrine lets visitors see the home life of a Filipino ilustrado family of the 19th century. It is a place of pilgrimage for students and a reminder of how education, writing and courage shaped the nation.",
    "latitude": 14.2114,
    "longitude": 121.1653,
    "image": "https://picsum.photos/seed/rizal-shrine/900/560",
    "panorama": "https://picsum.photos/seed/rizal-shrine-pano/2400/800",
    "questions": [
      [
        "In which town was José Rizal born?",
        [
          "Calamba",
          "Tanauan",
          "Kawit",
          "Taal"
        ],
        0,
        "Rizal was born in Calamba, Laguna, and the shrine is a reconstruction of his family home there."
      ],
      [
        "In what year was Rizal born?",
        [
          "1851",
          "1861",
          "1871",
          "1881"
        ],
        1,
        "José Rizal was born on June 19, 1861."
      ],
      [
        "Which of these novels did Rizal write?",
        [
          "Banaag at Sikat",
          "Noli Me Tangere",
          "Florante at Laura",
          "Dasalan"
        ],
        1,
        "Noli Me Tangere (1887) is one of Rizal's two famous novels, along with El Filibusterismo."
      ]
    ]
  },
  {
    "name": "Pagsanjan Falls",
    "address": "Pagsanjan, Laguna",
    "category": "Falls",
    "description": "A tall, tiered waterfall reached by a thrilling banca ride up a narrow river gorge. Skilled boatmen paddle and guide visitors through the rapids.\n\nThe falls, also known as Magdapio Falls, sit within a lush river gorge in the town of Pagsanjan. The town grew as a river port and later became famous for its \"shooting the rapids\" boat trips, which drew local and foreign travelers for decades.\n\nThe falls support the livelihood of local boatmen and show how a community can turn its natural heritage into sustainable tourism. Respect for the river and its gorge keeps the site alive for the next generation.",
    "latitude": 14.2916,
    "longitude": 121.4581,
    "image": "https://picsum.photos/seed/pagsanjan-falls/900/560",
    "panorama": "https://picsum.photos/seed/pagsanjan-falls-pano/2400/800",
    "questions": [
      [
        "In which province is Pagsanjan Falls located?",
        [
          "Quezon",
          "Cavite",
          "Laguna",
          "Rizal"
        ],
        2,
        "Pagsanjan is a town in the province of Laguna."
      ],
      [
        "What is another name for Pagsanjan Falls?",
        [
          "Hinulugang Taktak",
          "Magdapio Falls",
          "Tinago Falls",
          "Maria Cristina Falls"
        ],
        1,
        "Magdapio Falls is another name for Pagsanjan Falls."
      ],
      [
        "How do visitors usually reach the falls?",
        [
          "Cable car",
          "Jeepney",
          "Banca ride up the gorge",
          "Horse carriage"
        ],
        2,
        "Visitors ride a banca paddled by skilled boatmen up the river gorge."
      ]
    ]
  },
  {
    "name": "Taal Heritage Town",
    "address": "Poblacion, Taal, Batangas",
    "category": "Heritage",
    "description": "A town of centuries-old ancestral houses, cobbled streets and Spanish-era architecture, known for its embroidery, balisong knives and tapa.\n\nTaal was rebuilt on higher ground after the 1754 eruption of Taal Volcano destroyed the older settlement. Its streets are lined with ancestral houses such as the home of Marcela Agoncillo, who sewed the first Philippine flag in 1898.\n\nTaal preserves a living picture of Filipino-Spanish colonial life and local crafts. Locals still practice embroidery and blade-making, so visitors meet culture as a working tradition, not only a monument.",
    "latitude": 13.8786,
    "longitude": 120.9231,
    "image": "https://picsum.photos/seed/taal-heritage/900/560",
    "panorama": "https://picsum.photos/seed/taal-heritage-pano/2400/800",
    "questions": [
      [
        "Which volcano eruption in 1754 led to the rebuilding of Taal town?",
        [
          "Mayon",
          "Taal",
          "Pinatubo",
          "Bulusan"
        ],
        1,
        "The 1754 eruption of Taal Volcano destroyed the old settlement, so the town was rebuilt on higher ground."
      ],
      [
        "Who sewed the first Philippine flag, whose ancestral house is in Taal?",
        [
          "Marcela Agoncillo",
          "Gabriela Silang",
          "Melchora Aquino",
          "Teresa Magbanua"
        ],
        0,
        "Marcela Agoncillo sewed the first Philippine flag in 1898, and her ancestral house is in Taal."
      ],
      [
        "Taal is famous for which blade?",
        [
          "Kris",
          "Barong",
          "Balisong",
          "Bolo"
        ],
        2,
        "Taal is known for the balisong, a folding \"butterfly\" knife."
      ]
    ]
  },
  {
    "name": "Basilica of St. Martin de Tours",
    "address": "Poblacion, Taal, Batangas",
    "category": "Churches",
    "description": "One of the largest Catholic churches in the Philippines, standing on a hill above Taal town with a grand stone facade and wide interior.\n\nThe basilica honors St. Martin of Tours, patron saint of Taal. Earlier churches on the site were lost to disasters, and the present building was completed in the 19th century in the town's new location.\n\nThe basilica is the spiritual center of Taal and a symbol of community faith and resilience. Pilgrims and visitors come for Mass, festivals and the view over the town.",
    "latitude": 13.8789,
    "longitude": 120.9262,
    "image": "https://picsum.photos/seed/taal-basilica/900/560",
    "panorama": "https://picsum.photos/seed/taal-basilica-pano/2400/800",
    "questions": [
      [
        "Who is the patron saint honored by the basilica?",
        [
          "St. Joseph",
          "St. Martin of Tours",
          "St. Peter",
          "St. Francis"
        ],
        1,
        "The basilica is dedicated to St. Martin of Tours, the patron saint of Taal."
      ],
      [
        "In which province is the basilica located?",
        [
          "Batangas",
          "Laguna",
          "Cavite",
          "Rizal"
        ],
        0,
        "The basilica stands in the town of Taal, Batangas."
      ],
      [
        "What kind of heritage site is this basilica mainly?",
        [
          "A fortress",
          "A church",
          "A lighthouse",
          "A market"
        ],
        1,
        "It is a Catholic church, one of the largest in the country."
      ]
    ]
  },
  {
    "name": "Taal Volcano View, Tagaytay",
    "address": "Tagaytay Ridge, Tagaytay City, Cavite",
    "category": "Nature",
    "description": "A cool ridge-top viewpoint that looks over Taal Lake and Taal Volcano Island, one of the most photographed views in the country.\n\nTaal Volcano sits on an island inside Taal Lake and is one of the Philippines' most active volcanoes. Large eruptions in 1754, 1911 and 2020 reshaped the land and the communities around the lake.\n\nThe view teaches visitors about volcanoes, hazards and resilience. Tagaytay's cool climate and farms also make it a favorite weekend escape from Metro Manila.",
    "latitude": 14.1153,
    "longitude": 120.9621,
    "image": "https://picsum.photos/seed/tagaytay-taal/900/560",
    "panorama": "https://picsum.photos/seed/tagaytay-taal-pano/2400/800",
    "questions": [
      [
        "Taal Volcano is located on an island inside what?",
        [
          "A river",
          "Taal Lake",
          "Laguna de Bay",
          "Manila Bay"
        ],
        1,
        "Taal Volcano Island sits inside Taal Lake."
      ],
      [
        "Which city is famous for this ridge-top view?",
        [
          "Tagaytay",
          "Lucena",
          "Calamba",
          "Antipolo"
        ],
        0,
        "Tagaytay Ridge gives the famous view of the volcano and the lake."
      ],
      [
        "Taal Volcano is best described as:",
        [
          "Extinct",
          "Active",
          "Underwater only",
          "A man-made hill"
        ],
        1,
        "Taal is an active volcano. It has erupted many times, including in 1754, 1911 and 2020."
      ]
    ]
  },
  {
    "name": "Aguinaldo Shrine",
    "address": "Tirona Highway, Kawit, Cavite",
    "category": "Heritage",
    "description": "The ancestral home of General Emilio Aguinaldo, where Philippine independence was proclaimed from the balcony on June 12, 1898.\n\nOn June 12, 1898 the Philippine Declaration of Independence was read at this house in Kawit, the national flag was unfurled, and the national anthem was played in public for the first time. The house stands in its original location and is now a national shrine and museum.\n\nThe shrine is the birthplace of Philippine independence day celebrations. It lets students stand where an important turning point of the nation took place.",
    "latitude": 14.443,
    "longitude": 120.902,
    "image": "https://picsum.photos/seed/aguinaldo-shrine/900/560",
    "panorama": "https://picsum.photos/seed/aguinaldo-shrine-pano/2400/800",
    "questions": [
      [
        "Who proclaimed Philippine independence at this house?",
        [
          "Andres Bonifacio",
          "Emilio Aguinaldo",
          "Apolinario Mabini",
          "Antonio Luna"
        ],
        1,
        "General Emilio Aguinaldo proclaimed independence from the balcony of his home in Kawit."
      ],
      [
        "In what year was independence proclaimed here?",
        [
          "1896",
          "1898",
          "1901",
          "1946"
        ],
        1,
        "The proclamation took place on June 12, 1898."
      ],
      [
        "In which town is the Aguinaldo Shrine?",
        [
          "Kawit",
          "Taal",
          "Pagsanjan",
          "Lucban"
        ],
        0,
        "The Aguinaldo Shrine is in Kawit, Cavite."
      ]
    ]
  },
  {
    "name": "Corregidor Island",
    "address": "Corregidor Island, Cavite City, Cavite",
    "category": "Heritage",
    "description": "A historic island fortress at the entrance of Manila Bay, with war ruins, batteries, the Malinta Tunnel and memorials.\n\nCorregidor served as a Spanish-era signal station and later as an American fortress. It was a key battleground in World War II, and its ruins and tunnels now serve as a memorial to the soldiers who fought there.\n\nThe island is an outdoor classroom on courage, sacrifice and the cost of war. Guided tours help visitors connect the ruins to real stories.",
    "latitude": 14.3814,
    "longitude": 120.5731,
    "image": "https://picsum.photos/seed/corregidor/900/560",
    "panorama": "https://picsum.photos/seed/corregidor-pano/2400/800",
    "questions": [
      [
        "Corregidor guards the entrance of which bay?",
        [
          "Subic Bay",
          "Manila Bay",
          "Batangas Bay",
          "Lamon Bay"
        ],
        1,
        "Corregidor sits at the entrance of Manila Bay and guarded it as a fortress."
      ],
      [
        "Which famous tunnel is found on Corregidor?",
        [
          "Malinta Tunnel",
          "Kennon Tunnel",
          "Rizal Tunnel",
          "Pasig Tunnel"
        ],
        0,
        "Malinta Tunnel is the best-known tunnel on the island."
      ],
      [
        "Corregidor is mostly remembered as a site of which event?",
        [
          "Spanish fiestas",
          "World War II battles",
          "A volcano eruption",
          "A gold rush"
        ],
        1,
        "Corregidor was a major battleground in World War II."
      ]
    ]
  },
  {
    "name": "Antipolo Cathedral",
    "address": "P. Oliveros Street, Antipolo City, Rizal",
    "category": "Churches",
    "description": "The cathedral-shrine of Our Lady of Peace and Good Voyage, a major pilgrimage site, especially during the summer months.\n\nThe image of the Virgin, known as the Nuestra Señora de la Paz y Buen Viaje, was brought across the Pacific in the 17th century and has been venerated in Antipolo ever since. Pilgrims have walked to Antipolo for generations, especially in May.\n\nAntipolo shows how faith and travel are woven together in Filipino tradition. The pilgrimage is also a family and community custom.",
    "latitude": 14.5886,
    "longitude": 121.176,
    "image": "https://picsum.photos/seed/antipolo-cathedral/900/560",
    "panorama": "https://picsum.photos/seed/antipolo-cathedral-pano/2400/800",
    "questions": [
      [
        "Antipolo Cathedral honors Our Lady of ...",
        [
          "Peace and Good Voyage",
          "Lourdes",
          "Fatima",
          "Manaoag"
        ],
        0,
        "The image is Nuestra Señora de la Paz y Buen Viaje, Our Lady of Peace and Good Voyage."
      ],
      [
        "In which province is Antipolo?",
        [
          "Rizal",
          "Quezon",
          "Cavite",
          "Laguna"
        ],
        0,
        "Antipolo is in the province of Rizal."
      ],
      [
        "Pilgrims especially visit Antipolo during which month?",
        [
          "January",
          "May",
          "September",
          "November"
        ],
        1,
        "Pilgrims traditionally travel to Antipolo in May."
      ]
    ]
  },
  {
    "name": "Hinulugang Taktak",
    "address": "Sumulong Highway, Antipolo City, Rizal",
    "category": "Falls",
    "description": "A small waterfall and national park in the middle of Antipolo, restored as a green space for walking and picnics.\n\nThe name Hinulugang Taktak is often explained through local legends about a bottomless pool. Pollution once threatened the falls, but clean-up and park restoration brought it back as a public nature spot.\n\nIt is a reminder that city communities can protect and recover natural places. It is also a good field-trip stop for lessons on water and the environment.",
    "latitude": 14.5917,
    "longitude": 121.1858,
    "image": "https://picsum.photos/seed/hinulugang-taktak/900/560",
    "panorama": "https://picsum.photos/seed/hinulugang-taktak-pano/2400/800",
    "questions": [
      [
        "Where is Hinulugang Taktak located?",
        [
          "Antipolo, Rizal",
          "Lucban, Quezon",
          "Kawit, Cavite",
          "Taal, Batangas"
        ],
        0,
        "Hinulugang Taktak is a waterfall park in Antipolo, Rizal."
      ],
      [
        "What kind of attraction is Hinulugang Taktak?",
        [
          "A waterfall park",
          "A fort",
          "A museum ship",
          "A volcano crater"
        ],
        0,
        "It is a small waterfall inside a national park."
      ],
      [
        "What helped bring the falls back to life?",
        [
          "Clean-up and park restoration",
          "A new dam",
          "A theme park",
          "Mining"
        ],
        0,
        "Clean-up and restoration brought the falls back as a public green space."
      ]
    ]
  },
  {
    "name": "Lucban Heritage Town",
    "address": "Poblacion, Lucban, Quezon",
    "category": "Heritage",
    "description": "A mountain-side town known for its old church, the colorful Pahiyas Festival, and local food such as longganisa and pancit habhab.\n\nEvery May 15, residents of Lucban decorate their houses with colorful rice-wafer kiping, fruits and vegetables to thank San Isidro Labrador for a good harvest. The festival has been celebrated for generations.\n\nPahiyas shows how farming, faith and creativity come together. Visitors can learn how families keep a harvest tradition alive.",
    "latitude": 14.1136,
    "longitude": 121.5561,
    "image": "https://picsum.photos/seed/lucban-pahiyas/900/560",
    "panorama": "https://picsum.photos/seed/lucban-pahiyas-pano/2400/800",
    "questions": [
      [
        "Lucban is famous for which festival?",
        [
          "Pahiyas",
          "Ati-Atihan",
          "Sinulog",
          "Moriones"
        ],
        0,
        "Pahiyas is Lucban's harvest festival, held every May 15."
      ],
      [
        "The Pahiyas honors which patron saint?",
        [
          "San Isidro Labrador",
          "San Pedro",
          "San Roque",
          "San Jose"
        ],
        0,
        "The festival thanks San Isidro Labrador, the patron saint of farmers."
      ],
      [
        "The colorful rice wafer used for decoration is called:",
        [
          "Kiping",
          "Puto",
          "Bibingka",
          "Suman"
        ],
        0,
        "Kiping is the colorful rice wafer used to decorate the houses."
      ]
    ]
  },
  {
    "name": "Anilao Beaches & Reefs",
    "address": "Anilao, Mabini, Batangas",
    "category": "Beaches",
    "description": "A coastal area known for its coral reefs and diving spots, with small beaches, boat trips and sea-life viewing.\n\nAnilao is a barangay in Mabini that grew into one of the country's best-known diving destinations. Local fishers and boat operators were among the first to guide visitors to the reefs.\n\nAnilao shows the value of protecting coral reefs and marine life. Community-led conservation helps keep both fishing and tourism healthy.",
    "latitude": 13.7586,
    "longitude": 120.8995,
    "image": "https://picsum.photos/seed/anilao/900/560",
    "panorama": "https://picsum.photos/seed/anilao-pano/2400/800",
    "questions": [
      [
        "In which province is Anilao?",
        [
          "Batangas",
          "Rizal",
          "Quezon",
          "Laguna"
        ],
        0,
        "Anilao is in Mabini, Batangas."
      ],
      [
        "Anilao is mainly known for which activity?",
        [
          "Skiing",
          "Diving",
          "Mountain biking",
          "Ice skating"
        ],
        1,
        "Anilao is best known for diving and its coral reefs."
      ],
      [
        "Why should reefs be protected?",
        [
          "They shelter marine life",
          "They are noisy",
          "They block boats",
          "They hold fuel"
        ],
        0,
        "Reefs shelter fish and other sea life, so protecting them protects both fishing and tourism."
      ]
    ]
  }
];
