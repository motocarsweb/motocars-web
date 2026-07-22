"use client";

import { Search } from "lucide-react";

type VehicleFiltersProps = {
  searchTerm: string;
  selectedBrand: string;
  brands: string[];
  onSearchTermChange: (value: string) => void;
  onBrandChange: (brand: string) => void;
};

export default function VehicleFilters({
  searchTerm,
  selectedBrand,
  brands,
  onSearchTermChange,
  onBrandChange,
}: VehicleFiltersProps) {
  return (
    <section className="vehicle-filters">
      <div className="vehicle-filters-heading">
        <h3>Encontrá tu próximo vehículo</h3>

        <p>
          Buscá por marca, modelo o versión entre todos nuestros vehículos.
        </p>
      </div>

      <div className="vehicle-search-wrapper">
        <Search
          className="vehicle-search-icon"
          size={21}
          aria-hidden="true"
        />

        <input
          id="vehicle-search"
          type="search"
          placeholder="Buscar Jeep, Toyota, Hilux..."
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          aria-label="Buscar vehículo"
        />

        {searchTerm && (
          <button
            type="button"
            className="vehicle-search-clear"
            onClick={() => onSearchTermChange("")}
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="vehicle-brands">
        {brands.map((brand) => (
          <button
            key={brand}
            type="button"
            className={selectedBrand === brand ? "active" : ""}
            onClick={() => onBrandChange(brand)}
          >
            {brand}
          </button>
        ))}

        <button
          type="button"
          className={selectedBrand === "" ? "active" : ""}
          onClick={() => onBrandChange("")}
        >
          Ver todas
        </button>
      </div>
    </section>
  );
}