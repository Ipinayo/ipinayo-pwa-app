import { useCallback, useEffect, useRef, useState } from 'react';

import { DraftMassSelection } from '@/types/schemas/mass-selections';
import { UseFormReturn } from 'react-hook-form';
import { normalizeDate } from '@/lib/utils';
import { updateDraft } from '@/lib/actions/draft';

interface UseDraftAutosaveOptions {
    draftId: string;
    form: UseFormReturn<DraftMassSelection>;
    autoSaveInterval?: number; // in milliseconds
    enableAutoSave?: boolean;
    onSaveSuccess?: (isAutoSave: boolean) => void;
    onSaveError?: (error: string, isAutoSave: boolean) => void;
}

interface UseDraftAutosaveReturn {
    saveStatus: 'idle' | 'saving' | 'success' | 'error';
    lastSaveTime: Date | null;
    hasUnsavedChanges: boolean;
    save: () => Promise<void>;
    isSaving: boolean;
}

export function useDraftAutosave({
    draftId,
    form,
    autoSaveInterval = 2000, // 2 seconds default
    enableAutoSave = true,
    onSaveSuccess,
    onSaveError,
}: UseDraftAutosaveOptions): UseDraftAutosaveReturn {

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSavingRef = useRef(false);
    const previousValuesRef = useRef<string>('');

    // Core save function
    const performSave = useCallback(
        async (isAutoSave = false): Promise<void> => {

            if (!enableAutoSave) return;

            // Prevent concurrent saves
            if (isSavingRef.current) return;

            // Don't autosave if there are form errors
            if (isAutoSave && !form.formState.isValid) {
                return;
            }

            const formData = form.getValues();
            formData.date = normalizeDate(formData.date);
            formData.parts = formData.parts.map((part, idx) => ({
                ...part,
                order: idx,
            }));

            try {
                isSavingRef.current = true;
                setSaveStatus('saving');

                await updateDraft(draftId, formData);

                setSaveStatus('success');
                setHasUnsavedChanges(false);
                setLastSaveTime(new Date());
                previousValuesRef.current = JSON.stringify(formData);

                onSaveSuccess?.(isAutoSave);

                // Reset to idle after 2 seconds
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 2000);
            } catch (error) {
                setSaveStatus('error');
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                onSaveError?.(errorMessage, isAutoSave);

                // Reset to idle after 2 seconds
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 2000);
            } finally {
                isSavingRef.current = false;
            }
        },
        [form, draftId, enableAutoSave, onSaveSuccess, onSaveError]
    );

    // Manual save function
    const save = useCallback(async (): Promise<void> => {
        return performSave(false);
    }, [performSave]);

    // Watch for form changes
    useEffect(() => {
        const subscription = form.watch((values) => {
            const currentValues = JSON.stringify(values);

            if (currentValues !== previousValuesRef.current) {
                setHasUnsavedChanges(true);

                // Clear existing timeout and set new one for autosave
                if (enableAutoSave) {
                    if (autoSaveTimeoutRef.current) {
                        clearTimeout(autoSaveTimeoutRef.current);
                    }

                    autoSaveTimeoutRef.current = setTimeout(() => {
                        // AutoSave
                        if (isSavingRef.current || saveStatus !== 'idle') return;
                        performSave(true);
                    }, autoSaveInterval);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form, autoSaveInterval, enableAutoSave, performSave, saveStatus]);

    // Keyboard shortcut for manual save (Ctrl+S / Cmd+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                save();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [save]);

    // Save before page unload if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
            }
        };

        if (enableAutoSave) {
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [hasUnsavedChanges, form, draftId, enableAutoSave]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    return {
        saveStatus,
        lastSaveTime,
        hasUnsavedChanges,
        save,
        isSaving: saveStatus === 'saving',
    };
}