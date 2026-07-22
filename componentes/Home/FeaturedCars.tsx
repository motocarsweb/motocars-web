"use client";

import { useMemo, useState } from "react";
import VehicleCard from "../VehicleCard/VehicleCard";
import VehicleFilters from "../VehicleFilters/VehicleFilters";

type Vehicle = {
  id: number;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number | null;
  precio: number | null;
  kilometros: number | null;
  combustible: string | null;
  transmision: string | null;
  color: string | null;
  tipo: string | null;
  estado: string | null;
  destacado: boolean | null;
  descripcion: string | null;
  imagen_principal: string | null;
};

type Props = {
  vehicles: Vehicle[];
};

export default function FeaturedCars({ vehicles }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        vehicles
          .map((vehicle) => vehicle.marca)
          .filter((marca) => marca.trim() !== "")
      )
    ).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const marca = vehicle.marca.toLowerCase();
      const modelo = vehicle.modelo.toLowerCase();
      const version = vehicle.version?.toLowerCase() ?? "";

      const matchesSearch =
        search === "" ||
        marca.includes(search) ||
        modelo.includes(search) ||
        version.includes(search);

      const matchesBrand =
        selectedBrand === "" || vehicle.marca === selectedBrand;

      return matchesSearch && matchesBrand;
    });
  }, [vehicles, searchTerm, selectedBrand]);

  return (
    <section className="featured-cars">
      <VehicleFilters
        searchTerm={searchTerm}
        selectedBrand={selectedBrand}
        brands={brands}
        onSearchTermChange={setSearchTerm}
        onBrandChange={setSelectedBrand}
      />

      <div className="vehicles-grid">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
          />
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <p className="vehicles-empty">
          No encontramos vehículos con esos criterios.
        </p>
      )}
    </section>
  );
}