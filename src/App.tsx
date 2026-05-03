import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import SearchPage from "@/pages/search";
import MovieDetail from "@/pages/movie-detail";
import Browse from "@/pages/browse";
import Watchlist from "@/pages/watchlist";
import HistoryPage from "@/pages/history";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/movie/:detailPath" component={MovieDetail} />
      <Route path="/browse/:type" component={Browse} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/history" component={HistoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
