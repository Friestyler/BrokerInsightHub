import * as React from "react"
import { 
  Building2, 
  Car, 
  Heart, 
  Shield, 
  Home, 
  Plane, 
  Briefcase, 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  FileText, 
  Settings, 
  Zap, 
  Globe, 
  Lock, 
  Star, 
  CheckCircle,
  Search,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Available icons for categories
const AVAILABLE_ICONS = [
  { name: "Building2", icon: Building2, label: "Building" },
  { name: "Car", icon: Car, label: "Car" },
  { name: "Heart", icon: Heart, label: "Heart" },
  { name: "Shield", icon: Shield, label: "Shield" },
  { name: "Home", icon: Home, label: "Home" },
  { name: "Plane", icon: Plane, label: "Plane" },
  { name: "Briefcase", icon: Briefcase, label: "Briefcase" },
  { name: "Users", icon: Users, label: "Users" },
  { name: "DollarSign", icon: DollarSign, label: "Dollar" },
  { name: "Target", icon: Target, label: "Target" },
  { name: "TrendingUp", icon: TrendingUp, label: "Trending Up" },
  { name: "Award", icon: Award, label: "Award" },
  { name: "Clock", icon: Clock, label: "Clock" },
  { name: "FileText", icon: FileText, label: "Document" },
  { name: "Settings", icon: Settings, label: "Settings" },
  { name: "Zap", icon: Zap, label: "Lightning" },
  { name: "Globe", icon: Globe, label: "Globe" },
  { name: "Lock", icon: Lock, label: "Lock" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "CheckCircle", icon: CheckCircle, label: "Check Circle" },
]

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function IconPicker({ value, onChange, placeholder = "Select icon..." }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedIcon = AVAILABLE_ICONS.find(icon => icon.name === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between h-9 bg-white border-gray-200"
        >
          <div className="flex items-center gap-2">
            {selectedIcon ? (
              <>
                <selectedIcon.icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{selectedIcon.label}</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-lg">
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 border-pink-300 focus:border-pink-400 focus:ring-pink-100"
            />
          </div>
          <div className="grid grid-cols-9 gap-2 max-h-48 overflow-y-auto">
            {filteredIcons.map((iconItem) => {
              const IconComponent = iconItem.icon
              return (
                <button
                  key={iconItem.name}
                  onClick={() => {
                    onChange(iconItem.name)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded border transition-colors",
                    value === iconItem.name
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  )}
                >
                  <IconComponent className="h-4 w-4 text-gray-600" />
                </button>
              )
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              No icons found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}