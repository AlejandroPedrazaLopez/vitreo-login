// Tremor Select [v1.0.0] con búsqueda integrada

import React, { useMemo, useState } from "react"
import * as SelectPrimitives from "@radix-ui/react-select"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiExpandUpDownLine,
} from "@remixicon/react"

import { cx, focusInput, hasErrorInput } from "../../../lib/utils"

// Helper function to extract text content from React elements
function getChildTextContent(element: React.ReactElement): string {
  if (typeof element.props.children === 'string') {
    return element.props.children
  }
  if (React.isValidElement(element.props.children)) {
    return getChildTextContent(element.props.children)
  }
  if (Array.isArray(element.props.children)) {
    return element.props.children
      .map((child: any) => {
        if (typeof child === 'string') return child
        if (React.isValidElement(child)) return getChildTextContent(child)
        return ''
      })
      .join('')
  }
  return String(element.props.children || '')
}

const Select = SelectPrimitives.Root
Select.displayName = "Select"

const SelectGroup = SelectPrimitives.Group
SelectGroup.displayName = "SelectGroup"

const SelectValue = SelectPrimitives.Value
SelectValue.displayName = "SelectValue"

const selectTriggerStyles = [
  cx(
    "group/trigger flex w-full select-none items-center justify-between gap-2 truncate rounded-md border px-3 py-2 shadow-xs outline-hidden transition sm:text-sm",
    "border-gray-300 dark:border-gray-800",
    "text-gray-900 dark:text-gray-50",
    "data-placeholder:text-gray-500 dark:data-placeholder:text-gray-500",
    "bg-white dark:bg-gray-950",
    "hover:bg-gray-50 dark:hover:bg-gray-950/50",
    "data-disabled:bg-gray-100 data-disabled:text-gray-400",
    "dark:data-disabled:border-gray-700 dark:data-disabled:bg-gray-800 dark:data-disabled:text-gray-500",
    focusInput,
  ),
]

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger> & {
    hasError?: boolean
  }
>(({ className, hasError, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Trigger
      ref={forwardedRef}
      className={cx(
        selectTriggerStyles,
        hasError ? hasErrorInput : "",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitives.Icon asChild>
        <RiExpandUpDownLine
          className={cx(
            "size-4 shrink-0",
            "text-gray-400 dark:text-gray-600",
            "group-data-disabled/trigger:text-gray-300 dark:group-data-disabled/trigger:text-gray-600",
          )}
        />
      </SelectPrimitives.Icon>
    </SelectPrimitives.Trigger>
  )
})

SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollUpButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollUpButton
    ref={forwardedRef}
    className={cx("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <RiArrowUpSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitives.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollDownButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollDownButton
    ref={forwardedRef}
    className={cx("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <RiArrowDownSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitives.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content> & {
    searchableItems?: { label: string; value: string }[]
    enableSearch?: boolean
    onSelectItem?: (value: string) => void
    searchPlaceholder?: string
  }
>(
  (
    {
      className,
      position = "popper",
      sideOffset = 8,
      collisionPadding = 10,
      searchableItems,
      enableSearch = false,
      onSelectItem,
      searchPlaceholder = "Buscar...",
      ...props
    },
    forwardedRef,
  ) => {
    const [search, setSearch] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    // Reset search when select closes
    React.useEffect(() => {
      if (!isOpen) {
        setSearch("")
      }
    }, [isOpen])

    const filteredItems = useMemo(() => {
      if (!enableSearch || !searchableItems) return searchableItems || []
      return searchableItems.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      )
    }, [search, searchableItems, enableSearch])

    // Filter children when enableSearch is true but no searchableItems provided
    const filteredChildren = useMemo(() => {
      if (!enableSearch || searchableItems || !search) return props.children
      
      return React.Children.toArray(props.children).filter((child) => {
        if (!React.isValidElement(child)) return true
        
        // Check if child has text content that matches search
        const childText = getChildTextContent(child)
        return childText.toLowerCase().includes(search.toLowerCase())
      })
    }, [props.children, search, enableSearch, searchableItems])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        setSearch("")
      }
    }

    return (
      <SelectPrimitives.Portal>
        <SelectPrimitives.Content
          ref={forwardedRef}
          className={cx(
            "relative z-50 overflow-hidden rounded-md border shadow-xl shadow-black/[2.5%]",
            "min-w-[calc(var(--radix-select-trigger-width)-2px)] max-w-[95vw]",
            "max-h-[var(--radix-select-content-available-height)]",
            "bg-white dark:bg-gray-950",
            "text-gray-900 dark:text-gray-50",
            "border-gray-200 dark:border-gray-800",
            "will-change-[transform,opacity]",
            "data-[state=closed]:animate-hide",
            "data-[side=bottom]:animate-slide-down-and-fade data-[side=left]:animate-slide-left-and-fade data-[side=right]:animate-slide-right-and-fade data-[side=top]:animate-slide-up-and-fade",
            className,
          )}
          sideOffset={sideOffset}
          position={position}
          collisionPadding={collisionPadding}
          onCloseAutoFocus={(e: any) => {
            if (enableSearch) {
              // Focus search input when content opens
              setTimeout(() => {
                const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
                searchInput?.focus()
              }, 0)
            }
          }}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitives.Viewport
            className={cx(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[calc(var(--radix-select-trigger-width))]",
            )}
          >
            {enableSearch && (
              <div className="p-1 border-b border-gray-200 dark:border-gray-700">
                <input
                  data-search-input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
            
            {enableSearch && searchableItems ? (
              // When using searchableItems prop
              filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => {
                      onSelectItem?.(item.value)
                      setSearch("")
                    }}
                  >
                    {item.label}
                  </SelectItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron resultados
                </div>
              )
            ) : enableSearch && search ? (
              // When using regular children with search
              React.Children.count(filteredChildren) > 0 ? (
                filteredChildren
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron resultados
                </div>
              )
            ) : (
              // Default children rendering
              props.children
            )}
          </SelectPrimitives.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitives.Content>
      </SelectPrimitives.Portal>
    )
  },
)
SelectContent.displayName = "SelectContent"

const SelectGroupLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Label>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Label
    ref={forwardedRef}
    className={cx(
      "px-3 py-2 text-xs font-medium tracking-wide",
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))
SelectGroupLabel.displayName = "SelectGroupLabel"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cx(
        "grid cursor-pointer grid-cols-[1fr_20px] gap-x-2 rounded-sm px-3 py-2 outline-hidden transition-colors data-[state=checked]:font-semibold sm:text-sm",
        "text-gray-900 dark:text-gray-50",
        "data-disabled:pointer-events-none data-disabled:text-gray-400 data-disabled:hover:bg-none dark:data-disabled:text-gray-600",
        "focus-visible:bg-gray-100 dark:focus-visible:bg-gray-900",
        "hover:bg-gray-100 dark:hover:bg-gray-900",
        className,
      )}
      {...props}
    >
      <SelectPrimitives.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitives.ItemText>
      <SelectPrimitives.ItemIndicator>
        <RiCheckLine
          className="size-5 shrink-0 text-gray-800 dark:text-gray-200"
          aria-hidden="true"
        />
      </SelectPrimitives.ItemIndicator>
    </SelectPrimitives.Item>
  )
})
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Separator>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Separator
    ref={forwardedRef}
    className={cx("-mx-1 my-1 h-px", "bg-gray-300 dark:bg-gray-700", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
