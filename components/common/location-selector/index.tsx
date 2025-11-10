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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, transformStringsToOptions } from "@/lib/utils";

import AppSelect from "../app-select";
import { NewLocation } from "@/types/models";
import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";

interface LocationSelectorProps {
  form: UseFormReturn<any>; // Can be any form that has a location field
  fieldName?: string; // The name of the location field in the form (default: "location")
}

export default function LocationSelector({
  form,
  fieldName = "parishLocation",
}: LocationSelectorProps) {
  // Watch location fields
  const location = form.watch(fieldName) as NewLocation | null | undefined;
  const selectedCountryCode = location?.countryCode;
  const selectedStateCode = location?.stateCode;

  // Get data based on selections
  const countries = Country.getAllCountries();
  const states = selectedCountryCode
    ? State.getStatesOfCountry(selectedCountryCode)
    : [];
  const cities =
    selectedCountryCode && selectedStateCode
      ? City.getCitiesOfState(selectedCountryCode, selectedStateCode)
      : [];

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (selectedCountryCode && location) {
      form.setValue(`${fieldName}.stateCode`, null);
      form.setValue(`${fieldName}.state`, "");
      form.setValue(`${fieldName}.city`, "");
      form.setValue(`${fieldName}.latitude`, null);
      form.setValue(`${fieldName}.longitude`, null);
    }
  }, [selectedCountryCode, fieldName, form]);

  useEffect(() => {
    if (selectedStateCode && location) {
      form.setValue(`${fieldName}.city`, "");
      form.setValue(`${fieldName}.latitude`, null);
      form.setValue(`${fieldName}.longitude`, null);
    }
  }, [selectedStateCode, fieldName, form]);

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
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <Select
              onValueChange={(value) => {
                const countryData = countries.find((c) => c.isoCode === value);
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
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* State Field - Only Visible After Country Selected */}
      {selectedCountryCode && (
        <FormField
          control={form.control}
          name={`${fieldName}.stateCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <Select
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
                value={field.value || undefined}
                disabled={states.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state or province" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {states.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No states available
                    </SelectItem>
                  ) : (
                    states.map((state) => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
                  className={cn(
                    "capitalize",
                    fieldState.invalid
                      ? "ring-destructive/20 dark:ring-destructive/40 border-destructive"
                      : ""
                  )}
                  dropdownClassName="capitalize"
                  inputProps={{ className: "capitalize" }}
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
