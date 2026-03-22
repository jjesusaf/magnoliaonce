"use client";

import { useEffect, useState, useRef } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

type AddressResult = {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
};

type Props = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  className?: string;
};

function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[]
): Omit<AddressResult, "address"> {
  let streetNumber = "";
  let route = "";
  let neighborhood = "";
  let city = "";
  let state = "";
  let zip = "";

  for (const c of components) {
    const type = c.types[0];
    switch (type) {
      case "street_number":
        streetNumber = c.long_name;
        break;
      case "route":
        route = c.long_name;
        break;
      case "sublocality_level_1":
      case "sublocality":
      case "neighborhood":
        neighborhood = c.long_name;
        break;
      case "locality":
        city = c.long_name;
        break;
      case "administrative_area_level_1":
        state = c.long_name;
        break;
      case "postal_code":
        zip = c.long_name;
        break;
    }
  }

  // Build a readable address: "Route #Number, Colonia"
  const parts = [];
  if (route) parts.push(streetNumber ? `${route} #${streetNumber}` : route);
  if (neighborhood) parts.push(neighborhood);

  return {
    city,
    state,
    zip,
  };
}

// Load Google Maps script once
let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("Google Places API key not configured");
    return Promise.resolve();
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function AddressAutocomplete({
  placeholder,
  value,
  onChange,
  onSelect,
  className,
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      // Wait until google.maps.places is actually available
      const check = () => {
        if ((window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
          setReady(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }, []);

  // Always render a plain input, swap to autocomplete when ready
  if (!ready) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
    );
  }

  return (
    <AutocompleteInput
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      className={className}
    />
  );
}

function AutocompleteInput({
  placeholder,
  value: externalValue,
  onChange: externalOnChange,
  onSelect,
  className,
}: Props) {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "mx" },
      types: ["address"],
    },
    defaultValue: externalValue,
    debounce: 300,
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(val: string) {
    setValue(val);
    externalOnChange(val);
    setShowDropdown(true);
  }

  async function handleSelect(description: string) {
    setValue(description, false);
    externalOnChange(description);
    clearSuggestions();
    setShowDropdown(false);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      const parsed = parseAddressComponents(results[0].address_components);

      onSelect({
        address: description,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip,
        lat,
        lng,
      });
    } catch {
      onSelect({
        address: description,
        city: "",
        state: "",
        zip: "",
      });
    }
  }

  const hasSuggestions = status === "OK" && data.length > 0 && showDropdown;

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInput(e.target.value)}
        disabled={!ready}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {hasSuggestions && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-base-100 border border-base-content/10 shadow-lg max-h-60 overflow-y-auto">
          {data.map(({ place_id, description, structured_formatting }) => (
            <li key={place_id}>
              <button
                type="button"
                onClick={() => handleSelect(description)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-base-200 transition-colors flex flex-col gap-0.5"
              >
                <span className="font-medium">
                  {structured_formatting.main_text}
                </span>
                <span className="text-xs text-base-content/50">
                  {structured_formatting.secondary_text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
