import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { createShipment } from '../store/slices/shipmentSlice';
import { RootState, AppDispatch } from '../store/store';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

const addressSchema = z.object({
  street: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  zipCode: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
});

const schema = z.object({
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  packageDetails: z.object({
    weight: z.coerce.number().min(0.1, 'Must be at least 0.1 kg'),
    dimensions: z.string().min(1, 'Required'),
    description: z.string().min(1, 'Required'),
    category: z.enum(['electronics', 'clothing', 'food', 'furniture', 'documents', 'fragile', 'other']),
  }),
  estimatedDelivery: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CreateShipment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.shipments);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickupAddress: { country: 'US' },
      deliveryAddress: { country: 'US' },
      packageDetails: { category: 'other' },
    },
  });

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(createShipment(data));
    if (createShipment.fulfilled.match(result)) {
      toast.success('Shipment created successfully!');
      navigate('/shipments');
    } else {
      toast.error((result.payload as string) || 'Failed to create shipment');
    }
  };

  const inputClass = "input";
  const errorClass = "text-red-500 text-xs mt-1";

  const AddressFields = ({ prefix, title }: { prefix: 'pickupAddress' | 'deliveryAddress'; title: string }) => (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Street Address</label>
          <input {...register(`${prefix}.street`)} className={inputClass} placeholder="123 Main St" />
          {errors[prefix]?.street && <p className={errorClass}>{errors[prefix]?.street?.message}</p>}
        </div>
        <div>
          <label className="label">City</label>
          <input {...register(`${prefix}.city`)} className={inputClass} placeholder="New York" />
          {errors[prefix]?.city && <p className={errorClass}>{errors[prefix]?.city?.message}</p>}
        </div>
        <div>
          <label className="label">State</label>
          <input {...register(`${prefix}.state`)} className={inputClass} placeholder="NY" />
          {errors[prefix]?.state && <p className={errorClass}>{errors[prefix]?.state?.message}</p>}
        </div>
        <div>
          <label className="label">Zip Code</label>
          <input {...register(`${prefix}.zipCode`)} className={inputClass} placeholder="10001" />
          {errors[prefix]?.zipCode && <p className={errorClass}>{errors[prefix]?.zipCode?.message}</p>}
        </div>
        <div>
          <label className="label">Country</label>
          <input {...register(`${prefix}.country`)} className={inputClass} placeholder="US" />
          {errors[prefix]?.country && <p className={errorClass}>{errors[prefix]?.country?.message}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Create New Shipment</h1>
        <p className="page-subtitle">Fill in the details to create a new shipment</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AddressFields prefix="pickupAddress" title="📦 Pickup Address" />
        <AddressFields prefix="deliveryAddress" title="📍 Delivery Address" />

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">📋 Package Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Weight (kg)</label>
              <input {...register('packageDetails.weight')} type="number" step="0.1" className={inputClass} placeholder="2.5" />
              {errors.packageDetails?.weight && <p className={errorClass}>{errors.packageDetails.weight.message}</p>}
            </div>
            <div>
              <label className="label">Dimensions</label>
              <input {...register('packageDetails.dimensions')} className={inputClass} placeholder="30x20x15cm" />
              {errors.packageDetails?.dimensions && <p className={errorClass}>{errors.packageDetails.dimensions.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input {...register('packageDetails.description')} className={inputClass} placeholder="Laptop Computer" />
              {errors.packageDetails?.description && <p className={errorClass}>{errors.packageDetails.description.message}</p>}
            </div>
            <div>
              <label className="label">Category</label>
              <select {...register('packageDetails.category')} className={inputClass}>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
                <option value="furniture">Furniture</option>
                <option value="documents">Documents</option>
                <option value="fragile">Fragile</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Estimated Delivery</label>
              <input {...register('estimatedDelivery')} type="date" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Create Shipment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;
