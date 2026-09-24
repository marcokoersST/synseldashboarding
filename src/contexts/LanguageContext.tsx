import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translateDutchText, type AppLanguage } from "@/lib/translations";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (dutch: string, english?: string) => string;
}

const STORAGE_KEY = "synsel-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, { source: string; rendered: string }>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ["aria-label", "title", "placeholder", "alt"];

function translateElement(root: Node, language: AppLanguage) {
  const isExcluded = (node: Node) => node.parentElement?.closest("[data-no-translate='true']") !== null;
  const visitText = (node: Text) => {
    if (isExcluded(node)) return;
    const current = node.nodeValue ?? "";
    const stored = originalText.get(node);
    const source = !stored || current !== stored.rendered ? current : stored.source;
    const next = language === "en" ? translateDutchText(source) : source;
    originalText.set(node, { source, rendered: next });
    if (current !== next) node.nodeValue = next;
  };

  const visitElement = (element: Element) => {
    if (element.closest("[data-no-translate='true']")) return;
    let stored = originalAttributes.get(element);
    if (!stored) {
      stored = new Map<string, string>();
      originalAttributes.set(element, stored);
    }
    translatedAttributes.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (current === null) return;
      if (!stored?.has(attribute)) stored?.set(attribute, current);
      const source = stored?.get(attribute) ?? current;
      const next = language === "en" ? translateDutchText(source) : source;
      if (current !== next) element.setAttribute(attribute, next);
    });
  };

  if (root.nodeType === Node.TEXT_NODE) visitText(root as Text);
  if (root.nodeType === Node.ELEMENT_NODE) visitElement(root as Element);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) visitText(node as Text);
    else visitElement(node as Element);
    node = walker.nextNode();
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "nl";
  });

  const setLanguage = useCallback((next: AppLanguage) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => setLanguage(language === "nl" ? "en" : "nl"), [language, setLanguage]);
  const t = useCallback((dutch: string, english?: string) => language === "en" ? (english ?? translateDutchText(dutch)) : dutch, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    translateElement(document.body, language);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => translateElement(node, language));
        if (mutation.type === "characterData") translateElement(mutation.target, language);
        if (mutation.type === "attributes") translateElement(mutation.target, language);
      });
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: translatedAttributes });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t }), [language, setLanguage, toggleLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}