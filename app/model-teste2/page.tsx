import type { Metadata } from "next";
import { FacchiniModel2Landing } from "@/components/facchini/FacchiniModel2Landing";

export const metadata: Metadata = {
  title: "Facchini Eventos | Catálogo Clean de Locação (Modelo 2)",
  description:
    "Selecione cadeiras, mesas, cabos e estruturas de forma rápida e clean, com carrinho e escolha da forma de pagamento ao lado.",
};

export default function ModelTeste2Page() {
  return <FacchiniModel2Landing />;
}

