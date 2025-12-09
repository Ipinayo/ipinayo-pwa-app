"use client";

import { City, Country, State } from "country-state-city";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  transformObjectToOptions,
  transformStringsToOptions,
} from "@/lib/utils";

import AppSelect from "../app-select";
import { NewLocation } from "@/types/models";
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";

interface LocationSelectorProps {
  fieldName?: string; // The name of the location field in the form
}

const countries = Country.getAllCountries();

export default function LocationSelector({
  fieldName = "parishLocation",
}: LocationSelectorProps) {
  const form = useFormContext<any>(); // Can be any form that has a location field

  // Watch location fields
  const location = form.watch(fieldName) as NewLocation | null | undefined;
  const selectedCountryCode = location?.countryCode;
  const selectedStateCode = location?.stateCode;

  // Get data based on selections
  const states = useMemo(
    () =>
      selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [],
    [selectedCountryCode]
  );

  const cities = useMemo(
    () =>
      selectedCountryCode && selectedStateCode
        ? City.getCitiesOfState(selectedCountryCode, selectedStateCode)
        : [],
    [selectedCountryCode, selectedStateCode]
  );

  // Helper to update location with full data
  const updateLocation = (updates: Partial<NewLocation>) => {
    const currentLocation = form.getValues(fieldName) as NewLocation | null;
    form.setValue(fieldName, {
      ...currentLocation,
      ...updates,
    });
  };

  return (
    <div className="space-y-4">
      {/* Country Field - Always Visible */}
      <FormField
        control={form.control}
        name={`${fieldName}.countryCode`}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <AppSelect
                value={field.value || undefined}
                onValueChange={(value) => {
                  const countryData = countries.find(
                    (c) => c.isoCode === value
                  );
                  if (countryData) {
                    updateLocation({
                      country: countryData.name,
                      countryCode: countryData.isoCode,
                      stateCode: null,
                      state: "",
                      city: "",
                      latitude: Number(countryData.latitude) || null,
                      longitude: Number(countryData.longitude) || null,
                      timezone: countryData.timezones?.[0]?.zoneName || null,
                    });
                  }
                }}
                options={countries.map((country) => ({
                  label: `${country.flag} ${country.name}`,
                  value: country.isoCode,
                }))}
                placeholder="Select country"
                className="capitalize"
                invalid={!!fieldState.error}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* State Field - Only Visible After Country Selected */}
      {selectedCountryCode && (
        <FormField
          control={form.control}
          name={`${fieldName}.stateCode`}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <FormControl>
                <AppSelect
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    const stateData = states.find((s) => s.isoCode === value);
                    if (stateData) {
                      updateLocation({
                        state: stateData.name,
                        stateCode: stateData.isoCode,
                        city: "",
                        latitude: Number(stateData.latitude) || null,
                        longitude: Number(stateData.longitude) || null,
                      });
                    }
                  }}
                  options={transformObjectToOptions(states, "isoCode", "name")}
                  placeholder="Select state or province"
                  className="capitalize"
                  invalid={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* City Field - Only Visible After State Selected */}
      {selectedCountryCode && selectedStateCode && (
        <FormField
          control={form.control}
          name={`${fieldName}.city`}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <AppSelect
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    const cityData = cities.find((c) => c.name === value);
                    if (cityData) {
                      updateLocation({
                        city: cityData.name,
                        latitude: Number(cityData.latitude) || null,
                        longitude: Number(cityData.longitude) || null,
                      });
                    }
                    if (!cityData && value) {
                      updateLocation({
                        city: value,
                        latitude: null,
                        longitude: null,
                      });
                    }
                  }}
                  options={transformStringsToOptions(cities.map((c) => c.name))}
                  placeholder="Select or type city name..."
                  className="capitalize"
                  dropdownClassName="capitalize"
                  inputProps={{ className: "capitalize" }}
                  invalid={!!fieldState.error}
                  creatable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
