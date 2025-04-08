"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Language = {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
]

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])
  const [mounted, setMounted] = useState(false)

  // When mounted on client, now we can show the UI and get the saved language preference
  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("preferred-language")
    if (savedLang) {
      const lang = languages.find(l => l.code === savedLang)
      if (lang) setCurrentLanguage(lang)
    }
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang)
    localStorage.setItem("preferred-language", lang.code)
    
    // Dispatch a custom event that other components can listen to
    const event = new CustomEvent('languageChange', { detail: lang.code })
    window.dispatchEvent(event)
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
        <Globe className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className={`flex items-center gap-2 ${
              currentLanguage.code === lang.code ? "font-bold bg-accent" : ""
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 