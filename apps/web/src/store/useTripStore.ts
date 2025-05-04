import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  image?: string;
  description?: string;
  isCompleted: boolean;
}

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      currentTrip: null,
      addTrip: (trip) =>
        set((state) => ({
          trips: [
            ...state.trips,
            {
              ...trip,
              id: crypto.randomUUID(),
              isCompleted: false,
            },
          ],
        })),
      updateTrip: (id, updatedTrip) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === id ? { ...trip, ...updatedTrip } : trip
          ),
        })),
      deleteTrip: (id) =>
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== id),
        })),
      setCurrentTrip: (trip) => set({ currentTrip: trip }),
    }),
    {
      name: 'trip-storage',
    }
  )
);
