export const rabbitMqOffer = {
  price: 79.9,
  priceLabel: "R$ 79,90",
  originalPrice: 199.99,
  originalPriceLabel: "R$ 199,99",
  installmentLabel: "9x de R$ 10,50",
  paymentLabel: "ou R$ 79,90 à vista",
  badge: "Oferta de lançamento",
  endsAt: "2026-10-31T23:59:59-03:00",
  endsAtLabel: "31 de outubro de 2026",
  guaranteeDays: 7,
  accessDurationLabel: "Acesso vitalício",
  updatesLabel: "Todas as atualizações futuras incluídas",
  deliveryLabel: "Conteúdo liberado e acesso enviado por e-mail pela Hotmart após a aprovação do pagamento",
  promotionalBuyerLimit: null as number | null,
  remainingPromotionalPurchases: null as number | null,
} as const;

export type RabbitMqProjectImage = {
  src: string;
  alt: string;
  title: string;
  description: string;
};

// A galeria só é exibida quando houver capturas reais do projeto.
export const rabbitMqProjectImages: RabbitMqProjectImage[] = [];
