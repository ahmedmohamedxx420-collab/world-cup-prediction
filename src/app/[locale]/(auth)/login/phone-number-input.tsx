"use client";

import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  flagEmoji,
  type PhoneCountry,
} from "@/lib/phone/dialing-codes";

type PhoneNumberInputProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
  onCompletionChange?: (isComplete: boolean) => void;
};

function emptyNationalDigits(count: number) {
  return Array.from({ length: count }, () => "");
}

function normalizePastedDigits(raw: string) {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    digits = digits.replace(/^\d{1,4}/, "");
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2).replace(/^\d{1,4}/, "");
  }

  return digits;
}

export function PhoneNumberInput({
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  onCompletionChange,
}: PhoneNumberInputProps) {
  const t = useTranslations("auth");
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [nationalDigits, setNationalDigits] = useState(() =>
    emptyNationalDigits(DEFAULT_PHONE_COUNTRY.nationalDigits),
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const nationalRefs = useRef<Array<HTMLInputElement | null>>([]);

  const nationalValue = nationalDigits.join("");
  const phoneValue = `${selectedCountry.dialCode}${nationalValue}`;
  const isComplete = nationalValue.length === selectedCountry.nationalDigits;
  const countryGroupLabelId = `${baseId}-country-group-label`;
  const nationalGroupLabelId = `${baseId}-national-group-label`;
  const countryListId = `${baseId}-country-list`;
  const selectedCountryName = t(selectedCountry.nameKey);

  const localizedCountries = useMemo(
    () =>
      PHONE_COUNTRIES.map((country) => ({
        ...country,
        name: t(country.nameKey),
      })),
    [t],
  );

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return localizedCountries;

    return localizedCountries.filter((country) =>
      [
        country.name,
        country.searchName,
        country.iso2,
        country.dialCode,
        `+${country.dialCode}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [localizedCountries, search]);

  useEffect(() => {
    nationalRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    onCompletionChange?.(isComplete);
  }, [isComplete, onCompletionChange]);

  useEffect(() => {
    if (!isPickerOpen) return;

    const timeout = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isPickerOpen]);

  function focusNationalBox(index: number) {
    const boundedIndex = Math.max(
      0,
      Math.min(index, selectedCountry.nationalDigits - 1),
    );
    const input = nationalRefs.current[boundedIndex];

    input?.focus();
    input?.select();
  }

  function selectCountry(country: PhoneCountry) {
    setSelectedCountry(country);
    setNationalDigits(emptyNationalDigits(country.nationalDigits));
    setIsPickerOpen(false);
    setSearch("");
    window.requestAnimationFrame(() => focusNationalBox(0));
  }

  function setDigitAtIndex(index: number, value: string) {
    setNationalDigits((digits) =>
      digits.map((digit, digitIndex) =>
        digitIndex === index ? value : digit,
      ),
    );
  }

  function applyDigitsFromIndex(startIndex: number, digits: string) {
    if (!digits) return;

    const nextDigits = [...nationalDigits];
    let index = startIndex;

    for (const digit of digits) {
      if (index >= selectedCountry.nationalDigits) break;
      nextDigits[index] = digit;
      index += 1;
    }

    setNationalDigits(nextDigits);
    window.requestAnimationFrame(() =>
      focusNationalBox(Math.min(index, selectedCountry.nationalDigits - 1)),
    );
  }

  function handleChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      setDigitAtIndex(index, "");
      return;
    }

    applyDigitsFromIndex(index, digits);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    const key = event.key;

    if (key.length === 1 && !/\d/.test(key)) {
      event.preventDefault();
      return;
    }

    if (key === "ArrowLeft" || key === "ArrowRight") {
      event.preventDefault();
      focusNationalBox(index + (key === "ArrowLeft" ? -1 : 1));
      return;
    }

    if (key === "Backspace") {
      event.preventDefault();

      if (nationalDigits[index]) {
        setDigitAtIndex(index, "");
        return;
      }

      const previousIndex = Math.max(index - 1, 0);
      setDigitAtIndex(previousIndex, "");
      focusNationalBox(previousIndex);
      return;
    }

    if (key === "Delete") {
      event.preventDefault();
      setDigitAtIndex(index, "");
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    event.preventDefault();
    applyDigitsFromIndex(
      index,
      normalizePastedDigits(event.clipboardData.getData("text")),
    );
  }

  function renderDigitInput(index: number) {
    return (
      <input
        key={index}
        id={`${baseId}-national-${index + 1}`}
        ref={(node) => {
          nationalRefs.current[index] = node;
        }}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        maxLength={1}
        value={nationalDigits[index]}
        aria-label={t("phoneDigitLabel", { position: index + 1 })}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className="h-9 w-full min-w-0 rounded-md border border-input bg-background text-center text-sm font-semibold tabular-nums transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:h-10 md:text-base dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        onChange={(event) => handleChange(index, event.currentTarget.value)}
        onFocus={(event) => event.currentTarget.select()}
        onKeyDown={(event) => handleKeyDown(event, index)}
        onPaste={(event) => handlePaste(event, index)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="phone" value={phoneValue} readOnly />

      <div ref={pickerRef} className="relative">
        <button
          type="button"
          aria-expanded={isPickerOpen}
          aria-controls={countryListId}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 py-2 text-start transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-xl leading-none" aria-hidden="true">
              {flagEmoji(selectedCountry.iso2)}
            </span>
            <span className="min-w-0 truncate text-sm font-medium">
              {selectedCountryName}
            </span>
          </span>
          <span className="shrink-0 font-mono text-sm text-muted-foreground">
            +{selectedCountry.dialCode}
          </span>
        </button>

        {isPickerOpen ? (
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg animate-in fade-in zoom-in-95 slide-in-from-top-2">
            <label className="sr-only" htmlFor={`${baseId}-country-search`}>
              {t("phoneCountrySearchLabel")}
            </label>
            <input
              id={`${baseId}-country-search`}
              ref={searchRef}
              type="search"
              value={search}
              placeholder={t("phoneCountrySearchPlaceholder")}
              className="mb-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              onChange={(event) => setSearch(event.currentTarget.value)}
            />

            <div
              id={countryListId}
              role="listbox"
              className="max-h-64 overflow-y-auto"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.iso2}
                    type="button"
                    role="option"
                    aria-selected={country.iso2 === selectedCountry.iso2}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-start text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                    onClick={() => selectCountry(country)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-xl leading-none" aria-hidden="true">
                        {flagEmoji(country.iso2)}
                      </span>
                      <span className="min-w-0 truncate">{country.name}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      +{country.dialCode}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">
                  {t("phoneCountryNoResults")}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-h-8">
        <div
          key={selectedCountry.iso2}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-2.5 py-1 text-sm font-medium text-accent-foreground animate-in fade-in zoom-in-95 slide-in-from-top-2"
        >
          <span className="text-xl leading-none" aria-hidden="true">
            {flagEmoji(selectedCountry.iso2)}
          </span>
          <span>{selectedCountryName}</span>
        </div>
      </div>

      <div
        dir="ltr"
        role="group"
        aria-labelledby={ariaLabelledBy}
        className="flex w-full min-w-0 items-center gap-1.5"
      >
        <div
          role="group"
          aria-labelledby={countryGroupLabelId}
          className="flex shrink-0 items-center"
        >
          <span id={countryGroupLabelId} className="sr-only">
            {t("phoneCountryGroupLabel")}
          </span>
          <div
            className="flex h-9 w-14 items-center justify-center rounded-md border border-input bg-muted px-2 font-mono text-sm font-semibold text-muted-foreground tabular-nums md:h-10 md:w-16"
            aria-label={t("phoneCountryKeyLockedLabel", {
              code: selectedCountry.dialCode,
            })}
          >
            +{selectedCountry.dialCode}
          </div>
        </div>

        <span
          className="flex h-9 shrink-0 items-center text-muted-foreground md:h-10"
          aria-hidden="true"
        >
          -
        </span>

        <div
          role="group"
          aria-labelledby={nationalGroupLabelId}
          className="grid min-w-0 flex-1 gap-1 md:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${selectedCountry.nationalDigits}, minmax(0, 1fr))`,
          }}
        >
          <span id={nationalGroupLabelId} className="sr-only">
            {t("phoneNumberGroupLabel")}
          </span>
          {Array.from(
            { length: selectedCountry.nationalDigits },
            (_, index) => renderDigitInput(index),
          )}
        </div>
      </div>
    </div>
  );
}
