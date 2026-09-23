"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";

const CardContext = createContext({
  cards: [],
  setCards: () => {},
  activeCard: null,
  setActiveCard: () => {},
  cardsLoading: true,
  refetchCards: async () => {},
});

export function CardProvider({ children }) {
  const [cards,        setCards]        = useState([]);
  const [activeCard,   setActiveCard]   = useState(null);
  const [cardsLoading, setCardsLoading] = useState(true);

  const refetchCards = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setCardsLoading(false); return; }
      const res = await api.get("/cards");
      setCards(res.data.cards ?? res.data ?? []);
    } catch {
      // silent
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => { refetchCards(); }, []);

  return (
    <CardContext.Provider value={{
      cards, setCards,
      activeCard, setActiveCard,
      cardsLoading, refetchCards,
    }}>
      {children}
    </CardContext.Provider>
  );
}

export const useCard = () => useContext(CardContext);
