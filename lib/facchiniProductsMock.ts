export type ProductCategory =
  | "todos"
  | "cadeiras"
  | "mesas"
  | "cabos"
  | "climatizacao"
  | "audiovisual"
  | "stands";

export interface FacchiniProduct {
  id: string;
  sku: string;
  name: string;
  category: Exclude<ProductCategory, "todos">;
  categoryLabel: string;
  shortDesc: string;
  fullDesc: string;
  dailyPrice: number;
  eventPrice: number; // pacote 3-5 dias
  unit: string;
  stock: number;
  minQty: number;
  stepQty: number;
  badge?: string;
  popular?: boolean;
  image: string;
  specs: {
    label: string;
    value: string;
  }[];
}

export interface FacchiniKit {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  discountPercent: number;
  eventPrice: number;
  originalPrice: number;
  image: string;
  items: {
    productId: string;
    qty: number;
    label: string;
  }[];
}

export const FACCHINI_COMPANY = {
  name: "Facchini Eventos",
  foundedYear: 2001,
  headquarters: "São Carlos - SP",
  facilityArea: "2.700 m²",
  coverage: ["São Paulo (SP)", "Minas Gerais (MG)", "Rio de Janeiro (RJ)"],
  phoneDisplay: "(16) 99713-5010",
  whatsappNumber: "5516997135010",
  email: "marcus@f2e.com.br",
  website: "https://facchinieventos.com.br",
  logoUrl: "https://facchinieventos.com.br/logo.jpeg",
  heroBgUrl: "https://facchinieventos.com.br/fundo.jpg",
  aboutImageUrl: "https://facchinieventos.com.br/quemsomos/fundo_quem_somos.jpg",
  youtubeMainVideo: "https://www.youtube.com/embed/Mx5fCdH6E7c",
  youtubeShortsVideo: "https://www.youtube.com/embed/lgY03LJHV44",
};

export const PRODUCT_CATEGORIES: {
  id: ProductCategory;
  label: string;
  countHint: string;
  description: string;
}[] = [
  {
    id: "todos",
    label: "Todos os Produtos",
    countHint: "Catálogo Completo",
    description: "Mobiliário, elétrica, cabos, climatização, AV e estruturas modulares",
  },
  {
    id: "cadeiras",
    label: "Cadeiras & Banquetas",
    countHint: "Assentos",
    description: "Cadeiras para congressos, auditórios, stands, bistrôs e lounges VIP",
  },
  {
    id: "mesas",
    label: "Mesas & Balcões",
    countHint: "Mobiliário",
    description: "Mesas de reunião, bistrôs, pranchões de apoio e balcões em Octanorm",
  },
  {
    id: "cabos",
    label: "Cabos & Elétrica",
    countHint: "Infraestrutura",
    description: "Cabos PP, extensões industriais, passa-cabos, quadros QDF, HDMI e rede",
  },
  {
    id: "climatizacao",
    label: "Climatização",
    countHint: "Conforto Térmico",
    description: "Climatizadores evaporativos portáteis, ar-condicionado e ventiladores",
  },
  {
    id: "audiovisual",
    label: "Audiovisual & Iluminação",
    countHint: "Tecnologia",
    description: "Smart TVs 4K em pedestal, painéis de LED e iluminação para stands",
  },
  {
    id: "stands",
    label: "Stands & Estruturas",
    countHint: "Montagem",
    description: "Stands básicos em Octanorm, mistos e construídos em marcenaria própria",
  },
];

