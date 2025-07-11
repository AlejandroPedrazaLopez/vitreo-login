// Tremor Currency Input [v1.0.0]

import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusInput, hasErrorInput } from "../../../lib/utils"

const currencyInputStyles = tv({
  base: [
    // base
    "relative block w-full appearance-none rounded-md border px-2.5 py-2 shadow-xs outline-hidden transition sm:text-sm",
    // border color
    "border-gray-300 dark:border-gray-800",
    // text color
    "text-gray-900 dark:text-gray-50",
    // placeholder color
    "placeholder-gray-400 dark:placeholder-gray-500",
    // background color
    "bg-white dark:bg-gray-950",
    // disabled
    "disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
    "dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500",
    // focus
    focusInput,
    // remove number input arrows
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  ],
  variants: {
    hasError: {
      true: hasErrorInput,
    },
  },
})

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">,
    VariantProps<typeof currencyInputStyles> {
  inputClassName?: string
  value?: number
  onChange?: (value: number) => void
  currency?: string
  locale?: string
  decimalPlaces?: number
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      className,
      inputClassName,
      hasError,
      value = 0,
      onChange,
      currency = "",
      locale = "es-ES",
      decimalPlaces = 2,
      placeholder,
      ...props
    }: CurrencyInputProps,
    forwardedRef,
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>("")
    const [isTyping, setIsTyping] = React.useState(false)

    // Obtener separadores según el locale
    const getLocaleInfo = (locale: string) => {
      // Configuración manual para evitar problemas de detección automática
      if (locale.startsWith('es')) {
        // Español: punto para miles, coma para decimales
        return { thousandSeparator: '.', decimalSeparator: ',' }
      } else if (locale.startsWith('en')) {
        // Inglés: coma para miles, punto para decimales
        return { thousandSeparator: ',', decimalSeparator: '.' }
      }
      
      // Fallback automático para otros locales
      const formatter = new Intl.NumberFormat(locale)
      const parts = formatter.formatToParts(1234.56)
      
      const thousandSeparator = parts.find(part => part.type === 'group')?.value || ','
      const decimalSeparator = parts.find(part => part.type === 'decimal')?.value || '.'
      
      return { thousandSeparator, decimalSeparator }
    }

    const { thousandSeparator, decimalSeparator } = getLocaleInfo(locale)

    // Función para formatear número con separador de miles y decimales
    const formatNumber = (num: number): string => {
      if (num === 0) return ""
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces
      }).format(num)
    }

    // Función para limpiar y extraer número de un string
    const parseStringToNumber = (str: string): number => {
      if (!str || str.trim() === "") return 0
      
      let cleaned = str.trim()
      
      // Enfoque más simple y directo
      let result = 0
      
      if (thousandSeparator === '.' && decimalSeparator === ',') {
        // Español: puntos para miles, coma para decimales
        // Ejemplo: "14.187.705,42"
        
        // Buscar la última coma (separador decimal)
        const lastCommaIndex = cleaned.lastIndexOf(',')
        
        if (lastCommaIndex !== -1) {
          // Hay parte decimal
          const integerPart = cleaned.substring(0, lastCommaIndex)
          const decimalPart = cleaned.substring(lastCommaIndex + 1)
          
          // Limpiar la parte entera removiendo todos los puntos
          const cleanInteger = integerPart.replace(/\./g, '')
          // Limpiar la parte decimal dejando solo números
          const cleanDecimal = decimalPart.replace(/[^\d]/g, '')
          
          // Construir el número
          const numberString = cleanInteger + '.' + cleanDecimal
          result = parseFloat(numberString) || 0
        } else {
          // Solo parte entera
          const cleanInteger = cleaned.replace(/\./g, '')
          result = parseInt(cleanInteger) || 0
        }
      } else if (thousandSeparator === ',' && decimalSeparator === '.') {
        // Inglés: comas para miles, punto para decimales
        // Ejemplo: "14,187,705.42"
        
        // Buscar el último punto (separador decimal)
        const lastDotIndex = cleaned.lastIndexOf('.')
        
        if (lastDotIndex !== -1) {
          // Verificar si es realmente un separador decimal
          // (debe tener 1-3 dígitos después del punto)
          const afterDot = cleaned.substring(lastDotIndex + 1)
          if (afterDot.length <= 3 && /^\d+$/.test(afterDot)) {
            // Es separador decimal
            const integerPart = cleaned.substring(0, lastDotIndex)
            const decimalPart = afterDot
            
            // Limpiar la parte entera removiendo todas las comas
            const cleanInteger = integerPart.replace(/,/g, '')
            
            // Construir el número
            const numberString = cleanInteger + '.' + decimalPart
            result = parseFloat(numberString) || 0
          } else {
            // Es separador de miles
            const cleanInteger = cleaned.replace(/[,.]/g, '')
            result = parseInt(cleanInteger) || 0
          }
        } else {
          // Solo parte entera
          const cleanInteger = cleaned.replace(/,/g, '')
          result = parseInt(cleanInteger) || 0
        }
      }
      
      // Limitar decimales según la configuración
      if (decimalPlaces > 0) {
        const factor = Math.pow(10, decimalPlaces)
        result = Math.round(result * factor) / factor
      } else {
        result = Math.round(result)
      }
      
      return result
    }

    // Función para formatear mientras se escribe
    const formatWhileTyping = (input: string, cursorPosition: number): { formatted: string, newCursorPosition: number } => {
      if (!input) return { formatted: "", newCursorPosition: 0 }
      
      // Para español (es-ES): punto=miles, coma=decimal
      if (thousandSeparator === '.' && decimalSeparator === ',') {
        // Permitir entrada directa con separadores ya formateados
        // Validar que solo contenga números, puntos y máximo una coma
        const validChars = /^[\d\.,]*$/
        if (!validChars.test(input)) {
          return { formatted: displayValue, newCursorPosition: cursorPosition }
        }
        
        // Verificar que solo hay una coma máximo
        const commaCount = (input.match(/,/g) || []).length
        if (commaCount > 1) {
          return { formatted: displayValue, newCursorPosition: cursorPosition }
        }
        
        // Si la entrada parece válida, permitirla tal como está
        return { formatted: input, newCursorPosition: cursorPosition }
      }
      
      // Para inglés (en-US): coma=miles, punto=decimal
      else if (thousandSeparator === ',' && decimalSeparator === '.') {
        // Permitir entrada directa con separadores ya formateados
        const validChars = /^[\d\.,]*$/
        if (!validChars.test(input)) {
          return { formatted: displayValue, newCursorPosition: cursorPosition }
        }
        
        // Verificar que solo hay un punto máximo al final
        const dotCount = (input.match(/\./g) || []).length
        if (dotCount > 1) {
          return { formatted: displayValue, newCursorPosition: cursorPosition }
        }
        
        return { formatted: input, newCursorPosition: cursorPosition }
      }
      
      // Fallback: devolver la entrada sin cambios
      return { formatted: input, newCursorPosition: cursorPosition }
    }

    // Sincronizar valor externo con display interno
    React.useEffect(() => {
      if (!isTyping) {
        setDisplayValue(formatNumber(value))
      }
    }, [value, locale, decimalPlaces, isTyping])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      setIsTyping(true)
      
      // Permitir entrada vacía
      if (inputValue === "") {
        setDisplayValue("")
        if (onChange) {
          onChange(0)
        }
        return
      }
      
      // Formatear mientras se escribe (validación básica)
      const { formatted } = formatWhileTyping(inputValue, 0)
      setDisplayValue(formatted)
      
      // Extraer valor numérico y notificar cambio
      const numericValue = parseStringToNumber(formatted)
      
      if (onChange) {
        onChange(numericValue)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTyping(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTyping(false)
      
      // Al perder focus, extraer y formatear el valor final
      const finalValue = parseStringToNumber(displayValue)
      
      // Actualizar el valor si cambió
      if (onChange && finalValue !== value) {
        onChange(finalValue)
      }
      
      // Mostrar el valor formateado
      setTimeout(() => {
        setDisplayValue(formatNumber(finalValue))
      }, 0)
      
      props.onBlur?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir teclas de control
      const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
      if (controlKeys.includes(e.key)) {
        props.onKeyDown?.(e)
        return
      }
      
      // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey || e.metaKey) {
        props.onKeyDown?.(e)
        return
      }
      
      // Permitir números
      if (/^\d$/.test(e.key)) {
        props.onKeyDown?.(e)
        return
      }
      
      // Permitir separador decimal (solo uno y solo el correcto para el locale)
      if (e.key === decimalSeparator && !displayValue.includes(decimalSeparator)) {
        props.onKeyDown?.(e)
        return
      }
      
      // Prevenir cualquier otra tecla
      e.preventDefault()
    }

    return (
      <div className={cx("relative w-full", className)} tremor-id="tremor-raw">
        <input
          ref={forwardedRef}
          type="text"
          inputMode="decimal"
          className={cx(
            currencyInputStyles({ hasError }),
            {
              "pr-12": currency,
            },
            inputClassName,
          )}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          {...props}
        />
        {currency && (
          <div
            className={cx(
              // base
              "pointer-events-none absolute bottom-0 right-3 flex h-full items-center justify-center",
              // text color
              "text-gray-500 dark:text-gray-400",
              // font
              "text-sm font-medium",
            )}
          >
            {currency}
          </div>
        )}
      </div>
    )
  },
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput, currencyInputStyles, type CurrencyInputProps } 