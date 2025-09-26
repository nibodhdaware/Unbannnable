"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface BillingAddress {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
}

interface BillingAddressFormProps {
    onSubmit: (
        billing: BillingAddress,
        customer: { name: string; email: string },
    ) => void;
    loading?: boolean;
    onCancel: () => void;
}

const COUNTRIES = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "ES", name: "Spain" },
    { code: "IT", name: "Italy" },
    { code: "NL", name: "Netherlands" },
    { code: "SE", name: "Sweden" },
    { code: "NO", name: "Norway" },
    { code: "DK", name: "Denmark" },
    { code: "FI", name: "Finland" },
    { code: "JP", name: "Japan" },
    { code: "SG", name: "Singapore" },
    { code: "NZ", name: "New Zealand" },
    { code: "MX", name: "Mexico" },
    { code: "BR", name: "Brazil" },
    { code: "IN", name: "India" },
    { code: "PL", name: "Poland" },
    { code: "CZ", name: "Czech Republic" },
    { code: "AT", name: "Austria" },
    { code: "CH", name: "Switzerland" },
    { code: "BE", name: "Belgium" },
    { code: "IE", name: "Ireland" },
    // Add more countries as needed
];

export default function BillingAddressForm({
    onSubmit,
    loading = false,
    onCancel,
}: BillingAddressFormProps) {
    const { user } = useUser();

    const [billing, setBilling] = useState<BillingAddress>({
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "US", // Default to US
    });

    const [customer, setCustomer] = useState({
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
    });

    const [errors, setErrors] = useState<
        Partial<BillingAddress & { name: string; email: string }>
    >({});

    const validateForm = () => {
        const newErrors: Partial<
            BillingAddress & { name: string; email: string }
        > = {};

        if (!customer.name.trim()) newErrors.name = "Name is required";
        if (!customer.email.trim()) newErrors.email = "Email is required";
        if (!billing.street.trim())
            newErrors.street = "Street address is required";
        if (!billing.city.trim()) newErrors.city = "City is required";
        if (!billing.state.trim())
            newErrors.state = "State/Province is required";
        if (!billing.zipcode.trim())
            newErrors.zipcode = "ZIP/Postal code is required";
        if (!billing.country) newErrors.country = "Country is required";

        // Email validation
        if (customer.email && !/\S+@\S+\.\S+/.test(customer.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Billing form submitted with data:", { customer, billing });
        onSubmit(billing, customer);
    };
    const handleInputChange = (field: keyof BillingAddress, value: string) => {
        setBilling((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleCustomerChange = (
        field: keyof typeof customer,
        value: string,
    ) => {
        setCustomer((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Billing Information
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            disabled={loading}
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Customer Information */}
                        <div className="space-y-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                Contact Information
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={customer.name}
                                    onChange={(e) =>
                                        handleCustomerChange(
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:text-white ${
                                        errors.name
                                            ? "border-red-500"
                                            : "border-neutral-300 dark:border-neutral-600"
                                    }`}
                                    disabled={loading}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={customer.email}
                                    onChange={(e) =>
                                        handleCustomerChange(
                                            "email",
                                            e.target.value,
                                        )
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:text-white ${
                                        errors.email
                                            ? "border-red-500"
                                            : "border-neutral-300 dark:border-neutral-600"
                                    }`}
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                Billing Address
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Street Address *
                                </label>
                                <input
                                    type="text"
                                    value={billing.street}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "street",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="123 Main Street, Apt 4B"
                                    className={`w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:text-white ${
                                        errors.street
                                            ? "border-red-500"
                                            : "border-neutral-300 dark:border-neutral-600"
                                    }`}
                                    disabled={loading}
                                />
                                {errors.street && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.street}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={billing.city}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "city",
                                                e.target.value,
                                            )
                                        }
                                        className={`w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:text-white ${
                                            errors.city
                                                ? "border-red-500"
                                                : "border-neutral-300 dark:border-neutral-600"
                                        }`}
                                        disabled={loading}
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.city}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        State/Province *
                                    </label>
                                    <input
                                        type="text"
                                        value={billing.state}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "state",
                                                e.target.value,
                                            )
                                        }
                                        className={`w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:text-white ${
                                            errors.state
                                                ? "border-red-500"
                                                : "border-neutral-300 dark:border-neutral-600"
                                        }`}
                                        disabled={loading}
                                    />
                                    {errors.state && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.state}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        ZIP/Postal Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={billing.zipcode}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "zipcode",
                                                e.target.value,
                                            )
                                        }
                                        className={`w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:text-white ${
                                            errors.zipcode
                                                ? "border-red-500"
                                                : "border-neutral-300 dark:border-neutral-600"
                                        }`}
                                        disabled={loading}
                                    />
                                    {errors.zipcode && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.zipcode}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Country *
                                    </label>
                                    <select
                                        value={billing.country}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "country",
                                                e.target.value,
                                            )
                                        }
                                        className={`w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:text-white ${
                                            errors.country
                                                ? "border-red-500"
                                                : "border-neutral-300 dark:border-neutral-600"
                                        }`}
                                        disabled={loading}
                                    >
                                        {COUNTRIES.map((country) => (
                                            <option
                                                key={country.code}
                                                value={country.code}
                                            >
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.country && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.country}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03d00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    "Continue to Payment"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
