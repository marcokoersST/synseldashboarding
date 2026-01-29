import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Conversion ratios
const INTERVIEWS_TO_PLACEMENTS_RATIO = 4; // 4 interviews = 1 placement
const REVENUE_PER_PLACEMENT = 10000; // €10,000 per placement

type GoalField = 'revenue' | 'placements' | 'interviews';

interface ForecastGoalsContextType {
  // Manual goals (null = not set by user)
  revenueGoal: number | null;
  placementsGoal: number | null;
  interviewsGoal: number | null;
  
  // Calculated/final values
  calculatedValues: {
    revenue: number;
    placements: number;
    interviews: number;
  };
  
  // Which field was last edited (determines which are calculated)
  lastEditedField: GoalField | null;
  
  // Check if goals are set
  hasGoals: boolean;
  
  // Set a goal (triggers triage calculation)
  setGoal: (field: GoalField, value: number | null) => void;
  
  // Clear all goals
  clearGoals: () => void;
}

const ForecastGoalsContext = createContext<ForecastGoalsContextType | undefined>(undefined);

const STORAGE_KEY = 'forecast-goals';

interface StoredGoals {
  revenueGoal: number | null;
  placementsGoal: number | null;
  interviewsGoal: number | null;
  lastEditedField: GoalField | null;
}

export function ForecastGoalsProvider({ children }: { children: ReactNode }) {
  const [revenueGoal, setRevenueGoal] = useState<number | null>(null);
  const [placementsGoal, setPlacementsGoal] = useState<number | null>(null);
  const [interviewsGoal, setInterviewsGoal] = useState<number | null>(null);
  const [lastEditedField, setLastEditedField] = useState<GoalField | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredGoals = JSON.parse(stored);
        setRevenueGoal(parsed.revenueGoal);
        setPlacementsGoal(parsed.placementsGoal);
        setInterviewsGoal(parsed.interviewsGoal);
        setLastEditedField(parsed.lastEditedField);
      }
    } catch (e) {
      console.error('Failed to load forecast goals:', e);
    }
  }, []);

  // Save to localStorage when goals change
  useEffect(() => {
    const data: StoredGoals = {
      revenueGoal,
      placementsGoal,
      interviewsGoal,
      lastEditedField,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [revenueGoal, placementsGoal, interviewsGoal, lastEditedField]);

  // Triage calculation logic
  const calculateValues = useCallback(() => {
    // If no field was edited, return zeros
    if (!lastEditedField) {
      return { revenue: 0, placements: 0, interviews: 0 };
    }

    let revenue = 0;
    let placements = 0;
    let interviews = 0;

    switch (lastEditedField) {
      case 'interviews':
        interviews = interviewsGoal ?? 0;
        placements = interviews / INTERVIEWS_TO_PLACEMENTS_RATIO;
        revenue = placements * REVENUE_PER_PLACEMENT;
        break;
      case 'placements':
        placements = placementsGoal ?? 0;
        interviews = placements * INTERVIEWS_TO_PLACEMENTS_RATIO;
        revenue = placements * REVENUE_PER_PLACEMENT;
        break;
      case 'revenue':
        revenue = revenueGoal ?? 0;
        placements = revenue / REVENUE_PER_PLACEMENT;
        interviews = placements * INTERVIEWS_TO_PLACEMENTS_RATIO;
        break;
    }

    return {
      revenue: Math.round(revenue),
      placements: Math.round(placements * 10) / 10, // 1 decimal
      interviews: Math.round(interviews),
    };
  }, [lastEditedField, revenueGoal, placementsGoal, interviewsGoal]);

  const setGoal = useCallback((field: GoalField, value: number | null) => {
    setLastEditedField(field);
    
    switch (field) {
      case 'revenue':
        setRevenueGoal(value);
        break;
      case 'placements':
        setPlacementsGoal(value);
        break;
      case 'interviews':
        setInterviewsGoal(value);
        break;
    }
  }, []);

  const clearGoals = useCallback(() => {
    setRevenueGoal(null);
    setPlacementsGoal(null);
    setInterviewsGoal(null);
    setLastEditedField(null);
  }, []);

  const calculatedValues = calculateValues();
  const hasGoals = lastEditedField !== null;

  return (
    <ForecastGoalsContext.Provider
      value={{
        revenueGoal,
        placementsGoal,
        interviewsGoal,
        calculatedValues,
        lastEditedField,
        hasGoals,
        setGoal,
        clearGoals,
      }}
    >
      {children}
    </ForecastGoalsContext.Provider>
  );
}

export function useForecastGoals() {
  const context = useContext(ForecastGoalsContext);
  if (context === undefined) {
    throw new Error('useForecastGoals must be used within a ForecastGoalsProvider');
  }
  return context;
}
