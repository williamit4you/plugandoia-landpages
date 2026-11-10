"use client";

import React, { useMemo, useState } from "react";
import {
  FACCHINI_COMPANY,
  FACCHINI_KITS,
  FACCHINI_PRODUCTS,
  FacchiniKit,
  FacchiniProduct,
  PRODUCT_CATEGORIES,
  ProductCategory,
  REAL_PORTFOLIO_PHOTOS,
} from "@/lib/facchiniProductsMock";
import {
  Award,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Filter,
  Flame,
  Info,
  Layers,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Play,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type RentalPeriod = "daily" | "event";
type PaymentMethodId = "pix" | "credit_card" | "split_signal" | "boleto_pj";

interface PaymentMethodOption {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  badge?: string;
  discountPercent: number;
  icon: React.ComponentType<{ className?: string }>;
  details: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "pix",
    title: "PIX à Vista (10% OFF)",
    subtitle: "Desconto imediato de 10% com confirmação instantânea da reserva",
    badge: "Economize 10%",
    discountPercent: 10,
    icon: QrCode,
    details: "Chave CNPJ Facchini Eventos • Liberação imediata do bloqueio de estoque para a data do seu evento.",
  },
  {
    id: "credit_card",
    title: "Cartão de Crédito (Até 6x sem juros)",
    subtitle: "Parcele a locação do mobiliário e estrutura sem comprometer o caixa",
    badge: "Até 6x s/ juros",
    discountPercent: 0,
    icon: CreditCard,
    details: "Aceitamos Visa, Mastercard, Elo e Amex corporativo ou pessoal. Link de pagamento seguro.",
  },
  {
    id: "split_signal",
    title: "50% na Reserva + 50% na Montagem",
    subtitle: "Garanta a agenda hoje e pague o saldo apenas na entrega no evento",
    badge: "Mais Usado em Feiras",
    discountPercent: 0,
    icon: Banknote,
    details: "50% via PIX/Transferência na assinatura do pedido e 50% após a entrega e montagem no local.",
  },
  {
    id: "boleto_pj",
    title: "Faturamento Boleto PJ (15 / 28 DDL)",
    subtitle: "Exclusivo para empresas, agências e expositores com CNPJ ativo",
    badge: "Corporativo B2B",
    discountPercent: 0,
    icon: FileText,
    details: "Emissão de Nota Fiscal + Boleto bancário faturado para 15 ou 28 dias após análise rápida de CNPJ.",
  },
];

