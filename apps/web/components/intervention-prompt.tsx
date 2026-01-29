'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { respondToIntervention, type Intervention } from '@/lib/api';
import { MessageCircle, Check, X, MoreHorizontal, Send, Loader2 } from 'lucide-react';

interface InterventionPromptProps {
  intervention: Intervention;
  onResponded?: (intervention: Intervention) => void;
}

export function InterventionPrompt({ intervention, onResponded }: InterventionPromptProps) {
  const [textValue, setTextValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already responded - show the response
  if (intervention.status === 'responded') {
    return (
      <div className="bg-success-muted border border-success/20 rounded-md p-3 mt-3">
        <div className="flex items-center gap-2 text-success text-xs font-medium mb-1">
          <Check className="h-3.5 w-3.5" />
          Response submitted
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Your answer:</span> {intervention.response}
        </p>
      </div>
    );
  }

  // Skipped
  if (intervention.status === 'skipped') {
    return (
      <div className="bg-muted border rounded-md p-3 mt-3">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
          <X className="h-3.5 w-3.5" />
          Skipped
        </div>
      </div>
    );
  }

  const handleSubmit = async (response: string) => {
    if (!response.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await respondToIntervention(intervention.id, { response: response.trim() });
      onResponded?.(result.intervention);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await respondToIntervention(intervention.id, { skip: true });
      onResponded?.(result.intervention);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mt-3">
      <div className="flex items-start gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm font-medium">{intervention.prompt}</p>
      </div>

      {error && (
        <div className="text-xs text-destructive mb-3">{error}</div>
      )}

      {intervention.type === 'text_input' ? (
        <div className="space-y-2">
          <Input
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={intervention.placeholder || 'Enter your response...'}
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(textValue);
              }
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleSubmit(textValue)}
              disabled={isSubmitting || !textValue.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Submit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          </div>
        </div>
      ) : intervention.type === 'yes_no_other' ? (
        <div className="space-y-2">
          {!showOtherInput ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmit(intervention.yesLabel || 'Yes')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {intervention.yesLabel || 'Yes'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSubmit(intervention.noLabel || 'No')}
                disabled={isSubmitting}
              >
                {intervention.noLabel || 'No'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOtherInput(true)}
                disabled={isSubmitting}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                {intervention.otherLabel || 'Other...'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Describe your alternative..."
                disabled={isSubmitting}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(otherValue);
                  }
                  if (e.key === 'Escape') {
                    setShowOtherInput(false);
                    setOtherValue('');
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmit(otherValue)}
                  disabled={isSubmitting || !otherValue.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Submit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowOtherInput(false);
                    setOtherValue('');
                  }}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
