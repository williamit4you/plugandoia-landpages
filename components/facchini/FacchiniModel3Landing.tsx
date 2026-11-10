"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  FACCHINI_COMPANY,
  FACCHINI_PRODUCTS,
  FacchiniProduct,
  PRODUCT_CATEGORIES,
  ProductCategory,
} from "@/lib/facchiniProductsMock";
import {
  Activity,
  Armchair,
  ArrowRight,
  Banknote,
  Bolt,
  Check,
  CheckCircle2,
  Cpu,
  CreditCard,
  FileText,
  Layers,
  LayoutGrid,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Tv,
  Users,
  Wand2,
  Wind,
  X,
  Zap,
} from "lucide-react";

type PaymentMethodId = "pix" | "credit_card" | "split_signal" | "boleto_pj";

interface SmartPreset {
  id: string;
  title: string;
  areaBadge: string;
  desc: string;
  cartPreset: Record<string, number>;
}

const SMART_PRESETS: SmartPreset[] = [
  {
    id: "stand-9m",
    title: "Stand Compacto 3x3m",
    areaBadge: "9 m² • Feiras",
    desc: "Atendimento ágil com mesa de reunião, balcão e cabeamento seguro.",
    cartPreset: {
      "mes-redonda-vidro": 1,
      "cad-iso-preta": 4,
      "mes-balcao-octanorm": 1,
      "cad-banqueta-bistro": 2,
      "cab-pp-extensao-20m": 1,
      "cab-regua-industrial": 2,
    },
  },
  {
    id: "stand-18m",
    title: "Stand Executivo 6x3m",
    areaBadge: "18 m² • Completo",
    desc: "Duas áreas de negociação, bistrô, Smart TV 4K, climatizador e kit elétrico.",
    cartPreset: {
      "mes-redonda-vidro": 2,
      "cad-iso-preta": 8,
      "mes-bistro-alta": 1,
      "cad-banqueta-bistro": 3,
      "mes-balcao-octanorm": 1,
      "av-smart-tv-55": 1,
      "cli-evaporativo-18000": 1,
      "cab-pp-extensao-20m": 2,
      "cab-passa-cabo-solo": 3,
      "cab-regua-industrial": 3,
    },
  },
  {
    id: "auditorio-palestra",
    title: "Auditório / Workshop",
    areaBadge: "40 Lugares + Palco",
    desc: "Cadeiras para público, poltronas talk-show, TV de retorno e distribuição QDF.",
    cartPreset: {
      "cad-iso-preta": 40,
      "cad-poltrona-lounge": 2,
      "mes-pranchao-180": 2,
      "av-smart-tv-55": 2,
      "cli-evaporativo-18000": 2,
      "cab-quadro-qdf": 1,
      "cab-pp-extensao-20m": 3,
      "cab-passa-cabo-solo": 6,
      "cab-regua-industrial": 4,
    },
  },
  {
    id: "infra-cabos-force",
    title: "Central de Cabos & Energia",
    areaBadge: "Só Elétrica & Dados",
    desc: "Combo blindado de Quadro QDF, Cabos PP, Passa-cabos de solo, HDMI e Réguas.",
    cartPreset: {
      "cab-quadro-qdf": 1,
      "cab-pp-extensao-20m": 4,
      "cab-passa-cabo-solo": 6,
      "cab-regua-industrial": 6,
      "cab-kit-hdmi-rede": 2,
    },
  },
];

