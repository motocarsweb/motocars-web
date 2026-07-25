"use client";

import { useMemo, useState } from "react";
import VehicleCard from "../VehicleCard/VehicleCard";
import VehicleFilters from "../VehicleFilters/VehicleFilters";
import type { VehiculoSupabase } from "@/lib/supabase-vehicles";

type Props = {
  vehicles: VehiculoSupabase[];
};

export default function FeaturedCars({ vehicles }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        vehicles
          .map((vehicle) => vehicle.marca?.trim() ?? "")
          .filter((marca) => marca !== "")
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const marcaOriginal = vehicle.marca?.trim() ?? "";
      const marca = marcaOriginal.toLowerCase();
      const modelo = vehicle.modelo?.trim().toLowerCase() ?? "";
      const version = vehicle.version?.trim().toLowerCase() ?? "";

      const matchesSearch =
        search === "" ||
        marca.includes(search) ||
        modelo.includes(search) ||
        version.includes(search);

      const matchesBrand =
        selectedBrand === "" || marcaOriginal === selectedBrand;

      return matchesSearch && matchesBrand;
    });
  }, [vehicles, searchTerm, selectedBrand]);

  return (
    <section
      id="vehiculos"
      className="featured-cars"
      style={{ marginTop: "-100px" }}
    >
      <div className="container">
        <VehicleFilters
          searchTerm={searchTerm}
          selectedBrand={selectedBrand}
          brands={brands}
          onSearchTermChange={setSearchTerm}
          onBrandChange={setSelectedBrand}
        />

        <div className="vehicles-grid">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <p className="vehicles-empty">
            No encontramos vehículos con esos criterios.
          </p>
        )}
      </div>
    </section>
  );
}