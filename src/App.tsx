import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Clientes from "./pages/Clientes.tsx";
import Imoveis from "./pages/Imoveis.tsx";
import Processos from "./pages/Processos.tsx";
import Documentos from "./pages/Documentos.tsx";
import Financeiro from "./pages/Financeiro.tsx";
import Agenda from "./pages/Agenda.tsx";
import Mapa from "./pages/Mapa.tsx";
import Alertas from "./pages/Alertas.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Diagnostico from "./pages/Diagnostico.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/imoveis" element={<Imoveis />} />
          <Route path="/processos" element={<Processos />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