const PAYMENT_OPTIONS: {
  id: PaymentMethodId;
  name: string;
  tag: string;
  discountPercent: number;
  icon: React.ComponentType<{ className?: string }>;
  highlight: string;
}[] = [
  {
    id: "pix",
    name: "PIX Instantâneo",
    tag: "10% OFF",
    discountPercent: 10,
    icon: QrCode,
    highlight: "Maior economia no fechamento imediato",
  },
  {
    id: "credit_card",
    name: "Cartão em até 6x",
    tag: "Sem Juros",
    discountPercent: 0,
    icon: CreditCard,
    highlight: "Parcele sem comprometer o orçamento da feira",
  },
  {
    id: "split_signal",
    name: "50% Hoje + 50% Entrega",
    tag: "Sinal + Montagem",
    discountPercent: 0,
    icon: Banknote,
    highlight: "Trave a reserva hoje e quite após a montagem",
  },
  {
    id: "boleto_pj",
    name: "Faturamento PJ",
    tag: "15/28 DDL",
    discountPercent: 0,
    icon: FileText,
    highlight: "Boleto + NF para empresas com CNPJ",
  },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function FacchiniModel3Landing() {
  const [activePresetId, setActivePresetId] = useState<string>("stand-9m");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("todos");
  const [rentalMode, setRentalMode] = useState<"event" | "daily">("event");

  // Carrinho inicial baseado no preset Stand 3x3m
  const [cart, setCart] = useState<Record<string, number>>(
    SMART_PRESETS[0].cartPreset
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("pix");
  const [installments, setInstallments] = useState<number>(6);
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState<boolean>(false);

  const applyPreset = (preset: SmartPreset) => {
    setActivePresetId(preset.id);
    setCart({ ...preset.cartPreset });
  };

  const getPrice = (product: FacchiniProduct) =>
    rentalMode === "daily" ? product.dailyPrice : product.eventPrice;

  const setQty = (product: FacchiniProduct, nextQty: number) => {
    setActivePresetId("custom");
    setCart((prev) => {
      const next = { ...prev };
      if (nextQty <= 0) {
        delete next[product.id];
      } else {
        next[product.id] = Math.min(product.stock, nextQty);
      }
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "todos") return FACCHINI_PRODUCTS;
    return FACCHINI_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = FACCHINI_PRODUCTS.find((p) => p.id === id);
        if (!product || qty <= 0) return null;
        const unitPrice = rentalMode === "daily" ? product.dailyPrice : product.eventPrice;
        return {
          product,
          qty,
          unitPrice,
          total: unitPrice * qty,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, rentalMode]);

  // TELEMETRIA / RAIO-X INTELIGENTE DO EVENTO (INOVAÇÃO DO MODELO 3)
  const eventTelemetry = useMemo(() => {
    let seatsCount = 0;
    let tablesCount = 0;
    let cableMeters = 0;
    let powerOutletsAvailable = 0;
    let powerConsumersCount = 0;

    for (const item of cartItems) {
      const { product, qty } = item;
      if (product.category === "cadeiras") {
        seatsCount += qty;
      }
      if (product.category === "mesas") {
        tablesCount += qty;
      }
      if (product.id === "cab-pp-extensao-20m") {
        cableMeters += qty * 20;
      }
      if (product.id === "cab-kit-hdmi-rede") {
        cableMeters += qty * 15;
      }
      if (product.id === "cab-regua-industrial") {
        powerOutletsAvailable += qty * 6;
      }
      if (product.id === "cab-quadro-qdf") {
        powerOutletsAvailable += qty * 6;
      }
      if (product.category === "climatizacao" || product.category === "audiovisual") {
        powerConsumersCount += qty;
      }
    }

    const needsMoreCables =
      (tablesCount > 0 || powerConsumersCount > 0) &&
      (cableMeters === 0 || powerOutletsAvailable < powerConsumersCount + tablesCount);

    return {
      seatsCount,
      tablesCount,
      cableMeters,
      powerOutletsAvailable,
      powerConsumersCount,
      needsMoreCables,
    };
  }, [cartItems]);

  const totalUnits = useMemo(
    () => cartItems.reduce((acc, i) => acc + i.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, i) => acc + i.total, 0),
    [cartItems]
  );

  const activePayment = useMemo(
    () => PAYMENT_OPTIONS.find((p) => p.id === paymentMethod) || PAYMENT_OPTIONS[0],
    [paymentMethod]
  );

  const discount = useMemo(
    () => Math.round((subtotal * activePayment.discountPercent) / 100),
    [subtotal, activePayment]
  );

  const finalTotal = Math.max(0, subtotal - discount);

  const addSmartCableSuggestion = () => {
    const ppProduct = FACCHINI_PRODUCTS.find((p) => p.id === "cab-pp-extensao-20m");
    const reguaProduct = FACCHINI_PRODUCTS.find((p) => p.id === "cab-regua-industrial");
    setCart((prev) => ({
      ...prev,
      ...(ppProduct ? { [ppProduct.id]: (prev[ppProduct.id] || 0) + 1 } : {}),
      ...(reguaProduct ? { [reguaProduct.id]: (prev[reguaProduct.id] || 0) + 2 } : {}),
    }));
  };

  const handleWhatsAppConfirm = () => {
    const modeText =
      rentalMode === "event" ? "Pacote Evento (3 a 5 dias)" : "1 Diária Avulsa";
    const lines = [
      `Olá, *Facchini Eventos*! Usei o *Configurador Inteligente* do site e montei esta estrutura (${modeText}):`,
      ``,
      `*RAIO-X DO ESPAÇO:*`,
      `• Assentos: ${eventTelemetry.seatsCount} lugares`,
      `• Mesas e Balcões: ${eventTelemetry.tablesCount} un.`,
      `• Cabeamento & Energia: ${eventTelemetry.cableMeters}m de cabos / ${eventTelemetry.powerOutletsAvailable} tomadas`,
      ``,
      `*ITENS NO CARRINHO:*`,
      ...cartItems.map(
        (i) => `• ${i.qty}x ${i.product.name} — ${formatBRL(i.total)}`
      ),
      ``,
      `*PAGAMENTO ESCOLHIDO:* ${activePayment.name} (${activePayment.tag})`,
      paymentMethod === "credit_card"
        ? `*Parcelamento:* ${installments}x de ${formatBRL(finalTotal / installments)} sem juros`
        : null,
      `*TOTAL:* ${formatBRL(finalTotal)}`,
    ].filter(Boolean);

    window.open(
      `https://wa.me/${FACCHINI_COMPANY.whatsappNumber}?text=${encodeURIComponent(
        lines.join("\n")
      )}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* HEADER STUDIO CONFIGURADOR */}
      <header className="sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={FACCHINI_COMPANY.logoUrl}
              alt="Facchini Eventos"
              className="h-11 w-auto rounded-lg bg-white p-0.5 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  FACCHINI <span className="text-emerald-400">STUDIO</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <Wand2 className="w-3 h-3" /> Configurador Inteligente
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Monte seu Stand ou Evento com Dimensionamento Automático
              </span>
            </div>
          </div>

          {/* Seletor entre os 3 Modelos */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
            <Link
              href="/model-teste1"
              className="px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition"
            >
              Modelo 1 (E-Commerce)
            </Link>
            <Link
              href="/model-teste2"
              className="px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition"
            >
              Modelo 2 (Clean)
            </Link>
            <Link
              href="/model-teste3"
              className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold shadow"
            >
              Modelo 3 (Smart Builder)
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setCheckoutDrawerOpen(true)}
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>Carrinho ({totalUnits})</span>
            <span className="pl-2 border-l border-slate-950/20">
              {formatBRL(finalTotal)}
            </span>
          </button>
        </div>
      </header>

      {/* PASSO 1: PRESETS INTELIGENTES POR TAMANHO DE STAND / EVENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Passo 1 • Escolha um Cenário Pronto ou Monte do Zero
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Qual estrutura você quer montar hoje?
            </h1>
          </div>

          {/* Toggle Período */}
          <div className="inline-flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => setRentalMode("event")}
              className={`px-3.5 py-2 rounded-lg transition ${
                rentalMode === "event"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pacote Feira (3 a 5 dias)
            </button>
            <button
              type="button"
              onClick={() => setRentalMode("daily")}
              className={`px-3.5 py-2 rounded-lg transition ${
                rentalMode === "daily"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1 Diária
            </button>
          </div>
        </div>

        {/* Cards de Presets com 1 clique */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SMART_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-emerald-300">
                      {preset.areaBadge}
                    </span>
                    {isActive && (
                      <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    )}
                  </div>
                  <h2 className="font-extrabold text-white text-base">{preset.title}</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{preset.desc}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                  <span>Carregar configuração</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* PAINEL PRINCIPAL: CONFIGURADOR + RAIO-X EM TEMPO REAL + PAGAMENTO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 grid lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA (7 COLUNAS): SELETOR INTERATIVO DE EQUIPAMENTOS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Barra de Telemetria / Raio-X da Infraestrutura do Evento */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Raio-X em Tempo Real da sua Estrutura Selecionada
              </span>
              <span className="text-[11px] text-slate-400">
                Atualiza conforme você clica nos itens
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Assentos</span>
                </div>
                <strong className="text-xl font-extrabold text-white block mt-1">
                  {eventTelemetry.seatsCount} lugares
                </strong>
                <span className="text-[11px] text-slate-400">Cadeiras, banquetas e poltronas</span>
              </div>

              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  <span>Superfícies</span>
                </div>
                <strong className="text-xl font-extrabold text-white block mt-1">
                  {eventTelemetry.tablesCount} {eventTelemetry.tablesCount === 1 ? "mesa/balcão" : "mesas/balcões"}
                </strong>
                <span className="text-[11px] text-slate-400">Pontos de atendimento</span>
              </div>

              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Rede Elétrica</span>
                </div>
                <strong className="text-xl font-extrabold text-white block mt-1">
                  {eventTelemetry.cableMeters}m / {eventTelemetry.powerOutletsAvailable} tom.
                </strong>
                <span className="text-[11px] text-slate-400">Cabos PP e réguas 20A</span>
              </div>
            </div>

            {/* Alerta Inteligente de Cross-Sell de Cabos! */}
            {eventTelemetry.needsMoreCables && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-amber-200">
                  <Bolt className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Dica Técnica Facchini:</strong> Você selecionou mesas/equipamentos, mas tem poucos cabos ou tomadas no carrinho.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addSmartCableSuggestion}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition shrink-0"
                >
                  + Incluir 20m Cabo PP + 2 Réguas
                </button>
              </div>
            )}
          </div>

          {/* Filtro Rápido por Categoria */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {PRODUCT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                    active
                      ? "bg-white text-slate-950 border-white"
                      : "bg-white/5 text-slate-300 border-white/10 hover:border-white/25"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Lista de Produtos Estilo Configurador Interativo */}
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const qty = cart[product.id] || 0;
              const isSelected = qty > 0;
              const unitPrice = getPrice(product);

              return (
                <div
                  key={product.id}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/[0.08] shadow-lg shadow-emerald-500/5"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          {product.categoryLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {product.sku}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm sm:text-base truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {product.shortDesc}
                      </p>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <strong className="text-sm font-extrabold text-emerald-400">
                          {formatBRL(unitPrice)}
                        </strong>
                        <span className="text-[11px] text-slate-400">/ {product.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Controles Rápidos de Seleção e Quantidade */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    {isSelected ? (
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-emerald-500/40 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => setQty(product, qty - 1)}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={product.stock}
                            value={qty}
                            onChange={(e) =>
                              setQty(product, parseInt(e.target.value || "0", 10))
                            }
                            className="w-12 text-center font-extrabold text-xs bg-transparent text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQty(product, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        <div className="text-right min-w-[78px]">
                          <span className="text-[10px] text-slate-400 block">Subtotal</span>
                          <strong className="text-xs font-extrabold text-white">
                            {formatBRL(unitPrice * qty)}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setQty(product, product.minQty)}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Incluir ({product.minQty})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA (5 COLUNAS): CARRINHO + COMPARADOR DE FORMAS DE PAGAMENTO AO VIVO */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Passo 2 • Revisão & Pagamento
                </span>
                <h2 className="text-lg font-extrabold text-white">
                  Seu Carrinho Configurado
                </h2>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart({})}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Zerar
                </button>
              )}
            </div>

            {/* Lista Compacta do Carrinho */}
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-white/10 rounded-2xl">
                Selecione um cenário no topo ou clique em &ldquo;Incluir&rdquo; nos equipamentos ao lado.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cartItems.map(({ product, qty, total }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{product.name}</p>
                      <span className="text-[11px] text-slate-400">
                        {qty} {product.unit} × {formatBRL(getPrice(product))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <strong className="font-bold text-emerald-400">{formatBRL(total)}</strong>
                      <button
                        type="button"
                        onClick={() => setQty(product, 0)}
                        className="text-slate-500 hover:text-rose-400"
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COMPARADOR DE FORMAS DE PAGAMENTO COM CÁLCULO EM TEMPO REAL */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Escolha a Forma de Pagamento
                </label>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Valores calculados ao vivo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  const simulatedTotal =
                    opt.discountPercent > 0
                      ? Math.round(subtotal * (1 - opt.discountPercent / 100))
                      : subtotal;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        active
                          ? "border-emerald-500 bg-emerald-500/15 shadow-md"
                          : "border-white/10 bg-white/[0.02] hover:border-white/25"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <Icon
                            className={`w-4 h-4 ${
                              active ? "text-emerald-400" : "text-slate-400"
                            }`}
                          />
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              active
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {opt.tag}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-white block">{opt.name}</span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/10">
                        {opt.id === "credit_card" ? (
                          <strong className="text-xs font-extrabold text-emerald-300 block">
                            6x de {formatBRL(simulatedTotal / 6)}
                          </strong>
                        ) : opt.id === "split_signal" ? (
                          <strong className="text-xs font-extrabold text-emerald-300 block">
                            2x de {formatBRL(simulatedTotal / 2)}
                          </strong>
                        ) : (
                          <strong className="text-xs font-extrabold text-emerald-300 block">
                            {formatBRL(simulatedTotal)}
                          </strong>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "credit_card" && (
                <div className="pt-1">
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs font-bold text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        Parcelar em {n}x de {formatBRL(finalTotal / n)} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Fechamento Final */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">
                    Total ({activePayment.name})
                  </span>
                  {discount > 0 && (
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Economia de {formatBRL(discount)} no PIX
                    </span>
                  )}
                </div>
                <strong className="text-3xl font-extrabold text-white">
                  {formatBRL(finalTotal)}
                </strong>
              </div>

              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={handleWhatsAppConfirm}
                className="w-full py-4 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/25"
              >
                <MessageCircle className="w-5 h-5" />
                Reservar Estrutura c/ {activePayment.name}
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* MODAL DO CARRINHO NO MOBILE/TABLET */}
      {checkoutDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">Resumo do Carrinho & Pagamento</h3>
              <button
                type="button"
                onClick={() => setCheckoutDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto border-y border-white/10 py-3 text-xs">
              {cartItems.map(({ product, qty, total }) => (
                <div key={product.id} className="flex justify-between">
                  <span>
                    <strong>{qty}x</strong> {product.name}
                  </span>
                  <span className="text-emerald-400 font-bold">{formatBRL(total)}</span>
                </div>
              ))}
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Forma de Pagamento:</span>
                <strong className="text-white">{activePayment.name}</strong>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="font-bold">Total Final:</span>
                <strong className="text-2xl font-extrabold text-emerald-400">
                  {formatBRL(finalTotal)}
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleWhatsAppConfirm}
              className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar Pedido no WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

