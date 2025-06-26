import { useState, useEffect } from 'react';
import { getFeatureLimits, getRemainingUsage, FeatureLimits } from '../services/featureLimitsService';
import { useAuth } from '../context/AuthContext';

interface UseLimitsResult {
    limits: FeatureLimits | null;
    loading: boolean;
    error: Error | null;
    getRemainingFor: (feature: keyof FeatureLimits) => Promise<number>;
    refreshLimits: () => Promise<void>;
}

export const useFeatureLimits = (): UseLimitsResult => {
    const [limits, setLimits] = useState<FeatureLimits | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    const fetchLimits = async () => {
        try {
            setLoading(true);
            const fetchedLimits = await getFeatureLimits();
            setLimits(fetchedLimits);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    // Get remaining usage for a specific feature
    const getRemainingFor = async (feature: keyof FeatureLimits): Promise<number> => {
        // If user is authenticated, they have unlimited access
        if (user) return Infinity;

        try {
            return await getRemainingUsage(feature);
        } catch (err) {
            console.error('Error fetching remaining usage:', err);
            return 0;
        }
    };

    useEffect(() => {
        fetchLimits();
    }, [user]); // Refetch when user auth state changes

    return {
        limits,
        loading,
        error,
        getRemainingFor,
        refreshLimits: fetchLimits
    };
};
