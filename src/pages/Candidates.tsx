import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import CandidateCard from '@/components/CandidateCard';
import BallotLoader from '@/components/BallotLoader';
import { Users, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Candidate {
  _id: string;
  name: string;
  party: string;
  photoUrl?: string;
  manifesto: string;
  votes: number;
}

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, hasVoted, setVoted } = useAuth();
  const { toast } = useToast();

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/candidates');
      setCandidates(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load candidates.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleVote = async (candidateId: string) => {
    try {
      await api.post('/votes', { candidateId });
      setVoted();
      
      // Update local state to reflect the vote
      setCandidates((prev) =>
        prev.map((c) =>
          c._id === candidateId ? { ...c, votes: c.votes + 1 } : c
        )
      );

      toast({
        title: 'Vote Cast Successfully!',
        description: 'Your vote has been recorded. Thank you for participating!',
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to cast vote.';
      toast({
        title: 'Voting Failed',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Election Candidates</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cast Your Vote
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {hasVoted
              ? 'Thank you for voting! You can view the current standings below.'
              : 'Review the candidates and cast your vote. Each voter can only vote once.'}
          </p>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCandidates}
            disabled={isLoading}
            className="mt-4 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Results
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <BallotLoader text="Loading candidates..." size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Failed to Load Candidates
            </h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchCandidates} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              No Candidates Yet
            </h3>
            <p className="text-muted-foreground">
              Check back later or register as a candidate.
            </p>
          </div>
        )}

        {/* Candidates Grid */}
        {!isLoading && !error && candidates.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {candidates.map((candidate, index) => (
              <div
                key={candidate._id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <CandidateCard
                  candidate={candidate}
                  onVote={handleVote}
                  hasVoted={hasVoted}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            ))}
          </div>
        )}

        {/* Voting Status */}
        {hasVoted && !isLoading && !error && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-success/10 text-success border border-success/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Your vote has been recorded</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
