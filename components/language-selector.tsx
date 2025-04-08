"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "jp", label: "Japanese", flag: "🇯🇵" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
]

export function LanguageSelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("en")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem("preferredLanguage")
    if (savedLanguage && languages.some(lang => lang.value === savedLanguage)) {
      setValue(savedLanguage)
    }
  }, [])

  const handleSelect = (currentValue: string) => {
    setValue(currentValue)
    setOpen(false)
    localStorage.setItem("preferredLanguage", currentValue)
    
    // Dispatch event for components that need to know when language changes
    const language = currentValue === "jp" ? "JP" : "EN"
    const event = new CustomEvent('languageChange', { detail: language })
    window.dispatchEvent(event)
  }

  if (!mounted) return null

  const selectedLanguage = languages.find(lang => lang.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
        >
          <span className="sr-only">Select language</span>
          {selectedLanguage?.flag ? (
            <span className="text-sm">{selectedLanguage.flag}</span>
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={handleSelect}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">{language.flag}</span>
                  <span>{language.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 