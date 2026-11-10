import type { Metadata } from "next";
import { FacchiniModel1Landing } from "@/components/facchini/FacchiniModel1Landing";

export const metadata: Metadata = {
  title: "Facchini Eventos | Catálogo de Locação: Cadeiras, Mesas, Cabos e Estruturas",
  description:
    "Alugue cadeiras, mesas, cabos elétricos, climatizadores, TVs e stands com a Facchini Eventos. Selecione os produtos, monte seu carrinho e escolha a forma de pagamento.",
};

export default function ModelTeste1Page() {
  return <FacchiniModel1Landing />;
}

