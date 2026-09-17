import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IShipment, ShipmentStatus, CreateShipmentFormData, IShipmentEvent, PaginationMeta } from '../../types';
import { shipmentApi } from '../../services/shipmentApi';

interface ShipmentState {
  shipments: IShipment[];
  currentShipment: IShipment | null;
  trackingShipment: IShipment | null;
  trackingEvents: IShipmentEvent[];
  validNextStatuses: ShipmentStatus[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShipmentState = {
  shipments: [],
  currentShipment: null,
  trackingShipment: null,
  trackingEvents: [],
  validNextStatuses: [],
  meta: null,
  isLoading: false,
  error: null,
};

export const fetchShipments = createAsyncThunk(
  'shipments/fetchAll',
  async (params: Record<string, string | number> | undefined, { rejectWithValue }) => {
    try {
      const response = await shipmentApi.getAll(params);
      return { shipments: response.data.data.shipments, meta: response.data.meta };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch shipments');
    }
  }
);

export const fetchShipmentById = createAsyncThunk(
  'shipments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await shipmentApi.getById(id);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch shipment');
    }
  }
);

export const createShipment = createAsyncThunk(
  'shipments/create',
  async (data: CreateShipmentFormData, { rejectWithValue }) => {
    try {
      const response = await shipmentApi.create(data);
      return response.data.data.shipment;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create shipment');
    }
  }
);

export const trackShipment = createAsyncThunk(
  'shipments/track',
  async (trackingNumber: string, { rejectWithValue }) => {
    try {
      const response = await shipmentApi.track(trackingNumber);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Shipment not found');
    }
  }
);

export const updateShipmentStatus = createAsyncThunk(
  'shipments/updateStatus',
  async ({ id, status }: { id: string; status: ShipmentStatus }, { rejectWithValue }) => {
    try {
      const response = await shipmentApi.updateStatus(id, status);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

export const cancelShipmentAction = createAsyncThunk(
  'shipments/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await shipmentApi.cancel(id);
      return response.data.data.shipment;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel shipment');
    }
  }
);

const shipmentSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    clearCurrentShipment: (state) => {
      state.currentShipment = null;
      state.validNextStatuses = [];
    },
    clearTrackingData: (state) => {
      state.trackingShipment = null;
      state.trackingEvents = [];
    },
    updateShipmentRealtime: (state, action) => {
      const { shipmentId, status } = action.payload;
      // Update in list
      const index = state.shipments.findIndex((s) => s._id === shipmentId);
      if (index >= 0) {
        state.shipments[index].status = status;
      }
      // Update current if viewing
      if (state.currentShipment && state.currentShipment._id === shipmentId) {
        state.currentShipment.status = status;
      }
      // Update tracking
      if (state.trackingShipment && state.trackingShipment._id === shipmentId) {
        state.trackingShipment.status = status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder.addCase(fetchShipments.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(fetchShipments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.shipments = action.payload.shipments;
      state.meta = action.payload.meta || null;
    });
    builder.addCase(fetchShipments.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // Fetch by ID
    builder.addCase(fetchShipmentById.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchShipmentById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentShipment = action.payload.shipment;
      state.validNextStatuses = action.payload.validNextStatuses;
    });
    builder.addCase(fetchShipmentById.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // Create
    builder.addCase(createShipment.pending, (state) => { state.isLoading = true; });
    builder.addCase(createShipment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.shipments.unshift(action.payload);
    });
    builder.addCase(createShipment.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // Track
    builder.addCase(trackShipment.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(trackShipment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.trackingShipment = action.payload.shipment;
      state.trackingEvents = action.payload.events;
    });
    builder.addCase(trackShipment.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // Update Status
    builder.addCase(updateShipmentStatus.fulfilled, (state, action) => {
      state.currentShipment = action.payload.shipment;
      state.validNextStatuses = action.payload.validNextStatuses;
      const index = state.shipments.findIndex((s) => s._id === action.payload.shipment._id);
      if (index >= 0) state.shipments[index] = action.payload.shipment;
    });

    // Cancel
    builder.addCase(cancelShipmentAction.fulfilled, (state, action) => {
      const index = state.shipments.findIndex((s) => s._id === action.payload._id);
      if (index >= 0) state.shipments[index] = action.payload;
      if (state.currentShipment?._id === action.payload._id) {
        state.currentShipment = action.payload;
      }
    });
  },
});

export const { clearCurrentShipment, clearTrackingData, updateShipmentRealtime, clearError } = shipmentSlice.actions;
export default shipmentSlice.reducer;
