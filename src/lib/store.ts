import { create } from "zustand";
import { companyCount } from "@/lib/companies";

type ModalType = "about" | "companies" | "contact" | null;
type CompaniesView = "slider" | "list";

interface ModalState {
  activeModal: ModalType;
  companiesView: CompaniesView;
  selectedCompanyIndex: number;
  isModalOpen: boolean;
  
  // Actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setCompaniesView: (view: CompaniesView) => void;
  setSelectedCompany: (index: number) => void;
  nextCompany: () => void;
  prevCompany: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  companiesView: "slider",
  selectedCompanyIndex: 0,
  isModalOpen: false,
  
  openModal: (modal) => set({ 
    activeModal: modal, 
    isModalOpen: true,
    selectedCompanyIndex: 0 
  }),
  
  closeModal: () => set({ 
    activeModal: null, 
    isModalOpen: false 
  }),
  
  setCompaniesView: (view) => set({ companiesView: view }),
  
  setSelectedCompany: (index) => set({ selectedCompanyIndex: index }),
  
  nextCompany: () => set((state) => ({ 
    selectedCompanyIndex: (state.selectedCompanyIndex + 1) % companyCount 
  })),
  
  prevCompany: () => set((state) => ({ 
    selectedCompanyIndex: (state.selectedCompanyIndex - 1 + companyCount) % companyCount 
  })),
}));

interface BookingState {
  // Current booking step
  currentStep: number;
  
  // Selected options
  selectedVehicle: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  serviceType: "hourly" | "point_to_point" | null;
  serviceArea: string | null;
  
  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setVehicle: (vehicle: string | null) => void;
  setDate: (date: string | null) => void;
  setTime: (time: string | null) => void;
  setServiceType: (type: "hourly" | "point_to_point" | null) => void;
  setServiceArea: (area: string | null) => void;
  setCustomerInfo: (info: Partial<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialRequests: string;
  }>) => void;
  resetBooking: () => void;
}

const initialBookingState = {
  currentStep: 1,
  selectedVehicle: null,
  selectedDate: null,
  selectedTime: null,
  serviceType: null,
  serviceArea: null,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  specialRequests: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialBookingState,
  
  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, 4) 
  })),
  
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 1) 
  })),
  
  setVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  
  setDate: (date) => set({ selectedDate: date }),
  
  setTime: (time) => set({ selectedTime: time }),
  
  setServiceType: (type) => set({ serviceType: type }),
  
  setServiceArea: (area) => set({ serviceArea: area }),
  
  setCustomerInfo: (info) => set((state) => ({ 
    ...state,
    ...info,
  })),
  
  resetBooking: () => set(initialBookingState),
}));
