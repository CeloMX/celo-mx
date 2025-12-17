'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MEXICAN_CITIES } from '@/config/mexican-cities';

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  phone: string;
}

interface ShippingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShippingFormData) => void;
  itemName: string;
}

export default function ShippingForm({ isOpen, onClose, onSubmit, itemName }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son requeridos';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'El código postal debe tener 5 dígitos';
    }
    if (!formData.city) {
      newErrors.city = 'El estado es requerido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un teléfono válido (10-15 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    onSubmit(formData);
    setIsSubmitting(false);
  };

  const handleChange = (field: keyof ShippingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className="
          relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto
          bg-celo-bg
          border border-celo-border rounded-2xl
          shadow-2xl
          animate-in fade-in-0 zoom-in-95
          duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-celo-bg border-b border-celo-border p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-celo-fg">Información de Envío</h2>
            <p className="text-sm text-celo-muted mt-1">Solo envíos a México</p>
          </div>
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              hover:bg-celo-border/50
              transition-colors
              text-celo-fg
              focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:ring-offset-2
            "
            aria-label="Cerrar formulario"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Info */}
          <div className="bg-celo-yellow/10 border border-celo-border rounded-xl p-4">
            <p className="text-sm text-celo-muted mb-1">Producto</p>
            <p className="text-celo-fg font-semibold">{itemName}</p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-celo-fg mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`
                  w-full px-4 py-2
                  bg-celo-bg border rounded-xl
                  text-celo-fg
                  focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
                  ${errors.firstName ? 'border-red-500' : 'border-celo-border'}
                `}
                placeholder="Tu nombre"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-celo-fg mb-2">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`
                  w-full px-4 py-2
                  bg-celo-bg border rounded-xl
                  text-celo-fg
                  focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
                  ${errors.lastName ? 'border-red-500' : 'border-celo-border'}
                `}
                placeholder="Tus apellidos"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-celo-fg mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`
                w-full px-4 py-2
                bg-celo-bg border rounded-xl
                text-celo-fg
                focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
                ${errors.email ? 'border-red-500' : 'border-celo-border'}
              `}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-celo-fg mb-2">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`
                w-full px-4 py-2
                bg-celo-bg border rounded-xl
                text-celo-fg
                focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
                ${errors.address ? 'border-red-500' : 'border-celo-border'}
              `}
              placeholder="Calle, número, colonia"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* Address Line 2 (Optional) */}
          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-celo-fg mb-2">
              Casa, apartamento, etc. <span className="text-celo-muted text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              className="
                w-full px-4 py-2
                bg-celo-bg border border-celo-border rounded-xl
                text-celo-fg
                focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
              "
              placeholder="Número de casa, apartamento, referencias"
            />
          </div>

          {/* Postal Code and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-celo-fg mb-2">
                Código postal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  handleChange('postalCode', value);
                }}
                className={`
                  w-full px-4 py-2
                  bg-celo-bg border rounded-xl
                  text-celo-fg
                  focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
                  ${errors.postalCode ? 'border-red-500' : 'border-celo-border'}
                `}
                placeholder="12345"
                maxLength={5}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-celo-fg mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`
                  w-full px-4 py-2
                  bg-celo-bg border rounded-xl
                  text-celo-fg
                  focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
                  ${errors.city ? 'border-red-500' : 'border-celo-border'}
                `}
              >
                <option value="">Selecciona un estado</option>
                {MEXICAN_CITIES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-celo-fg mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d\s\-+()]/g, '');
                handleChange('phone', value);
              }}
              className={`
                w-full px-4 py-2
                bg-celo-bg border rounded-xl
                text-celo-fg
                focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:border-celo-yellow
                ${errors.phone ? 'border-red-500' : 'border-celo-border'}
              `}
              placeholder="55 1234 5678"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-celo-border">
            <button
              type="button"
              onClick={onClose}
              className="
                px-6 py-2
                bg-transparent border border-celo-border
                text-celo-fg font-semibold rounded-xl
                hover:bg-celo-border/50
                transition
                focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:ring-offset-2
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                px-6 py-2
                bg-celoLegacy-yellow text-black
                font-semibold rounded-xl
                hover:opacity-90
                transition
                border border-celo-border/40
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-celo-yellow focus:ring-offset-2
              "
            >
              {isSubmitting ? 'Procesando...' : 'Continuar con la compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