const DELIVERY_REGIONS = [
  { id: "sao-carlos", label: "São Carlos - SP e Região (Sede Própria)", fee: 90 },
  { id: "sp-interior", label: "Ribeirão Preto / Campinas / Interior SP", fee: 220 },
  { id: "sp-capital", label: "São Paulo Capital (Expo Center Norte / São Paulo Expo / Anhembi)", fee: 390 },
  { id: "mg-rj", label: "Minas Gerais (MG) ou Rio de Janeiro (RJ)", fee: 650 },
  { id: "retirada", label: "Retirada na Sede Facchini (São Carlos - 2.700m²)", fee: 0 },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function FacchiniModel1Landing() {
  // Filtros do catálogo
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>("event");

  // Estado do Carrinho: Record<productId, quantity>
  const [cart, setCart] = useState<Record<string, number>>({
    "cad-iso-preta": 8,
    "mes-redonda-vidro": 2,
    "cab-pp-extensao-20m": 2,
    "cab-passa-cabo-solo": 4,
  });

  // Estado de Pagamento e Logística dentro do Carrinho
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("pix");
  const [installments, setInstallments] = useState<number>(3);
  const [deliveryRegionId, setDeliveryRegionId] = useState<string>("sao-carlos");
  const [eventName, setEventName] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerDoc, setCustomerDoc] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Modais e Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<FacchiniProduct | null>(null);
  const [checkoutSuccessModal, setCheckoutSuccessModal] = useState(false);
  const [copiedOrderText, setCopiedOrderText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    return FACCHINI_PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === "todos" || product.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.shortDesc.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Funções de manipulação do carrinho
  const getUnitPrice = (product: FacchiniProduct) =>
    rentalPeriod === "daily" ? product.dailyPrice : product.eventPrice;

  const updateCartQty = (product: FacchiniProduct, nextQty: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (nextQty <= 0) {
        delete updated[product.id];
      } else {
        updated[product.id] = Math.min(product.stock, nextQty);
      }
      return updated;
    });
  };

  const toggleSelectProduct = (product: FacchiniProduct) => {
    const current = cart[product.id] || 0;
    if (current > 0) {
      updateCartQty(product, 0);
      showToast(`${product.name} removido do carrinho.`);
    } else {
      updateCartQty(product, product.minQty);
      showToast(`${product.minQty}x ${product.name} incluído no carrinho!`);
    }
  };

  const incrementProduct = (product: FacchiniProduct, customStep?: number) => {
    const current = cart[product.id] || 0;
    const step = customStep ?? product.stepQty;
    const next = current === 0 ? Math.max(product.minQty, step) : current + step;
    updateCartQty(product, next);
    showToast(`${next}x ${product.name} no carrinho.`);
  };

  const decrementProduct = (product: FacchiniProduct) => {
    const current = cart[product.id] || 0;
    if (current <= product.minQty) {
      updateCartQty(product, 0);
    } else {
      updateCartQty(product, current - product.stepQty);
    }
  };

  const addKitToCart = (kit: FacchiniKit) => {
    setCart((prev) => {
      const updated = { ...prev };
      for (const item of kit.items) {
        updated[item.productId] = (updated[item.productId] || 0) + item.qty;
      }
      return updated;
    });
    showToast(`${kit.name} adicionado ao carrinho!`);
    setIsCartOpen(true);
  };

  const clearCart = () => {
    setCart({});
  };

  // Itens detalhados do carrinho
  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, qty]) => {
        const product = FACCHINI_PRODUCTS.find((p) => p.id === productId);
        if (!product || qty <= 0) return null;
        const unitPrice = rentalPeriod === "daily" ? product.dailyPrice : product.eventPrice;
        return {
          product,
          qty,
          unitPrice,
          lineTotal: unitPrice * qty,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cart, rentalPeriod]);

  const totalUnitsCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty, 0),
    [cartItems]
  );

  const subtotalProducts = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.lineTotal, 0),
    [cartItems]
  );

  const selectedDelivery = useMemo(
    () => DELIVERY_REGIONS.find((r) => r.id === deliveryRegionId) || DELIVERY_REGIONS[0],
    [deliveryRegionId]
  );

  const selectedPaymentOption = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[0],
    [paymentMethod]
  );

  const discountAmount = useMemo(() => {
    if (selectedPaymentOption.discountPercent <= 0) return 0;
    return Math.round((subtotalProducts * selectedPaymentOption.discountPercent) / 100);
  }, [subtotalProducts, selectedPaymentOption]);

  const deliveryFee = cartItems.length > 0 ? selectedDelivery.fee : 0;
  const finalTotal = Math.max(0, subtotalProducts - discountAmount + deliveryFee);
  const installmentValue = installments > 0 ? finalTotal / installments : finalTotal;
  const signalHalfValue = finalTotal / 2;

  // Texto estruturado para WhatsApp / Cópia
  const buildWhatsAppOrderSummary = () => {
    const periodLabel =
      rentalPeriod === "daily" ? "Diária (1 dia)" : "Pacote Evento / Feira (3 a 5 dias)";
    const lines = [
      `Olá, equipe *Facchini Eventos*! Gostaria de fechar o seguinte pedido/orçamento pelo catálogo online:`,
      ``,
      `*ITENS SELECIONADOS (${periodLabel}):*`,
      ...cartItems.map(
        (item) =>
          `• ${item.qty}x ${item.product.name} (${item.product.sku}) — ${formatBRL(item.lineTotal)}`
      ),
      ``,
      `*RESUMO & PAGAMENTO:*`,
      `• Subtotal Produtos: ${formatBRL(subtotalProducts)}`,
      discountAmount > 0 ? `• Desconto PIX (10%): -${formatBRL(discountAmount)}` : null,
      `• Logística (${selectedDelivery.label}): ${
        deliveryFee === 0 ? "Retirada na Sede (Grátis)" : formatBRL(deliveryFee)
      }`,
      `• *VALOR TOTAL: ${formatBRL(finalTotal)}*`,
      `• *Forma de Pagamento escolhida:* ${selectedPaymentOption.title}${
        paymentMethod === "credit_card"
          ? ` (${installments}x de ${formatBRL(installmentValue)} sem juros)`
          : paymentMethod === "split_signal"
          ? ` (Sinal de ${formatBRL(signalHalfValue)} + Saldo de ${formatBRL(signalHalfValue)} na entrega)`
          : ""
      }`,
      eventName ? `• Evento/Feira: ${eventName}` : null,
      eventDate ? `• Data prevista: ${eventDate}` : null,
      customerName ? `• Responsável/Empresa: ${customerName}` : null,
      customerDoc ? `• CNPJ/CPF: ${customerDoc}` : null,
    ].filter(Boolean);

    return lines.join("\n");
  };

  const handleOpenWhatsAppCheckout = () => {
    const text = encodeURIComponent(buildWhatsAppOrderSummary());
    window.open(`https://wa.me/${FACCHINI_COMPANY.whatsappNumber}?text=${text}`, "_blank");
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildWhatsAppOrderSummary());
      setCopiedOrderText(true);
      setTimeout(() => setCopiedOrderText(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white pb-28">
      {/* BARRA DE PROPOSTA / SELETOR DE MODELOS PARA APRESENTAÇÃO AO CLIENTE */}
      <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Proposta de Página de Vendas • Modelo 1 (/model-teste1)
            </span>
            <span className="hidden md:inline text-slate-400">
              Catálogo E-Commerce B2B c/ Seleção Rápida, Carrinho & Formas de Pagamento
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <MapPin className="w-3.5 h-3.5" /> Sede 2.700m² em São Carlos-SP • Atendemos SP, MG e RJ
            </span>
            <a
              href={`https://wa.me/${FACCHINI_COMPANY.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-white hover:text-emerald-400 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              {FACCHINI_COMPANY.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* HEADER STICKY */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Logo Oficial Facchini Eventos */}
          <a href="#topo" className="flex items-center gap-3 group">
            <img
              src={FACCHINI_COMPANY.logoUrl}
              alt="Logo Facchini Eventos"
              className="h-12 w-auto rounded-lg shadow-sm border border-slate-100 object-contain bg-white"
            />
            <div>
              <span className="block font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition">
                FACCHINI <span className="text-emerald-600">EVENTOS</span>
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Locação de Mobiliário, Cabos, AV & Montagem de Stands
              </span>
            </div>
          </a>

          {/* Navegação Rápida */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#catalogo" className="hover:text-emerald-600 transition">
              Catálogo de Produtos
            </a>
            <a
              href="#catalogo"
              onClick={() => setSelectedCategory("cadeiras")}
              className="hover:text-emerald-600 transition"
            >
              Cadeiras & Mesas
            </a>
            <a
              href="#catalogo"
              onClick={() => setSelectedCategory("cabos")}
              className="hover:text-emerald-600 transition"
            >
              Cabos & Elétrica
            </a>
            <a href="#kits" className="hover:text-emerald-600 transition">
              Kits com Desconto
            </a>
            <a href="#estrutura" className="hover:text-emerald-600 transition">
              Nossa Estrutura (2.700m²)
            </a>
          </nav>

          {/* Botão do Carrinho com Valor e Forma de Pagamento */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md transition-all group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-emerald-400 group-hover:text-white transition" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] uppercase tracking-wider text-slate-300 group-hover:text-emerald-100">
                  Meu Carrinho ({totalUnitsCount} un.)
                </span>
                <span className="block text-sm font-extrabold">
                  {formatBRL(finalTotal)}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST DE FEEDBACK QUANDO SELECIONA PRODUTO */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-2 text-xs font-bold text-emerald-400 underline hover:text-emerald-300"
          >
            Ver carrinho
          </button>
        </div>
      )}

      {/* HERO DE VENDAS */}
      <section
        id="topo"
        className="relative overflow-hidden bg-slate-900 text-white border-b border-slate-800"
      >
        {/* Imagem real de fundo da Facchini Eventos com overlay gradiente */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('${FACCHINI_COMPANY.heroBgUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/75" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-400" />
              Desde 2001 • Locação Direta sem Intermediários
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12]">
              Alugue <span className="text-emerald-400">Cadeiras, Mesas, Cabos</span> e Estruturas para o seu Evento em Poucos Cliques.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Selecione os itens diretamente no catálogo, escolha as quantidades para o seu stand ou feira e finalize no carrinho escolhendo sua{" "}
              <strong className="text-white">forma de pagamento (PIX c/ 10% OFF, Cartão até 6x sem juros ou Boleto PJ)</strong>.
            </p>

            {/* Atalhos Rápidos de Categoria */}
            <div className="pt-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                O que você precisa alugar hoje? Clique para filtrar:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "cadeiras" as ProductCategory, label: "🪑 Cadeiras & Banquetas" },
                  { id: "mesas" as ProductCategory, label: "🍽️ Mesas & Balcões" },
                  { id: "cabos" as ProductCategory, label: "🔌 Cabos, Extensões & QDF" },
                  { id: "climatizacao" as ProductCategory, label: "❄️ Climatizadores" },
                  { id: "audiovisual" as ProductCategory, label: "📺 Smart TVs & Painel LED" },
                  { id: "stands" as ProductCategory, label: "🏗️ Stands & Octanorm" },
                ].map((chip) => (
                  <a
                    key={chip.id}
                    href="#catalogo"
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                      selectedCategory === chip.id
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25"
                        : "bg-white/10 hover:bg-white/15 text-slate-100 border-white/15"
                    }`}
                  >
                    {chip.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Selos de Confiança */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <strong className="block text-emerald-400 text-lg font-extrabold">+25 Anos</strong>
                <span className="text-xs text-slate-300">Tradição desde 2001</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <strong className="block text-emerald-400 text-lg font-extrabold">2.700 m²</strong>
                <span className="text-xs text-slate-300">Sede e estoque próprio</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <strong className="block text-emerald-400 text-lg font-extrabold">SP • MG • RJ</strong>
                <span className="text-xs text-slate-300">Frota e montagem própria</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <strong className="block text-emerald-400 text-lg font-extrabold">Até 6x s/ Juros</strong>
                <span className="text-xs text-slate-300">Ou 10% OFF no PIX</span>
              </div>
            </div>
          </div>

          {/* Card Resumo Interativo do Carrinho já visível no Hero */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Simulador de Pedido Ativo
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Seu Carrinho de Locação
                    </h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "itens"}
                </span>
              </div>

              {/* Seletor de Período de Locação */}
              <div className="my-4 bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setRentalPeriod("event")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    rentalPeriod === "event"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Pacote Evento (3-5 dias)
                </button>
                <button
                  type="button"
                  onClick={() => setRentalPeriod("daily")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    rentalPeriod === "daily"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Diária Avulsa (1 dia)
                </button>
              </div>

              {/* Mini lista dos itens atualmente no carrinho */}
              {cartItems.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-sm">
                  Nenhum produto selecionado ainda. Clique em{" "}
                  <strong className="text-slate-700">&ldquo;Selecionar / Incluir&rdquo;</strong> nos produtos abaixo!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {cartItems.map(({ product, qty, lineTotal }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{product.name}</p>
                          <p className="text-slate-500">
                            {qty} {product.unit} • {formatBRL(lineTotal)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => decrementProduct(product)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                          title="Diminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => incrementProduct(product, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                          title="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview da Forma de Pagamento no Card do Hero */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Forma de Pagamento Selecionada:</span>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Alterar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-2 rounded-lg border text-left transition flex items-center gap-2 ${
                          active
                            ? "border-emerald-600 bg-emerald-50/80 text-emerald-950"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? "text-emerald-600" : "text-slate-400"
                          }`}
                        />
                        <span className="text-[11px] font-bold leading-tight truncate">
                          {method.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Total estimado c/ frete:</span>
                    <strong className="text-2xl font-extrabold text-slate-900">
                      {formatBRL(finalTotal)}
                    </strong>
                    {paymentMethod === "credit_card" && (
                      <span className="block text-[11px] text-emerald-700 font-semibold">
                        ou até 6x de {formatBRL(finalTotal / 6)} sem juros
                      </span>
                    )}
                    {paymentMethod === "pix" && discountAmount > 0 && (
                      <span className="block text-[11px] text-emerald-700 font-semibold">
                        Você está economizando {formatBRL(discountAmount)} no PIX!
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
                  >
                    Ver Carrinho & Pagar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PRINCIPAL: CATÁLOGO DE PRODUTOS (CADEIRAS, MESAS, CABOS, ETC.) */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <Package className="w-3.5 h-3.5" />
              Catálogo Interativo de Locação
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Selecione os Produtos para o seu Evento
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Marque os itens desejados (cadeiras, mesas, cabos elétricos, climatizadores e TVs), defina a quantidade e veja o valor atualizado no carrinho.
            </p>
          </div>

          {/* Busca + Toggle Diária vs Pacote Evento */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cadeira, mesa, cabo PP, TV..."
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="inline-flex bg-white p-1 rounded-xl border border-slate-300 shadow-sm">
              <button
                type="button"
                onClick={() => setRentalPeriod("event")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  rentalPeriod === "event"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pacote Evento (3-5 dias)
              </button>
              <button
                type="button"
                onClick={() => setRentalPeriod("daily")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  rentalPeriod === "daily"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1 Diária
              </button>
            </div>
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-thin">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count =
              cat.id === "todos"
                ? FACCHINI_PRODUCTS.length
                : FACCHINI_PRODUCTS.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition flex items-center gap-2 ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] ${
                    isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid de Produtos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              Nenhum produto encontrado para &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Tente limpar o filtro ou buscar por termos como &ldquo;cadeira&rdquo;, &ldquo;mesa&rdquo;, &ldquo;cabo&rdquo; ou &ldquo;climatizador&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("todos");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold"
            >
              Mostrar Todos os Produtos
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const qtyInCart = cart[product.id] || 0;
              const isSelected = qtyInCart > 0;
              const unitPrice = getUnitPrice(product);

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl border-2 transition-all flex flex-col overflow-hidden ${
                    isSelected
                      ? "border-emerald-600 shadow-xl shadow-emerald-600/10 ring-2 ring-emerald-500/20"
                      : "border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-lg"
                  }`}
                >
                  {/* Imagem do Produto + Badges + Checkbox de Seleção */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/20" />

                    {/* Botão Checkbox no canto superior esquerdo para selecionar/desmarcar */}
                    <button
                      type="button"
                      onClick={() => toggleSelectProduct(product)}
                      className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-white/95 text-slate-800 hover:bg-emerald-50"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected
                            ? "bg-white text-emerald-600 border-white"
                            : "border-slate-400 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      {isSelected ? `Selecionado (${qtyInCart})` : "Selecionar"}
                    </button>

                    {/* Badge de Destaque */}
                    {product.badge && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/90 text-emerald-400 text-[11px] font-bold backdrop-blur-sm border border-emerald-500/30">
                        {product.badge}
                      </span>
                    )}

                    {/* SKU + Estoque + Ver Detalhes na base da foto */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                      <span className="font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                        {product.sku}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveProductModal(product)}
                        className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-md font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ficha Técnica
                      </button>
                    </div>
                  </div>

                  {/* Corpo do Card */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-emerald-700 mb-1">
                        <span>{product.categoryLabel}</span>
                        <span className="text-slate-400">Estoque: {product.stock} {product.unit}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.shortDesc}
                      </p>

                      {/* Mini Especificações */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                        {product.specs.slice(0, 2).map((spec, idx) => (
                          <div key={idx} className="text-[11px] text-slate-500 flex justify-between gap-2">
                            <span className="font-medium text-slate-400">{spec.label}:</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bloco de Preço + Controles de Inclusão no Carrinho */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                            {rentalPeriod === "daily" ? "Valor 1 Diária" : "Pacote Evento (3-5 dias)"}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <strong className="text-xl font-extrabold text-slate-900">
                              {formatBRL(unitPrice)}
                            </strong>
                            <span className="text-xs text-slate-500">/ {product.unit}</span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-semibold block">
                            ou {formatBRL(unitPrice * 0.9)} no PIX (10% OFF)
                          </span>
                        </div>

                        {isSelected && (
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                              Subtotal Item
                            </span>
                            <strong className="text-sm font-extrabold text-emerald-700">
                              {formatBRL(unitPrice * qtyInCart)}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Se já está no carrinho: mostra controle de quantidade + atalhos +10 */}
                      {isSelected ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-1.5">
                            <button
                              type="button"
                              onClick={() => decrementProduct(product)}
                              className="w-8 h-8 rounded-lg bg-white text-slate-800 border border-slate-200 flex items-center justify-center hover:bg-slate-100 font-bold"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="text-center">
                              <input
                                type="number"
                                min={0}
                                max={product.stock}
                                value={qtyInCart}
                                onChange={(e) =>
                                  updateCartQty(product, parseInt(e.target.value || "0", 10))
                                }
                                className="w-16 text-center font-extrabold text-sm bg-transparent text-emerald-950 focus:outline-none"
                              />
                              <span className="block text-[10px] font-semibold text-emerald-700 -mt-1">
                                {product.unit} no carrinho
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => incrementProduct(product, 1)}
                              className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 font-bold"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Botões rápidos para adicionar lotes (+5, +10, +20) */}
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-slate-500 font-medium">Lote rápido:</span>
                            <div className="flex items-center gap-1">
                              {[4, 10, 20].map((batch) => (
                                <button
                                  key={batch}
                                  type="button"
                                  onClick={() => incrementProduct(product, batch)}
                                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-bold transition"
                                >
                                  +{batch}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => updateCartQty(product, 0)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                title="Remover do carrinho"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => incrementProduct(product)}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Incluir no Carrinho ({product.minQty}{" "}
                          {product.minQty > 1 ? product.unit : "un."})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SEÇÃO KITS PRONTOS COM DESCONTO (COMBOS RÁPIDOS) */}
      <section id="kits" className="bg-slate-900 text-white py-14 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                <Flame className="w-3.5 h-3.5" />
                Combos Prontos para Stands & Feiras
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
                Kits Completos com Tudo Incluso (1 Clique p/ Adicionar ao Carrinho)
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Não quer escolher item por item? Adicione um combo completo de mesas, cadeiras e cabos já dimensionado pela nossa equipe técnica.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {FACCHINI_KITS.map((kit) => (
              <div
                key={kit.id}
                className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/60 transition"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={kit.image}
                      alt={kit.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-extrabold">
                      {kit.badge}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/85 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      -{kit.discountPercent}% no Combo
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-white">{kit.name}</h3>
                    <p className="text-xs text-slate-300 mt-1">{kit.subtitle}</p>

                    <ul className="mt-4 space-y-2 border-t border-slate-700/80 pt-3">
                      {kit.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-700/80 bg-slate-900/50 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 line-through block">
                      De {formatBRL(kit.originalPrice)}
                    </span>
                    <strong className="text-2xl font-extrabold text-emerald-400">
                      {formatBRL(kit.eventPrice)}
                    </strong>
                    <span className="block text-[10px] text-slate-300">
                      Pacote Evento • até 6x s/ juros
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addKitToCart(kit)}
                    className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Incluir Kit no Carrinho
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO FORMAS DE PAGAMENTO & CONDIÇÕES COMERCIAIS FACCHINI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Flexibilidade para Empresas & Organizadores
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Formas de Pagamento Disponíveis no Carrinho
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Escolha a condição ideal para o fluxo de caixa do seu evento. Clique abaixo para aplicar diretamente ao seu carrinho:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    showToast(`Forma de pagamento alterada para: ${method.title}`);
                  }}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/60 shadow-md"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {method.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{method.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{method.subtitle}</p>
                    <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200/80">
                      {method.details}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between text-xs font-bold">
                    <span className={isSelected ? "text-emerald-700" : "text-slate-500"}>
                      {isSelected ? "✓ Selecionado no Carrinho" : "Usar esta forma"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO AUTORIDADE REAL FACCHINI EVENTOS (FOTOS + VÍDEO OFICIAL + 2.700M²) */}
      <section id="estrutura" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <Building2 className="w-3.5 h-3.5" />
              Quem Somos • Estrutura Própria de 2.700m²
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Por que alugar com a Facchini Eventos?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Desde 2001, a <strong>FACCHINI Eventos</strong> é referência em montagem de stands básicos, mistos, construídos e locação de equipamentos para feiras e eventos corporativos. Localizada em <strong>São Carlos-SP</strong> em sede própria de <strong>2.700m²</strong>, operamos com marcenaria moderna, comunicação visual, router CNC, mobiliário, sistema Octanorm, elétrica e climatização.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">
                    Logística Rápida SP, MG e RJ
                  </strong>
                  <span className="text-[11px] text-slate-600">
                    Frota própria com pontualidade rigorosa na entrega e retirada.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <Wrench className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">
                    Equipe Técnica no Local
                  </strong>
                  <span className="text-[11px] text-slate-600">
                    Montadores, eletricistas e projetistas próprios de plantão.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
              <iframe
                src={FACCHINI_COMPANY.youtubeMainVideo}
                title="Conheça o trabalho da Facchini Eventos"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Galeria de Trabalhos Reais da Facchini */}
        <div className="mt-10">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4">
            Trabalhos e Equipamentos Reais em Eventos Recentes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {REAL_PORTFOLIO_PHOTOS.map((photo, index) => (
              <div
                key={index}
                className="group relative h-36 rounded-xl overflow-hidden border border-slate-200 shadow-sm"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-bold text-white leading-tight">
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BARRA FLUTUANTE INFERIOR DO CARRINHO + FORMA DE PAGAMENTO */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-slate-950/95 backdrop-blur-md text-white border-t border-emerald-500/40 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    {cartItems.length} {cartItems.length === 1 ? "produto selecionado" : "produtos selecionados"} ({totalUnitsCount} un.)
                  </span>
                  <span className="hidden sm:inline-block text-xs text-slate-400">•</span>
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-200">
                    Pagamento: <strong className="text-white">{selectedPaymentOption.title}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate max-w-xl">
                  {cartItems.map((i) => `${i.qty}x ${i.product.name}`).join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                  Total ({selectedPaymentOption.title})
                </span>
                <strong className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                  {formatBRL(finalTotal)}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
              >
                Abrir Carrinho & Pagamento
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER LATERAL COMPLETO DO CARRINHO + SELEÇÃO DE FORMA DE PAGAMENTO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div
            className="fixed inset-0"
            onClick={() => setIsCartOpen(false)}
            aria-label="Fechar carrinho"
          />

          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Cabeçalho do Carrinho */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold">Carrinho & Forma de Pagamento</h2>
                  <p className="text-xs text-slate-300">
                    Confira os itens selecionados e escolha como prefere pagar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Rolável do Carrinho */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Período da Locação */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                  1. Modalidade / Período de Locação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRentalPeriod("event")}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      rentalPeriod === "event"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="block text-xs font-extrabold">Pacote Evento (3 a 5 dias)</span>
                    <span className="block text-[11px] text-emerald-700">
                      Melhor custo-benefício p/ feiras
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentalPeriod("daily")}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      rentalPeriod === "daily"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="block text-xs font-extrabold">Diária Avulsa (1 dia)</span>
                    <span className="block text-[11px] text-slate-500">
                      Para eventos rápidos de 1 dia
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Lista de Produtos no Carrinho */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    2. Produtos Selecionados ({cartItems.length})
                  </h3>
                  {cartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Limpar tudo
                    </button>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center">
                    <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Seu carrinho está vazio</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Volte ao catálogo para selecionar cadeiras, mesas, cabos ou estruturas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map(({ product, qty, unitPrice, lineTotal }) => (
                      <div
                        key={product.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {product.sku}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {formatBRL(unitPrice)} / {product.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <strong className="text-sm font-extrabold text-slate-900">
                            {formatBRL(lineTotal)}
                          </strong>
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => decrementProduct(product)}
                              className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-extrabold">{qty}</span>
                            <button
                              type="button"
                              onClick={() => incrementProduct(product, 1)}
                              className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCartQty(product, 0)}
                              className="ml-1 p-1 text-slate-400 hover:text-rose-600"
                              title="Remover item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Logística e Local de Entrega */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  3. Região de Entrega & Montagem
                </label>
                <select
                  value={deliveryRegionId}
                  onChange={(e) => setDeliveryRegionId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {DELIVERY_REGIONS.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label} — {region.fee === 0 ? "Grátis" : formatBRL(region.fee)}
                    </option>
                  ))}
                </select>
                <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Nome do Evento / Pavilhão (opcional)"
                    className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Data do Evento (ex: 15 a 18/Nov)"
                    className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 4. SELEÇÃO DA FORMA DE PAGAMENTO NO CARRINHO */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-600/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    4. Escolha a Forma de Pagamento
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Obrigatório
                  </span>
                </div>

                <div className="space-y-2.5">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border-2 transition ${
                          active
                            ? "border-emerald-600 bg-white shadow-sm"
                            : "border-slate-200 bg-white/70 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                                active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                              }`}
                            >
                              {active && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Icon className="w-4 h-4 text-emerald-600" />
                                <span className="font-extrabold text-sm text-slate-900">
                                  {method.title}
                                </span>
                                {method.badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                    {method.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{method.subtitle}</p>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes específicos da forma selecionada */}
                        {active && (
                          <div className="mt-3 pt-3 border-t border-slate-100 pl-8 text-xs text-slate-700 space-y-2">
                            <p className="text-[11px] text-slate-500">{method.details}</p>

                            {method.id === "pix" && (
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-between">
                                <span>Valor final com 10% de desconto no PIX:</span>
                                <strong className="text-sm font-extrabold">
                                  {formatBRL(finalTotal)}
                                </strong>
                              </div>
                            )}

                            {method.id === "credit_card" && (
                              <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-700">
                                  Selecione o número de parcelas (sem juros):
                                </label>
                                <select
                                  value={installments}
                                  onChange={(e) => setInstallments(Number(e.target.value))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900"
                                >
                                  {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <option key={n} value={n}>
                                      {n}x de {formatBRL(finalTotal / n)} sem juros (Total:{" "}
                                      {formatBRL(finalTotal)})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {method.id === "split_signal" && (
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                  <span className="text-[10px] uppercase text-slate-500 block">
                                    1ª Parcela (Reserva Hoje)
                                  </span>
                                  <strong className="text-sm font-extrabold text-slate-900">
                                    {formatBRL(signalHalfValue)}
                                  </strong>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                  <span className="text-[10px] uppercase text-slate-500 block">
                                    2ª Parcela (Na Entrega)
                                  </span>
                                  <strong className="text-sm font-extrabold text-slate-900">
                                    {formatBRL(signalHalfValue)}
                                  </strong>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Identificação Rápida para Emissão do Pedido */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  5. Dados para Reserva / Faturamento
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu Nome ou Razão Social da Empresa"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={customerDoc}
                    onChange={(e) => setCustomerDoc(e.target.value)}
                    placeholder="CNPJ ou CPF"
                    className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp com DDD"
                    className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Rodapé Fixo do Carrinho: Resumo Financeiro + Botões de Fechamento */}
            <div className="p-5 bg-slate-900 text-white border-t border-slate-800 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal dos Produtos ({totalUnitsCount} un.):</span>
                  <span>{formatBRL(subtotalProducts)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Desconto Pagamento PIX (10% OFF):</span>
                    <span>-{formatBRL(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Frete & Entrega ({selectedDelivery.label.split("(")[0]}):</span>
                  <span>{deliveryFee === 0 ? "Grátis" : formatBRL(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase text-emerald-400 block">
                      Total a Pagar ({selectedPaymentOption.title})
                    </span>
                    {paymentMethod === "credit_card" && (
                      <span className="text-[11px] text-slate-300">
                        Em {installments}x de {formatBRL(installmentValue)} sem juros
                      </span>
                    )}
                    {paymentMethod === "split_signal" && (
                      <span className="text-[11px] text-slate-300">
                        Sinal agora de {formatBRL(signalHalfValue)} + {formatBRL(signalHalfValue)} na montagem
                      </span>
                    )}
                  </div>
                  <strong className="text-2xl font-extrabold text-white">
                    {formatBRL(finalTotal)}
                  </strong>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={() => setCheckoutSuccessModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Finalizar Pedido Agora
                </button>
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={handleOpenWhatsAppCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition border border-white/15"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Enviar p/ WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FICHA TÉCNICA DO PRODUTO */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in">
            <div className="relative h-64 bg-slate-900">
              <img
                src={activeProductModal.image}
                alt={activeProductModal.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveProductModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                {activeProductModal.categoryLabel} • {activeProductModal.sku}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {activeProductModal.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{activeProductModal.fullDesc}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid sm:grid-cols-2 gap-3">
                {activeProductModal.specs.map((spec, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-bold text-slate-500 block">{spec.label}</span>
                    <span className="font-semibold text-slate-900">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">
                    Valor unitário ({rentalPeriod === "daily" ? "1 Diária" : "Pacote Evento"}):
                  </span>
                  <strong className="text-2xl font-extrabold text-slate-900">
                    {formatBRL(getUnitPrice(activeProductModal))}
                  </strong>
                  <span className="text-xs text-slate-500"> / {activeProductModal.unit}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      incrementProduct(activeProductModal);
                      setActiveProductModal(null);
                    }}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Incluir no Carrinho
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SIMULAÇÃO DE PAGAMENTO / CHECKOUT CONCLUÍDO */}
      {checkoutSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pedido #FAC-2026-849 Gerado
              </span>
              <button
                type="button"
                onClick={() => setCheckoutSuccessModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Resumo de Pagamento • {selectedPaymentOption.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Seus itens foram pré-reservados. Confira abaixo as instruções da forma de pagamento selecionada:
              </p>
            </div>

            {/* Simulação visual específica para cada método de pagamento */}
            {paymentMethod === "pix" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-3">
                <div className="w-36 h-36 mx-auto bg-white p-3 rounded-2xl border border-emerald-300 flex flex-col items-center justify-center shadow-sm">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="text-[10px] font-mono text-slate-500 mt-1">PIX FACCHINI</span>
                </div>
                <div>
                  <span className="text-xs text-emerald-800 font-semibold block">
                    Total com 10% de Desconto Aplicado:
                  </span>
                  <strong className="text-2xl font-extrabold text-emerald-950">
                    {formatBRL(finalTotal)}
                  </strong>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Escaneie o QR Code ou envie o pedido pelo botão do WhatsApp abaixo para receber a chave PIX CNPJ oficial da Facchini Eventos.
                </p>
              </div>
            )}

            {paymentMethod === "credit_card" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Condição no Cartão de Crédito:</span>
                  <span className="text-emerald-700">Sem Juros</span>
                </div>
                <strong className="text-xl font-extrabold text-slate-900 block">
                  {installments}x de {formatBRL(installmentValue)}
                </strong>
                <p className="text-xs text-slate-500">
                  Total: {formatBRL(finalTotal)} • O link seguro da operadora será enviado imediatamente no seu WhatsApp para conclusão.
                </p>
              </div>
            )}

            {paymentMethod === "split_signal" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <strong className="text-sm font-extrabold text-slate-900 block">
                  Condição 50% Reserva + 50% na Montagem:
                </strong>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500 block">Sinal p/ Reserva:</span>
                    <strong className="text-base font-extrabold text-emerald-700">
                      {formatBRL(signalHalfValue)}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500 block">Na Entrega no Evento:</span>
                    <strong className="text-base font-extrabold text-slate-900">
                      {formatBRL(signalHalfValue)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "boleto_pj" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <strong className="text-sm font-extrabold text-slate-900 block">
                  Faturamento Boleto PJ + Nota Fiscal:
                </strong>
                <p className="text-slate-600">
                  Valor Total: <strong>{formatBRL(finalTotal)}</strong> • Faturamento sujeito à validação expressa do CNPJ junto ao setor financeiro da Facchini Eventos.
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsAppCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <MessageCircle className="w-5 h-5" />
                Confirmar Pedido no WhatsApp da Facchini
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Copy className="w-4 h-4" />
                {copiedOrderText
                  ? "✓ Resumo do Pedido Copiado!"
                  : "Copiar Resumo do Pedido e Pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER OFICIAL FACCHINI EVENTOS */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={FACCHINI_COMPANY.logoUrl}
              alt="Facchini Eventos"
              className="h-9 w-auto rounded bg-white p-0.5"
            />
            <div>
              <strong className="text-white block">FACCHINI EVENTOS • Desde 2001</strong>
              <span>
                São Carlos - SP (Área própria 2.700m²) • Atendimento em SP, MG e RJ
              </span>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-slate-300 font-semibold">
              WhatsApp: {FACCHINI_COMPANY.phoneDisplay} • E-mail: {FACCHINI_COMPANY.email}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Página de Vendas Demonstrativa — Rota /model-teste1
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