export const FACCHINI_PRODUCTS: FacchiniProduct[] = [
  // ================= CADEIRAS & BANQUETAS =================
  {
    id: "cad-iso-preta",
    sku: "FAC-CAD-001",
    name: "Cadeira Fixa Iso Executiva Preta",
    category: "cadeiras",
    categoryLabel: "Cadeiras & Banquetas",
    shortDesc: "Empilhável, estrutura metálica reforçada e assento anatômico para auditórios, palestras e stands.",
    fullDesc:
      "Cadeira modelo Iso amplamente utilizada em feiras, congressos, salas de treinamento e atendimento em stands. Higienizada e revisada antes de cada evento pela equipe própria da Facchini Eventos.",
    dailyPrice: 18,
    eventPrice: 39,
    unit: "unid.",
    stock: 800,
    minQty: 4,
    stepQty: 4,
    badge: "Mais Alugada",
    popular: true,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Estrutura", value: "Aço tubular com pintura epóxi preta ou cromada" },
      { label: "Assento/Encosto", value: "Polipropileno anatômico ou estofado em tecido" },
      { label: "Capacidade", value: "Até 120 kg • Empilhável até 10 unidades" },
      { label: "Indicação", value: "Auditórios, plenárias, reuniões em stands e salas de apoio" },
    ],
  },
  {
    id: "cad-banqueta-bistro",
    sku: "FAC-CAD-002",
    name: "Banqueta Alta Bistrô Cromada c/ Encosto",
    category: "cadeiras",
    categoryLabel: "Cadeiras & Banquetas",
    shortDesc: "Banqueta alta com apoio para pés e assento estofado, ideal para balcões de recepção e mesas bistrô.",
    fullDesc:
      "Design moderno com acabamento cromado de alto brilho e assento confortável. Perfeita para áreas de networking em feiras de negócios, balcões de atendimento em Octanorm e lounges corporativos.",
    dailyPrice: 38,
    eventPrice: 85,
    unit: "unid.",
    stock: 240,
    minQty: 2,
    stepQty: 2,
    badge: "Destaque Stands",
    popular: true,
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Altura até o assento", value: "75 cm (Padrão Bistrô / Balcão)" },
      { label: "Acabamento", value: "Aço cromado espelhado com apoio de pés" },
      { label: "Assento", value: "Estofado em courino preto ou branco de fácil limpeza" },
      { label: "Indicação", value: "Mesas bistrô altas, balcões de credenciamento e bares" },
    ],
  },
  {
    id: "cad-giratoria-staff",
    sku: "FAC-CAD-003",
    name: "Cadeira Executiva Giratória c/ Regulagem",
    category: "cadeiras",
    categoryLabel: "Cadeiras & Banquetas",
    shortDesc: "Cadeira ergonômica com rodízios e pistão a gás para equipes de credenciamento, secretaria e staff.",
    fullDesc:
      "Garanta o conforto da sua equipe durante todos os dias de feira. Conta com regulagem de altura a gás, base giratória com 5 rodízios e encosto ergonômico.",
    dailyPrice: 45,
    eventPrice: 98,
    unit: "unid.",
    stock: 120,
    minQty: 1,
    stepQty: 1,
    image: "https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Mecanismo", value: "Giratório 360° com regulagem pneumática de altura" },
      { label: "Base", value: "Estrela com 5 rodízios anti-risco para carpete e piso elevado" },
      { label: "Revestimento", value: "Tecido crepe ou couro ecológico preto" },
      { label: "Indicação", value: "Balcões de credenciamento, recepção, sala VIP e staff" },
    ],
  },
  {
    id: "cad-poltrona-lounge",
    sku: "FAC-CAD-004",
    name: "Poltrona Lounge Executiva Branca / Preta",
    category: "cadeiras",
    categoryLabel: "Cadeiras & Banquetas",
    shortDesc: "Poltrona estruturada de alto padrão para espaços VIP, fechamento de negócios e palcos de talk-show.",
    fullDesc:
      "Mobiliário premium para valorizar a imagem da sua marca em stands construídos e palcos de painéis corporativos. Estofamento de alta densidade e acabamento impecável.",
    dailyPrice: 95,
    eventPrice: 210,
    unit: "unid.",
    stock: 60,
    minQty: 2,
    stepQty: 2,
    badge: "Linha VIP",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Dimensões", value: "78 cm (L) x 72 cm (P) x 76 cm (A)" },
      { label: "Revestimento", value: "Couro ecológico premium (Branco ou Preto)" },
      { label: "Base", value: "Sapatas niveladoras em alumínio" },
      { label: "Indicação", value: "Lounges VIP, salas de imprensa, painéis de palestra" },
    ],
  },

  // ================= MESAS & BALCÕES =================
  {
    id: "mes-redonda-vidro",
    sku: "FAC-MES-001",
    name: "Mesa Redonda de Reunião Tampo de Vidro 90cm",
    category: "mesas",
    categoryLabel: "Mesas & Balcões",
    shortDesc: "Mesa clássica para atendimento em stands, comporta confortavelmente de 3 a 4 cadeiras.",
    fullDesc:
      "A mesa mais versátil para negociação dentro de stands básicos, mistos ou construídos. Tampo em vidro temperado incolor de 8mm sobre base central em aço cromado que não atrapalha as pernas dos visitantes.",
    dailyPrice: 65,
    eventPrice: 140,
    unit: "unid.",
    stock: 180,
    minQty: 1,
    stepQty: 1,
    badge: "Campeã em Feiras",
    popular: true,
    image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Diâmetro do Tampo", value: "90 cm (Vidro temperado 8mm) ou MDF Branco" },
      { label: "Altura", value: "75 cm (Padrão mesa de reunião)" },
      { label: "Capacidade", value: "3 a 4 lugares confortáveis" },
      { label: "Base", value: "Coluna central em aço cromado com disco estabilizador" },
    ],
  },
  {
    id: "mes-bistro-alta",
    sku: "FAC-MES-002",
    name: "Mesa Bistrô Alta Cromada Tampo 60cm",
    category: "mesas",
    categoryLabel: "Mesas & Balcões",
    shortDesc: "Mesa alta de apoio para coquetéis, degustações e atendimento rápido em espaços compactos.",
    fullDesc:
      "Perfeita para otimizar a circulação do stand mantendo pontos elegantes de apoio para café, catálogos e conversas rápidas. Combina perfeitamente com o par de Banquetas Altas Cromadas.",
    dailyPrice: 55,
    eventPrice: 120,
    unit: "unid.",
    stock: 150,
    minQty: 1,
    stepQty: 1,
    popular: true,
    image: "https://facchinieventos.com.br/moveis/001.jpg",
    specs: [
      { label: "Diâmetro do Tampo", value: "60 cm (Vidro ou MDF Branco/Preto)" },
      { label: "Altura", value: "105 cm (Padrão Bistrô Alto)" },
      { label: "Estrutura", value: "Tubo central cromado com base pesada anti-tombamento" },
      { label: "Combinação ideal", value: "2 ou 3 Banquetas Altas (FAC-CAD-002)" },
    ],
  },
  {
    id: "mes-pranchao-180",
    sku: "FAC-MES-003",
    name: "Mesa Pranchão Retangular 1,80m x 0,80m",
    category: "mesas",
    categoryLabel: "Mesas & Balcões",
    shortDesc: "Mesa retangular reforçada para credenciamento, coffee break, exposição de produtos e backoffice.",
    fullDesc:
      "Estrutura dobrável super resistente com tampo amplo de 1,80m. Muito utilizada em secretarias de eventos, bancadas de credenciamento com notebooks e impressoras, buffet e apoio técnico.",
    dailyPrice: 58,
    eventPrice: 125,
    unit: "unid.",
    stock: 200,
    minQty: 1,
    stepQty: 1,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Dimensões", value: "1,80 m (C) x 0,80 m (L) x 0,75 m (A)" },
      { label: "Material", value: "Tampo em MDF revestido ou polietileno de alta densidade" },
      { label: "Capacidade", value: "Até 6 lugares ou bancada de equipamentos pesados" },
      { label: "Indicação", value: "Credenciamento, coffee-break, oficinas e apoio técnico" },
    ],
  },
  {
    id: "mes-balcao-octanorm",
    sku: "FAC-MES-004",
    name: "Balcão de Atendimento / Recepção c/ Porta e Chave",
    category: "mesas",
    categoryLabel: "Mesas & Balcões",
    shortDesc: "Balcão modular com prateleira interna e tranca para guardar brindes, bolsas e materiais no stand.",
    fullDesc:
      "Produzido com sistema Octanorm ou marcenaria própria da Facchini Eventos. Possui tampo superior resistente, prateleira interna e portas de correr com fechadura para segurança dos pertences da equipe.",
    dailyPrice: 110,
    eventPrice: 240,
    unit: "unid.",
    stock: 95,
    minQty: 1,
    stepQty: 1,
    badge: "Com Chave Interna",
    image: "https://facchinieventos.com.br/moveis/002.jpg",
    specs: [
      { label: "Dimensões", value: "1,00 m (L) x 0,50 m (P) x 1,00 m (A)" },
      { label: "Segurança", value: "Portas de correr com fechadura e chave inclusa" },
      { label: "Personalização", value: "Aceita adesivação frontal com a logomarca do cliente" },
      { label: "Indicação", value: "Recepção de stands, entrega de brindes e credenciamento" },
    ],
  },

  // ================= CABOS & ELÉTRICA =================
  {
    id: "cab-pp-extensao-20m",
    sku: "FAC-CAB-001",
    name: "Cabo PP Tripolar 3x2,5mm Extensão Industrial (20m)",
    category: "cabos",
    categoryLabel: "Cabos & Elétrica",
    shortDesc: "Cabo elétrico normatizado com dupla isolação e plugues industriais blindados 20A/32A para feiras.",
    fullDesc:
      "Cabo flexível PP 3x2,5mm² (Fase + Neutro + Terra) com capa externa em PVC de alta resistência mecânica, atendendo rigorosamente às normas técnicas dos pavilhões de exposições. Ideal para alimentar stands, climatizadores, TVs e cafeterias sem queda de tensão.",
    dailyPrice: 28,
    eventPrice: 59,
    unit: "rolo 20m",
    stock: 350,
    minQty: 1,
    stepQty: 1,
    badge: "Norma Pavilhão",
    popular: true,
    image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Bitola / Condutor", value: "Cobre eletrolítico 3 x 2,5 mm² (750V) com aterramento" },
      { label: "Comprimento", value: "Lance de 20 metros (disponível também em 10m e 50m)" },
      { label: "Conectores", value: "Plugue e tomada blindados padrão NBR 14136 (20A) ou Steck" },
      { label: "Segurança", value: "Antichama, testado e identificado pela equipe técnica Facchini" },
    ],
  },
  {
    id: "cab-passa-cabo-solo",
    sku: "FAC-CAB-002",
    name: "Passa-Cabos de Solo Rampado 3 Canais (1 Metro)",
    category: "cabos",
    categoryLabel: "Cabos & Elétrica",
    shortDesc: "Protetor de cabos amarelo/preto de alta resistência para corredores de eventos e tráfego intenso.",
    fullDesc:
      "Item obrigatório de segurança em feiras e eventos corporativos quando há travessia de cabos elétricos, de som ou de rede em áreas de circulação de público e carrinhos de carga. Encaixe modular infinito.",
    dailyPrice: 22,
    eventPrice: 48,
    unit: "módulo 1m",
    stock: 300,
    minQty: 2,
    stepQty: 2,
    badge: "Segurança NR",
    popular: true,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Dimensões", value: "100 cm (C) x 25 cm (L) x 4,5 cm (A) por módulo" },
      { label: "Canais Internos", value: "3 canaletas independentes para energia, áudio e dados" },
      { label: "Capacidade de Carga", value: "Suporta tráfego de pedestres, paleteiras e veículos leves" },
      { label: "Visibilidade", value: "Base preta com tampa articulada amarela de alerta" },
    ],
  },
  {
    id: "cab-quadro-qdf",
    sku: "FAC-CAB-003",
    name: "Quadro de Distribuição Elétrica Portátil (QDF) c/ DR",
    category: "cabos",
    categoryLabel: "Cabos & Elétrica",
    shortDesc: "Quadro elétrico completo com disjuntores termomagnéticos, DR de proteção e régua de tomadas 110V/220V.",
    fullDesc:
      "Distribuição segura de energia para stands construídos, cozinhas experimentais, palcos e áreas técnicas. Montado com disjuntor diferencial residual (DR) exigido pelos bombeiros e engenheiros dos principais centros de convenções.",
    dailyPrice: 85,
    eventPrice: 185,
    unit: "unid.",
    stock: 75,
    minQty: 1,
    stepQty: 1,
    badge: "Exigência Bombeiros",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Proteção", value: "Disjuntor Geral + Interruptor DR 30mA + Disjuntores por circuito" },
      { label: "Saídas", value: "6 tomadas padrão NBR 20A + Entrada industrial Steck 32A" },
      { label: "Tensão", value: " Compatível com redes Monofásicas, Bifásicas e Trifásicas 220V/380V" },
      { label: "Aterramento", value: "Barramento de terra e neutro isolados com cabo de aterramento" },
    ],
  },
  {
    id: "cab-regua-industrial",
    sku: "FAC-CAB-004",
    name: "Régua de Energia Industrial 6 Tomadas 20A Metálica",
    category: "cabos",
    categoryLabel: "Cabos & Elétrica",
    shortDesc: "Calha de tomadas profissional em gabinete metálico com cabo PP 3x2,5mm de 3 metros.",
    fullDesc:
      "Esqueça adaptadores frágeis que derretem durante o evento. Nossa régua industrial metálica suporta múltiplos equipamentos simultâneos (TVs, notebooks, carregadores, cafeteira e iluminação LED) com total estabilidade.",
    dailyPrice: 16,
    eventPrice: 35,
    unit: "unid.",
    stock: 500,
    minQty: 2,
    stepQty: 2,
    popular: true,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Tomadas", value: "6 tomadas espaçadas padrão 10A/20A tripolar" },
      { label: "Cabo integrado", value: "3 metros de Cabo PP 3x2,5mm² certificado" },
      { label: "Corpo", value: "Chapa de aço com pintura eletrostática e abas de fixação" },
      { label: "Indicação", value: "Mesas de credenciamento, stands, salas de imprensa e AV" },
    ],
  },
  {
    id: "cab-kit-hdmi-rede",
    sku: "FAC-CAB-005",
    name: "Kit Cabos HDMI 2.0 4K (15m) + Patch Cord Cat6 Blindado",
    category: "cabos",
    categoryLabel: "Cabos & Elétrica",
    shortDesc: "Cabeamento de sinal de vídeo 4K sem perda e cabo de rede blindado para internet dedicada no stand.",
    fullDesc:
      "Ideal para ligar notebooks em balcões até TVs de 55\"/75\" ou painéis de LED instalados nas paredes do stand, além de conectar roteadores e máquinas de cartão via cabo de rede estruturado.",
    dailyPrice: 32,
    eventPrice: 68,
    unit: "kit",
    stock: 160,
    minQty: 1,
    stepQty: 1,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80",
    specs: [
      { label: "Cabo de Vídeo", value: "HDMI 2.0 4K 60Hz com amplificador ativo (15 metros)" },
      { label: "Cabo de Dados", value: "Cabo UTP Cat6 Furukawa 20m crimpado com RJ45 blindado" },
      { label: "Acessórios", value: "Acompanha fita velcro organizadora de cabos" },
      { label: "Indicação", value: "Apresentações em TVs, totens interativos e transmissões" },
    ],
  },

  // ================= CLIMATIZAÇÃO =================
  {
    id: "cli-evaporativo-18000",
    sku: "FAC-CLI-001",
    name: "Climatizador Evaporativo Portátil Industrial 18.000 m³/h",
    category: "climatizacao",
    categoryLabel: "Climatização",
    shortDesc: "Renovação e resfriamento potente do ar com baixo consumo elétrico e rodízios para fácil posicionamento.",
    fullDesc:
      "Um dos carros-chefes da Facchini Eventos para pavilhões, tendas, galpões e stands amplos. Reduz a temperatura ambiente em até 10°C sem jogar névoa de água sobre pessoas ou equipamentos eletrônicos.",
    dailyPrice: 190,
    eventPrice: 420,
    unit: "unid.",
    stock: 85,
    minQty: 1,
    stepQty: 1,
    badge: "Frota Própria",
    popular: true,
    image: "https://facchinieventos.com.br/climatizacao/001.jpg",
    specs: [
      { label: "Vazão de Ar", value: "18.000 m³/h com oscilação automática das aletas" },
      { label: "Reservatório", value: "100 a 120 Litros (autonomia prolongada para o dia todo)" },
      { label: "Área de Cobertura", value: "Atende de 80 m² a 120 m² por equipamento" },
      { label: "Alimentação", value: "220V Monofásico (baixo consumo: apenas ~450W)" },
    ],
  },
  {
    id: "cli-ventilador-coluna",
    sku: "FAC-CLI-002",
    name: "Ventilador Industrial de Coluna Oscilante 60cm",
    category: "climatizacao",
    categoryLabel: "Climatização",
    shortDesc: "Ventilação silenciosa e direcionada com pedestal regulável em altura para áreas de apoio e stands.",
    fullDesc:
      "Excelente custo-benefício para circulação de ar em stands básicos, áreas de montagem, camarins e salas de apoio.",
    dailyPrice: 48,
    eventPrice: 105,
    unit: "unid.",
    stock: 110,
    minQty: 1,
    stepQty: 1,
    image: "https://facchinieventos.com.br/climatizacao/003.jpg",
    specs: [
      { label: "Diâmetro da Grade", value: "60 cm com 3 velocidades" },
      { label: "Altura Regulável", value: "De 1,20 m a 1,75 m" },
      { label: "Tensão", value: "Bivolt (127V / 220V)" },
      { label: "Indicação", value: "Stands, áreas de buffet, filas de credenciamento e staff" },
    ],
  },

  // ================= AUDIOVISUAL & ILUMINAÇÃO =================
  {
    id: "av-smart-tv-55",
    sku: "FAC-AV-001",
    name: "Smart TV LED 55\" 4K c/ Pedestal de Chão ou Suporte",
    category: "audiovisual",
    categoryLabel: "Audiovisual & Iluminação",
    shortDesc: "Televisor 4K Ultra HD acompanhado de suporte de piso em alumínio (totem) ou suporte fixo para parede.",
    fullDesc:
      "Destaque os vídeos institucionais e apresentações da sua empresa com brilho e nitidez 4K. Acompanha pedestal de chão com passa-cabos embutido, bandeja para notebook e cabeamento HDMI + energia.",
    dailyPrice: 210,
    eventPrice: 460,
    unit: "conj.",
    stock: 65,
    minQty: 1,
    stepQty: 1,
    badge: "Acompanha Pedestal",
    popular: true,
    image: "https://facchinieventos.com.br/audiovisual/001.jpg",
    specs: [
      { label: "Tela", value: "55 polegadas 4K UHD (HDMI, USB, Wi-Fi, Espelhamento)" },
      { label: "Suporte Incluso", value: "Pedestal de chão 1,80m com rodízios ou suporte de parede" },
      { label: "Cabos Inclusos", value: "1 Cabo HDMI 5m + Extensão Elétrica PP" },
      { label: "Instalação", value: "Entregue montada e testada no stand pela equipe Facchini" },
    ],
  },
  {
    id: "av-painel-led-p2",
    sku: "FAC-AV-002",
    name: "Painel de LED Indoor Alta Definição P2.9 (m²)",
    category: "audiovisual",
    categoryLabel: "Audiovisual & Iluminação",
    shortDesc: "Painel de LED modular de altíssimo brilho para testeiras de stands, fundos de palco e plenárias.",
    fullDesc:
      "Transforme seu stand em um imã de visitantes com vídeo wall de LED sem bordas. Inclui processadora de vídeo, estrutura de fixação (Box Truss ou integração na marcenaria) e técnico responsável.",
    dailyPrice: 380,
    eventPrice: 850,
    unit: "m²",
    stock: 120,
    minQty: 2,
    stepQty: 1,
    badge: "Alto Impacto Visual",
    image: "https://facchinieventos.com.br/audiovisual/003.jpg",
    specs: [
      { label: "Resolução", value: "Pixel Pitch 2.9mm Indoor de alta densidade" },
      { label: "Módulos", value: "Gabinetes de 50x50cm ou 50x100cm em alumínio fundido" },
      { label: "Incluso", value: "Processadora de vídeo HDMI, cabeamento completo e montagem" },
      { label: "Indicação", value: "Fachadas de stands, palcos de palestras e totens digitais" },
    ],
  },
  {
    id: "av-spot-led-hqi",
    sku: "FAC-AV-003",
    name: "Spot Refletor LED Braço Longo p/ Stand e Octanorm",
    category: "audiovisual",
    categoryLabel: "Audiovisual & Iluminação",
    shortDesc: "Luminária com haste longa e garra de fixação rápida para iluminar lonas, logotipos e vitrines.",
    fullDesc:
      "Iluminação profissional branco frio (6500K) ou branco quente (3000K) que valoriza os produtos expostos e a comunicação visual do stand sem aquecer o ambiente.",
    dailyPrice: 25,
    eventPrice: 52,
    unit: "unid.",
    stock: 400,
    minQty: 2,
    stepQty: 2,
    image: "https://facchinieventos.com.br/octanorm/004.jpg",
    specs: [
      { label: "Potência", value: "LED 50W / 100W de alta eficiência luminosa" },
      { label: "Fixação", value: "Garra compatível com perfil Octanorm ou painel de madeira" },
      { label: "Cabeamento", value: "Pronto para interligação em série no teto do stand" },
      { label: "Indicação", value: "Testeiras, banners, painéis fotográficos e mostruários" },
    ],
  },

  // ================= STANDS & ESTRUTURAS =================
  {
    id: "std-octanorm-basico",
    sku: "FAC-STD-001",
    name: "Stand Modular em Octanorm Completo (m²)",
    category: "stands",
    categoryLabel: "Stands & Estruturas",
    shortDesc: "Montagem completa com carpete, divisórias TS brancas, testeira com logo, iluminação e tomadas.",
    fullDesc:
      "Solução rápida, limpa e padronizada para feiras, congressos médicos e exposições corporativas. A Facchini Eventos possui grande estoque próprio de perfis de alumínio e chapas TS em sua sede de 2.700m².",
    dailyPrice: 115,
    eventPrice: 245,
    unit: "m²",
    stock: 1500,
    minQty: 9,
    stepQty: 3,
    badge: "Estoque Próprio 2.700m²",
    popular: true,
    image: "https://facchinieventos.com.br/octanorm/001.jpg",
    specs: [
      { label: "Piso", value: "Forração em carpete (diversas cores) aplicado com fita dupla-face" },
      { label: "Paredes e Estrutura", value: "Perfis de alumínio anodizado Octanorm + Painéis TS brancos" },
      { label: "Elétrica Inclusa", value: "1 Spot LED a cada 3m² + 1 Tomada 220V a cada 9m²" },
      { label: "Identificação", value: "Testeira frontal com adesivo em recorte ou impressão digital" },
    ],
  },
  {
    id: "std-construido-misto",
    sku: "FAC-STD-002",
    name: "Stand Construído / Misto Personalizado (m²)",
    category: "stands",
    categoryLabel: "Stands & Estruturas",
    shortDesc: "Projeto 3D exclusivo com marcenaria própria, router CNC, comunicação visual e mobiliário completo.",
    fullDesc:
      "Do projeto 3D à desmontagem: stands de alto impacto construídos na marcenaria própria da Facchini Eventos em São Carlos-SP, com atendimento rápido em SP, MG e RJ.",
    dailyPrice: 260,
    eventPrice: 580,
    unit: "m²",
    stock: 900,
    minQty: 12,
    stepQty: 4,
    badge: "Marcenaria + Router CNC",
    image: "https://facchinieventos.com.br/standcontruido/001.jpg",
    specs: [
      { label: "Piso Elevado", value: "Deck modulado com acabamento em MDF, vinílico ou carpete" },
      { label: "Marcenaria & CNC", value: "Paredes empapeladas/pintadas, logotipos 3D em Router CNC" },
      { label: "Comunicação Visual", value: "Impressão digital em lona/adesivo em setor próprio" },
      { label: "Atendimento", value: "Projeto 3D + ART + Montagem e suporte técnico em SP, MG e RJ" },
    ],
  },
];

