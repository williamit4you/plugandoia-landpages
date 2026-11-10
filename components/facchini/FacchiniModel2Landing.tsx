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
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

type PaymentMethodId = "pix" | "credit_card" | "split_signal" | "boleto_pj";

const CLEAN_PAYMENT_OPTIONS: {
  id: PaymentMethodId;
  label: string;
  sublabel: string;
  discountPercent: number;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "pix",
    label: "PIX à Vista",
    sublabel: "10% de desconto imediato",
    discountPercent: 10,
    icon: QrCode,
  },
  {
    id: "credit_card",
    label: "Cartão de Crédito",
    sublabel: "Em até 6x sem juros",
    discountPercent: 0,
    icon: CreditCard,
  },
  {
    id: "split_signal",
    label: "50% Reserva + 50% Entrega",
    sublabel: "Metade hoje e metade na montagem",
    discountPercent: 0,
    icon: Banknote,
  },
  {
    id: "boleto_pj",
    label: "Boleto Corporativo PJ",
    sublabel: "Faturado 15/28 DDL c/ Nota Fiscal",
    discountPercent: 0,
    icon: FileText,
  },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function FacchiniModel2Landing() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [rentalDays, setRentalDays] = useState<"event" | "daily">("event");

  // Carrinho inicial enxuto
  const [cart, setCart] = useState<Record<string, number>>({
    "cad-iso-preta": 4,
    "mes-redonda-vidro": 1,
    "cab-pp-extensao-20m": 1,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("pix");
  const [installments, setInstallments] = useState<number>(3);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return FACCHINI_PRODUCTS.filter((p) => {
      const matchCat = selectedCategory === "todos" || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getPrice = (product: FacchiniProduct) =>
    rentalDays === "daily" ? product.dailyPrice : product.eventPrice;

  const setQty = (product: FacchiniProduct, nextQty: number) => {
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

  const toggleProduct = (product: FacchiniProduct) => {
    const current = cart[product.id] || 0;
    if (current > 0) {
      setQty(product, 0);
    } else {
      setQty(product, product.minQty);
    }
  };

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = FACCHINI_PRODUCTS.find((p) => p.id === id);
        if (!product || qty <= 0) return null;
        const unitPrice = rentalDays === "daily" ? product.dailyPrice : product.eventPrice;
        return {
          product,
          qty,
          unitPrice,
          total: unitPrice * qty,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, rentalDays]);

  const totalUnits = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.total, 0),
    [cartItems]
  );

  const activePayment = useMemo(
    () => CLEAN_PAYMENT_OPTIONS.find((p) => p.id === paymentMethod) || CLEAN_PAYMENT_OPTIONS[0],
    [paymentMethod]
  );

  const discount = useMemo(
    () => Math.round((subtotal * activePayment.discountPercent) / 100),
    [subtotal, activePayment]
  );

  const finalTotal = Math.max(0, subtotal - discount);

  const sendToWhatsApp = () => {
    const periodLabel = rentalDays === "event" ? "Pacote Evento (3-5 dias)" : "1 Diária";
    const text = [
      `Olá, *Facchini Eventos*! Segue meu pedido pelo catálogo online (${periodLabel}):`,
      ``,
      ...cartItems.map(
        (i) => `• ${i.qty}x ${i.product.name} — ${formatBRL(i.total)}`
      ),
      ``,
      `*Total:* ${formatBRL(finalTotal)}`,
      `*Forma de Pagamento:* ${activePayment.label}${
        paymentMethod === "credit_card"
          ? ` (${installments}x de ${formatBRL(finalTotal / installments)} s/ juros)`
          : ""
      }`,
    ].join("\n");

    window.open(
      `https://wa.me/${FACCHINI_COMPANY.whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER MINIMALISTA */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={FACCHINI_COMPANY.logoUrl}
              alt="Facchini Eventos"
              className="h-11 w-auto rounded-lg object-contain"
            />
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 block">
                Facchini Eventos
              </span>
              <span className="text-xs text-slate-400 block">
                Locação de Mobiliário, Cabos & Estruturas
              </span>
            </div>
          </div>

          {/* Navegação discreta entre os modelos */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-medium">
            <Link
              href="/model-teste1"
              className="px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 transition"
            >
              Modelo 1 (Completo)
            </Link>
            <Link
              href="/model-teste2"
              className="px-3 py-1.5 rounded-full bg-white text-slate-900 font-semibold shadow-sm"
            >
              Modelo 2 (Clean)
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold transition"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span>Carrinho ({totalUnits})</span>
            <span className="pl-2 border-l border-white/20 font-bold">
              {formatBRL(finalTotal)}
            </span>
          </button>
        </div>
      </header>

      {/* HERO CLEAN & DIRETO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 border-b border-slate-100">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            Catálogo Rápido • SP, MG e RJ
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">
            Escolha os produtos para o seu evento.
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Selecione cadeiras, mesas, cabos e climatizadores abaixo e escolha a forma de pagamento no carrinho ao lado.
          </p>
        </div>

        {/* Barra de Filtro + Busca Minimalista */}
        <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {PRODUCT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar item..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-100 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent focus:border-emerald-500 transition"
              />
            </div>

            <div className="inline-flex bg-slate-100 p-1 rounded-full text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setRentalDays("event")}
                className={`px-3 py-1 rounded-full transition ${
                  rentalDays === "event" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Evento (3-5d)
              </button>
              <button
                type="button"
                onClick={() => setRentalDays("daily")}
                className={`px-3 py-1 rounded-full transition ${
                  rentalDays === "daily" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                1 Diária
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL EM 2 COLUNAS: PRODUTOS CLEAN (ESQUERDA) + CARRINHO & PAGAMENTO FIXO (DIREITA) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-12 gap-10 items-start">
        {/* Coluna Esquerda: Grid de Produtos Minimalista (7 colunas) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="grid sm:grid-cols-2 gap-5">
            {filteredProducts.map((product) => {
              const qty = cart[product.id] || 0;
              const selected = qty > 0;
              const price = getPrice(product);

              return (
                <div
                  key={product.id}
                  className={`group rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    selected
                      ? "border-emerald-600 bg-emerald-50/20 shadow-sm"
                      : "border-slate-200/80 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleProduct(product)}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
                          selected
                            ? "bg-emerald-600 text-white"
                            : "bg-white/90 text-slate-700 hover:bg-white"
                        }`}
                        title={selected ? "Remover seleção" : "Selecionar produto"}
                      >
                        {selected ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400">
                      {product.categoryLabel}
                    </span>
                    <h2 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug mt-0.5">
                      {product.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {product.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-base font-bold text-slate-900">
                        {formatBRL(price)}
                      </strong>
                      <span className="text-xs text-slate-400"> / {product.unit}</span>
                    </div>

                    {selected ? (
                      <div className="inline-flex items-center gap-2 bg-white border border-emerald-600/40 rounded-full px-2 py-1">
                        <button
                          type="button"
                          onClick={() => setQty(product, qty - 1)}
                          className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-emerald-800 min-w-[20px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(product, qty + 1)}
                          className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleProduct(product)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-semibold transition"
                      >
                        Selecionar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Carrinho Clean + Forma de Pagamento Sempre Visível (5 colunas no LG / 4 no XL) */}
        <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-base text-slate-900">Seu Carrinho</h2>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart({})}
                  className="text-xs text-slate-400 hover:text-rose-600 transition"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Itens Selecionados */}
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                Clique em <strong>&ldquo;Selecionar&rdquo;</strong> nos produtos ao lado para montar seu pedido.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {cartItems.map(({ product, qty, total }) => (
                  <div
                    key={product.id}
                    className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {qty} {product.unit} • {formatBRL(total)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQty(product, qty - 1)}
                        className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(product, qty + 1)}
                        className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQty(product, 0)}
                        className="ml-1 text-slate-300 hover:text-rose-500"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Escolha da Forma de Pagamento */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Forma de Pagamento
              </label>

              <div className="space-y-2">
                {CLEAN_PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = paymentMethod === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setPaymentMethod(option.id)}
                      className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-emerald-600 bg-white shadow-sm"
                          : "border-slate-200/80 bg-white/60 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-emerald-600" : "text-slate-400"
                          }`}
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {option.label}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {option.sublabel}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Se Cartão de Crédito, mostra seletor clean de parcelas */}
              {paymentMethod === "credit_card" && (
                <div className="pt-1">
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatBRL(finalTotal / n)} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Resumo Total + Botão Finalizar */}
            <div className="pt-4 border-t border-slate-200/80 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({totalUnits} itens)</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Desconto PIX (10%)</span>
                    <span>-{formatBRL(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 text-slate-900">
                  <span className="font-bold text-sm">Total</span>
                  <div className="text-right">
                    <strong className="text-2xl font-extrabold">{formatBRL(finalTotal)}</strong>
                    {paymentMethod === "split_signal" && (
                      <span className="block text-[11px] text-slate-500">
                        Sinal de {formatBRL(finalTotal / 2)} na reserva
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={() => setOrderModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-sm transition shadow-sm"
              >
                Finalizar Pedido
              </button>

              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={sendToWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* RODAPÉ MINIMALISTA */}
      <footer className="border-t border-slate-100 py-8 mt-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            <strong className="text-slate-700">Facchini Eventos</strong> • Desde 2001 • Sede própria 2.700m² em São Carlos - SP
          </p>
          <p>
            WhatsApp: {FACCHINI_COMPANY.phoneDisplay} • {FACCHINI_COMPANY.email}
          </p>
        </div>
      </footer>

      {/* MODAL CLEAN DE CONFIRMAÇÃO DE PEDIDO / PAGAMENTO */}
      {(orderModalOpen || mobileCartOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Resumo do seu Pedido</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderModalOpen(false);
                  setMobileCartOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto border-y border-slate-100 py-3">
              {cartItems.map(({ product, qty, total }) => (
                <div key={product.id} className="flex justify-between text-xs">
                  <span className="text-slate-700">
                    <strong>{qty}x</strong> {product.name}
                  </span>
                  <span className="font-semibold text-slate-900">{formatBRL(total)}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Forma de Pagamento:</span>
                <strong className="text-slate-900">{activePayment.label}</strong>
              </div>
              {paymentMethod === "credit_card" && (
                <div className="flex justify-between text-slate-500">
                  <span>Parcelamento:</span>
                  <strong className="text-slate-900">
                    {installments}x de {formatBRL(finalTotal / installments)} sem juros
                  </strong>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/80">
                <span className="font-bold text-slate-900">Valor Final:</span>
                <strong className="text-xl font-extrabold text-emerald-600">
                  {formatBRL(finalTotal)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={sendToWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Confirmar e Receber Link no WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

