import type { Metadata } from "next";
import { FacchiniModel3Landing } from "@/components/facchini/FacchiniModel3Landing";

export const metadata: Metadata = {
  title: "Facchini Eventos | Configurador Inteligente de Stand & Evento (Modelo 3)",
  description:
    "Configure seu stand ou evento em 1 clique com dimensionamento automático de cadeiras, mesas, cabos e elétrica, raio-x em tempo real e comparador de formas de pagamento.",
};

export default function ModelTeste3Page() {
  return <FacchiniModel3Landing />;
}