export const FACCHINI_KITS: FacchiniKit[] = [
  {
    id: "kit-reuniao-stand",
    name: "Kit Mobiliário Stand Padrão (9m² a 12m²)",
    subtitle: "O combo essencial de mesas, cadeiras e balcão para receber clientes na feira",
    badge: "Combo Mais Vendido",
    discountPercent: 18,
    eventPrice: 649,
    originalPrice: 793,
    image: "https://facchinieventos.com.br/octanorm/002.jpg",
    items: [
      { productId: "mes-redonda-vidro", qty: 1, label: "1x Mesa Redonda Tampo de Vidro 90cm" },
      { productId: "cad-iso-preta", qty: 4, label: "4x Cadeiras Fixas Iso Executivas" },
      { productId: "mes-balcao-octanorm", qty: 1, label: "1x Balcão Recepção c/ Porta e Chave" },
      { productId: "cad-banqueta-bistro", qty: 2, label: "2x Banquetas Altas Cromadas" },
      { productId: "cab-regua-industrial", qty: 2, label: "2x Réguas de Energia Industriais 6 Tomadas" },
    ],
  },
  {
    id: "kit-infra-eletrica-cabos",
    name: "Kit Infraestrutura Elétrica, Cabos & Segurança",
    subtitle: "Distribuição de energia blindada dentro das normas técnicas dos pavilhões",
    badge: "Segurança & Normas",
    discountPercent: 15,
    eventPrice: 435,
    originalPrice: 513,
    image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=80",
    items: [
      { productId: "cab-quadro-qdf", qty: 1, label: "1x Quadro de Distribuição Elétrica (QDF) c/ DR" },
      { productId: "cab-pp-extensao-20m", qty: 2, label: "2x Rolos 20m Cabo PP Tripolar 3x2,5mm (40m total)" },
      { productId: "cab-passa-cabo-solo", qty: 3, label: "3x Módulos Passa-Cabos de Solo 3 Canais" },
      { productId: "cab-regua-industrial", qty: 4, label: "4x Réguas de Energia Industriais 20A" },
    ],
  },
  {
    id: "kit-lounge-av-clima",
    name: "Kit Apresentação 4K, Bistrô & Climatização",
    subtitle: "Atração visual na fachada do stand com conforto térmico para visitantes",
    badge: "Alto Impacto",
    discountPercent: 16,
    eventPrice: 990,
    originalPrice: 1188,
    image: "https://facchinieventos.com.br/standcontruido/004.jpg",
    items: [
      { productId: "av-smart-tv-55", qty: 1, label: "1x Smart TV 55\" 4K c/ Pedestal de Chão" },
      { productId: "cab-kit-hdmi-rede", qty: 1, label: "1x Kit Cabo HDMI 15m + Rede Cat6" },
      { productId: "cli-evaporativo-18000", qty: 1, label: "1x Climatizador Evaporativo 18.000 m³/h" },
      { productId: "mes-bistro-alta", qty: 1, label: "1x Mesa Bistrô Alta Cromada" },
      { productId: "cad-banqueta-bistro", qty: 2, label: "2x Banquetas Altas Bistrô Cromadas" },
    ],
  },
];

export const REAL_PORTFOLIO_PHOTOS = [
  {
    url: "https://facchinieventos.com.br/standcontruido/001.jpg",
    title: "Stand Construído Corporativo",
    tag: "Stands Construídos",
  },
  {
    url: "https://facchinieventos.com.br/standcontruido/005.jpg",
    title: "Marcenaria Própria & Iluminação",
    tag: "Stands Construídos",
  },
  {
    url: "https://facchinieventos.com.br/octanorm/001.jpg",
    title: "Montagem Padronizada em Octanorm",
    tag: "Sistema Octanorm",
  },
  {
    url: "https://facchinieventos.com.br/moveis/001.jpg",
    title: "Mobiliário, Mesas e Cadeiras para Eventos",
    tag: "Mobiliário",
  },
  {
    url: "https://facchinieventos.com.br/climatizacao/001.jpg",
    title: "Climatizadores Industriais para Feiras",
    tag: "Climatização",
  },
  {
    url: "https://facchinieventos.com.br/audiovisual/002.jpg",
    title: "Soluções em Audiovisual e Painéis",
    tag: "Audiovisual",
  },
];

